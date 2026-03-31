export type TicketStatus = 'disponible' | 'en_espera' | 'pendiente' | 'pagado';

export interface Ticket {
  id: string;
  raffle_id: string;
  ticket_number: number;
  status: TicketStatus;
  reserved_at: string | null;
  reserved_expires_at: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  buyer_email: string | null;
  buyer_address: string | null;
  payment_claimed_at: string | null;
  paid_at: string | null;
  paid_by_admin: boolean;
  created_at: string;
}

export interface Raffle {
  id: string;
  name: string;
  description: string | null;
  prize_image_url: string | null;
  prize_details: string | null;
  total_tickets: number;
  price_per_ticket: number;
  created_at: string;
}

export interface RaffleWithTickets extends Raffle {
  tickets: Ticket[];
  available_count: number;
  sold_count: number;
}

export interface BuyerInfo {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

export interface ReserveTicketResponse {
  success: boolean;
  ticket?: Ticket;
  expires_at?: string;
  error?: string;
}

export interface ClaimPaymentResponse {
  success: boolean;
  ticket?: Ticket;
  error?: string;
}