// App-wide constants
export const RAFFLE_DATE = new Date('2026-04-08T17:00:00-06:00'); // 8 de Abril 2026, 5:00 PM CST
export const RAFFLE_TIMEZONE = 'America/Mexico_City';

export const TICKET_PRICE = 50; // MXN
export const TOTAL_TICKETS = 250;

export const BANK_INFO = {
  bank: 'Citibanamex',
  clabe: '002010701881855826',
  titular: 'Gustavo Martinez Montes',
  whatsapp: '524493873713',
} as const;

export const TICKET_STATES = {
  DISPONIBLE: 'disponible',
  EN_ESPERA: 'en_espera',
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
} as const;

export const TICKET_COLORS = {
  disponible: '#22c55e', // green-500
  en_espera: '#eab308', // yellow-500
  pendiente: '#f97316', // orange-500
  pagado: '#9ca3af', // gray-400
} as const;

export const EXPIRATION_MINUTES = 10;

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rifa2026';

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};