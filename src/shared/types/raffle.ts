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

export interface RaffleWithStats extends Raffle {
  available_count: number;
  en_espera_count: number;
  pendiente_count: number;
  pagado_count: number;
}