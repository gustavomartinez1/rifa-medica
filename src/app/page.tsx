'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/shared/lib/supabase';
import { HeroSection } from '@/features/hero/components/HeroSection';
import { CauseSection } from '@/features/cause/components/CauseSection';
import { RaffleCard } from '@/features/raffles/components/RaffleCard';
import { PurchaseForm } from '@/features/checkout/components/PurchaseForm';
import { PaymentInstructions } from '@/features/checkout/components/PaymentInstructions';
import { BankingInfo } from '@/features/banking/components/BankingInfo';
import { Footer } from '@/widgets/footer/Footer';
import { Modal } from '@/shared/ui/Modal';
import { Ticket, Raffle, BuyerInfo, ReserveTicketResponse, ClaimPaymentResponse } from '@/shared/types/ticket';
import { TICKET_STATES, EXPIRATION_MINUTES } from '@/config/constants';

type Step = 'raffles' | 'form' | 'payment' | 'confirmed';

interface RaffleWithTickets extends Raffle {
  tickets: Ticket[];
}

export default function Home() {
  const [raffles, setRaffles] = useState<RaffleWithTickets[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [step, setStep] = useState<Step>('raffles');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservedTicketIds, setReservedTicketIds] = useState<string[]>([]);
  const [showError, setShowError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch raffles and tickets
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rafflesData, error: rafflesError } = await supabase
          .from('raffles')
          .select('*')
          .order('created_at', { ascending: true });

        if (rafflesError) throw rafflesError;

        if (rafflesData) {
          const rafflesWithTickets = await Promise.all(
            rafflesData.map(async (raffle) => {
              const { data: tickets } = await supabase
                .from('tickets')
                .select('*')
                .eq('raffle_id', raffle.id)
                .order('ticket_number', { ascending: true });

              return { ...raffle, tickets: tickets || [] };
            })
          );
          setRaffles(rafflesWithTickets);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setShowError('Error al cargar las rifas. Por favor recarga la página.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('global-tickets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets',
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setRaffles((prev) =>
            prev.map((raffle) => ({
              ...raffle,
              tickets: raffle.tickets.map((t) =>
                t.id === payload.new.id ? (payload.new as Ticket) : t
              ),
            }))
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check for locally reserved tickets
  useEffect(() => {
    const stored = localStorage.getItem('reserved_ticket_ids');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setReservedTicketIds(ids);
      } catch (e) {
        console.error('Error parsing stored ticket IDs');
      }
    }
  }, []);

  const handleSelectTicket = (ticket: Ticket) => {
    if (ticket.status !== TICKET_STATES.DISPONIBLE) return;
    
    setSelectedTickets((prev) => {
      const exists = prev.some((t) => t.id === ticket.id);
      if (exists) {
        return prev.filter((t) => t.id !== ticket.id);
      }
      return [...prev, ticket];
    });
    setShowError(null);
  };

  const handleProceedToForm = () => {
    if (selectedTickets.length === 0) {
      setShowError('Selecciona al menos un boleto');
      return;
    }
    setStep('form');
  };

  const handleSubmitPurchase = async (buyerInfo: BuyerInfo) => {
    setIsSubmitting(true);
    setShowError(null);

    try {
      const ticketIds = selectedTickets.map((t) => t.id);

      const response = await fetch('/api/reserve-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds, buyerInfo }),
      });

      const result: ReserveTicketResponse = await response.json();

      if (!result.success) {
        if (result.error?.includes('tomado')) {
          const takenTickets = selectedTickets.filter(
            (t) => result.error?.includes(`#${t.ticket_number}`)
          );
          const availableTickets = selectedTickets.filter(
            (t) => !takenTickets.includes(t)
          );
          setSelectedTickets(availableTickets);
          setShowError(`Los boletos ${takenTickets.map((t) => t.ticket_number).join(', ')} ya fueron tomados.`);
        } else {
          setShowError(result.error || 'Error al reservar los boletos');
        }
        return;
      }

      localStorage.setItem('reserved_ticket_ids', JSON.stringify(ticketIds));
      setReservedTicketIds(ticketIds);
      setStep('payment');
    } catch (err) {
      console.error('Error reserving tickets:', err);
      setShowError('Error al procesar tu compra. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentClaimed = async () => {
    setIsSubmitting(true);
    setShowError(null);

    try {
      const reservedIds = reservedTicketIds.length > 0 ? reservedTicketIds : selectedTickets.map((t) => t.id);

      const response = await fetch('/api/claim-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketIds: reservedIds }),
      });

      const result: ClaimPaymentResponse = await response.json();

      if (!result.success) {
        setShowError(result.error || 'Error al confirmar el pago');
        return;
      }

      setStep('confirmed');
      localStorage.removeItem('reserved_ticket_ids');
      setReservedTicketIds([]);
      setSelectedTickets([]);
    } catch (err) {
      console.error('Error claiming payment:', err);
      setShowError('Error al confirmar el pago. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (step === 'confirmed') {
      setStep('raffles');
      setSelectedTickets([]);
      setReservedTicketIds([]);
    }
  };

  const scrollToRaffles = () => {
    const rafflesSection = document.getElementById('raffles-section');
    if (rafflesSection) {
      rafflesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen">
      <HeroSection onCtaClick={scrollToRaffles} />
      <CauseSection />

      <section id="raffles-section" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Las 3 Rifas</h2>
            <div className="w-24 h-1 bg-emerald-500 mx-auto rounded-full" />
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Elige tus boletos favoritos y participa para ganar premios increíbles
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {raffles.map((raffle) => (
                <RaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  selectedTickets={selectedTickets}
                  onSelectTicket={handleSelectTicket}
                  onDeselectTicket={handleSelectTicket}
                />
              ))}
            </div>
          )}

          {selectedTickets.length > 0 && step === 'raffles' && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 md:p-6 z-40">
              <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedTickets.length} boleto{selectedTickets.length > 1 ? 's' : ''} seleccionado{selectedTickets.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-500">Total: ${selectedTickets.length * 50} MXN</p>
                </div>
                <button
                  onClick={handleProceedToForm}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  Proceder al pago
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <BankingInfo />
      <Footer />

      <Modal isOpen={step === 'form' || step === 'payment' || step === 'confirmed'} onClose={handleCloseModal}>
        {step === 'form' && (
          <PurchaseForm selectedTickets={selectedTickets} onSubmit={handleSubmitPurchase} isLoading={isSubmitting} />
        )}
        {step === 'payment' && (
          <PaymentInstructions tickets={selectedTickets} onPaymentClaimed={handlePaymentClaimed} />
        )}
        {step === 'confirmed' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por el apoyo!</h3>
            <p className="text-gray-600 mb-6">Tu boleto ha sido confirmado.</p>
            <button onClick={handleCloseModal} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700">
              Cerrar
            </button>
          </div>
        )}
      </Modal>

      {showError && step === 'raffles' && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 max-w-sm">
          <p>{showError}</p>
          <button onClick={() => setShowError(null)} className="absolute top-2 right-2 text-white/80 hover:text-white">×</button>
        </div>
      )}
    </main>
  );
}