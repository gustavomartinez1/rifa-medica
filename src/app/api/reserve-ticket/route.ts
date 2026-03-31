import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const ReserveSchema = z.object({
  ticketIds: z.array(z.string().uuid()),
  buyerInfo: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().optional().or(z.literal('')),
    address: z.string().min(1),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ReserveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { ticketIds, buyerInfo } = parsed.data;

    // Create service role client for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uttlwwjzjssiykzkcemu.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dGx3d2p6anNzaXlremtjZW11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDg1MCwiZXhwIjoyMDkwNTAwODUwfQ.UjPX8jv7mRWkqjwCk8iKajB6zItLzNPoYCZyc95oFvc'
    );

    // Get current ticket states
    const { data: currentTickets, error: fetchError } = await supabase
      .from('tickets')
      .select('id, ticket_number, status')
      .in('id', ticketIds);

    if (fetchError) throw fetchError;

    // Check if any tickets are no longer available
    const unavailable = currentTickets?.filter(
      (t) => t.status !== 'disponible'
    );

    if (unavailable && unavailable.length > 0) {
      const takenNumbers = unavailable.map((t) => `#${t.ticket_number}`);
      return NextResponse.json({
        success: false,
        error: `Los boletos ${takenNumbers.join(', ')} ya fueron tomados por otro usuario`,
      });
    }

    // Reserve all tickets atomically
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data: updatedTickets, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'en_espera',
        reserved_at: new Date().toISOString(),
        reserved_expires_at: expiresAt,
        buyer_name: buyerInfo.name,
        buyer_phone: buyerInfo.phone,
        buyer_email: buyerInfo.email || null,
        buyer_address: buyerInfo.address,
      })
      .in('id', ticketIds)
      .eq('status', 'disponible') // Only update if still available
      .select();

    if (updateError) throw updateError;

    // Check if all tickets were updated
    if (!updatedTickets || updatedTickets.length !== ticketIds.length) {
      // Some tickets were taken while we were processing
      const takenCount = ticketIds.length - (updatedTickets?.length || 0);
      return NextResponse.json({
        success: false,
        error: `Algunos boletos ya no están disponibles. Por favor selecciona otros.`,
      });
    }

    return NextResponse.json({
      success: true,
      tickets: updatedTickets,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('Error reserving tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}