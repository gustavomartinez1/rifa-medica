-- Migration: Create raffles and tickets tables for Rifa Médica
-- Created: 2026-03-30

-- Create raffles table
CREATE TABLE IF NOT EXISTS raffles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  prize_image_url TEXT,
  prize_details TEXT,
  total_tickets INTEGER DEFAULT 250,
  price_per_ticket INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'disponible' CHECK (status IN ('disponible', 'en_espera', 'pendiente', 'pagado')),
  reserved_at TIMESTAMPTZ,
  reserved_expires_at TIMESTAMPTZ,
  buyer_name TEXT,
  buyer_phone TEXT,
  buyer_email TEXT,
  buyer_address TEXT,
  payment_claimed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  paid_by_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(raffle_id, ticket_number)
);

-- Enable Row Level Security
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for raffles (public read)
CREATE POLICY "Anyone can read raffles" ON raffles
  FOR SELECT USING (true);

-- RLS Policies for tickets (public read, service write)
CREATE POLICY "Anyone can read tickets" ON tickets
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_raffle_id ON tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_raffle_status ON tickets(raffle_id, status);

-- Insert seed data for the 3 raffles
INSERT INTO raffles (name, description, prize_image_url, prize_details, total_tickets, price_per_ticket) VALUES
(
  'Amazon Echo Pop',
  'Bocina inteligente con Alexa, compatible con Amazon Music, Apple Music, Spotify y Bluetooth',
  '/images/Alexa.jpeg',
  'Modelo más reciente, color blanco',
  250,
  50
),
(
  'Samsung Galaxy A13',
  'Smartphone Samsung Galaxy A13 con excelentes especificaciones',
  '/images/Samsung_A13.jpeg',
  '128GB de almacenamiento, pantalla 6.6"',
  250,
  50
),
(
  'Collar con Aretes',
  'Elegante conjunto de collar con aretes en plata',
  '/images/CollarAretes.jpeg',
  'Diseño exclusivo, ideal para ocasiones especiales',
  250,
  50
)
ON CONFLICT DO NOTHING;

-- Insert tickets for each raffle (250 tickets each)
DO $$
DECLARE
  r RECORD;
  ticket_num INTEGER;
BEGIN
  FOR r IN SELECT id FROM raffles LOOP
    FOR ticket_num IN 1..250 LOOP
      INSERT INTO tickets (raffle_id, ticket_number, status)
      VALUES (r.id, ticket_num, 'disponible')
      ON CONFLICT (raffle_id, ticket_number) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Function to auto-expire reservations
CREATE OR REPLACE FUNCTION expire_ticket_reservations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE tickets
  SET status = 'disponible',
      reserved_at = NULL,
      reserved_expires_at = NULL,
      buyer_name = NULL,
      buyer_phone = NULL,
      buyer_email = NULL,
      buyer_address = NULL
  WHERE status = 'en_espera'
    AND reserved_expires_at < NOW();
END $$;

-- Schedule auto-expiration (runs every minute)
-- Note: This requires pg_cron extension or manual cron job
-- For now, we'll handle expiration on the client side