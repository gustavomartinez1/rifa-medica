'use client';

import { Ticket, Raffle } from '@/shared/types/ticket';
import { TICKET_STATES, TICKET_COLORS } from '@/config/constants';

interface TicketCellProps {
  ticket: Ticket;
  onSelect: (ticket: Ticket) => void;
  isSelected: boolean;
}

export function TicketCell({ ticket, onSelect, isSelected }: TicketCellProps) {
  const statusColors: Record<string, string> = {
    disponible: 'bg-green-500 hover:bg-green-600 cursor-pointer',
    en_espera: 'bg-yellow-400 cursor-not-allowed',
    pendiente: 'bg-orange-500 cursor-not-allowed',
    pagado: 'bg-gray-400 cursor-not-allowed',
  };

  const isAvailable = ticket.status === TICKET_STATES.DISPONIBLE;
  const isSelectedTicket = isSelected && isAvailable;

  return (
    <button
      onClick={() => isAvailable && onSelect(ticket)}
      disabled={!isAvailable}
      className={`
        relative w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200
        ${statusColors[ticket.status]}
        ${isSelectedTicket ? 'ring-4 ring-white ring-offset-2 ring-emerald-500 scale-110' : ''}
        ${isAvailable ? 'hover:scale-105 hover:shadow-md' : ''}
      `}
      title={`Boleto #${ticket.ticket_number} - ${ticket.status}`}
    >
      <span className="text-white drop-shadow-sm">{ticket.ticket_number}</span>
      
      {/* Status indicator */}
      {ticket.status !== TICKET_STATES.DISPONIBLE && (
        <span 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
          style={{ backgroundColor: TICKET_COLORS[ticket.status as keyof typeof TICKET_COLORS] }}
        />
      )}
    </button>
  );
}

interface TicketGridProps {
  tickets: Ticket[];
  selectedTickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

export function TicketGrid({ tickets, selectedTickets, onSelectTicket }: TicketGridProps) {
  // Group tickets in rows of 10 for better visualization
  const rows = [];
  for (let i = 0; i < tickets.length; i += 10) {
    rows.push(tickets.slice(i, i + 10));
  }

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center flex-wrap">
          {row.map((ticket) => (
            <TicketCell
              key={ticket.id}
              ticket={ticket}
              onSelect={onSelectTicket}
              isSelected={selectedTickets.some((t) => t.id === ticket.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface RaffleCardProps {
  raffle: Raffle & { tickets: Ticket[] };
  selectedTickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  onDeselectTicket: (ticket: Ticket) => void;
}

export function RaffleCard({ raffle, selectedTickets, onSelectTicket, onDeselectTicket }: RaffleCardProps) {
  const availableCount = raffle.tickets.filter((t) => t.status === TICKET_STATES.DISPONIBLE).length;
  const selectedRaffleTickets = selectedTickets.filter((t) => t.raffle_id === raffle.id);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Prize image */}
      <div className="relative aspect-video bg-gray-100">
        {raffle.prize_image_url ? (
          <img
            src={raffle.prize_image_url}
            alt={raffle.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
          $50 MXN
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{raffle.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{raffle.description}</p>
        
        {/* Stats */}
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            <span className="font-bold text-emerald-600">{availableCount}</span> disponibles
          </span>
          <span className="text-sm text-gray-600">
            <span className="font-bold text-gray-900">250</span> total
          </span>
        </div>

        {/* Selected tickets */}
        {selectedRaffleTickets.length > 0 && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-emerald-800 mb-2">
              Seleccionados: {selectedRaffleTickets.map((t) => t.ticket_number).join(', ')}
            </p>
            <p className="text-sm text-emerald-700">
              Total: ${selectedRaffleTickets.length * 50} MXN
            </p>
          </div>
        )}

        {/* Ticket grid */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Selecciona tus boletos:</p>
          <TicketGrid
            tickets={raffle.tickets}
            selectedTickets={selectedRaffleTickets}
            onSelectTicket={onSelectTicket}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded" /> Disponible
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-yellow-400 rounded" /> En espera
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-400 rounded" /> Vendido
          </span>
        </div>
      </div>
    </div>
  );
}