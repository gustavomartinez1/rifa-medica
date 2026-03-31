'use client';

import { Ticket } from '@/shared/types/ticket';
import { BANK_INFO } from '@/config/constants';

interface PaymentInstructionsProps {
  tickets: Ticket[];
  onPaymentClaimed: () => void;
}

export function PaymentInstructions({ tickets, onPaymentClaimed }: PaymentInstructionsProps) {
  const total = tickets.length * 50;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header - compact on mobile */}
      <div className="text-center px-4 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full mb-3">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900">¡Boleto reservado exitosamente!</h3>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Tu boleto está reservado por 10 minutos. Realiza tu transferencia.
        </p>
      </div>

      {/* Bank transfer details - compact */}
      <div className="bg-gray-50 rounded-xl mx-4 md:mx-6 p-4 md:p-6 mb-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Datos para transferencia:</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Banco:</span>
            <span className="font-medium text-gray-900 text-sm">{BANK_INFO.bank}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">CLABE:</span>
            <span className="font-medium text-gray-900 font-mono text-sm">{BANK_INFO.clabe}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Titular:</span>
            <span className="font-medium text-gray-900 text-sm">{BANK_INFO.titular}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-gray-600 text-sm">Monto a pagar:</span>
            <span className="font-bold text-xl md:text-2xl text-emerald-600">${total} MXN</span>
          </div>
        </div>
      </div>

      {/* Selected tickets - compact */}
      <div className="mb-4 px-4 md:px-6">
        <p className="font-medium text-gray-700 mb-2 text-sm">Boletos reservados:</p>
        <div className="flex flex-wrap gap-1.5">
          {tickets.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center px-2.5 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-xs md:text-sm font-medium text-emerald-700"
            >
              #{t.ticket_number}
            </span>
          ))}
        </div>
      </div>

      {/* Claim payment button - STICKY at bottom on mobile */}
      <div className="px-4 pb-4 md:px-6 md:pb-6">
        <button
          onClick={onPaymentClaimed}
          className="w-full bg-emerald-600 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          Ya realicé mi pago
        </button>
      </div>

      {/* Contact info - compact */}
      <div className="text-center pb-4 md:pb-6">
        <p className="text-xs md:text-sm text-gray-500 mb-1">¿Tienes dudas?</p>
        <a
          href={`https://wa.me/${BANK_INFO.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
