import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const ClaimPaymentSchema = z.object({
  ticketIds: z.array(z.string().uuid()),
  buyerInfo: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().optional(),
    address: z.string().min(1),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ClaimPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { ticketIds, buyerInfo } = parsed.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uttlwwjzjssiykzkcemu.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dGx3d2p6anNzaXlremtjZW11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDg1MCwiZXhwIjoyMDkwNTAwODUwfQ.UjPX8jv7mRWkqjwCk8iKajB6zItLzNPoYCZyc95oFvc'
    );

    // Get ticket info before updating (for WhatsApp message)
    const { data: ticketsBeforeUpdate } = await supabase
      .from('tickets')
      .select('*, raffles(name)')
      .in('id', ticketIds)
      .eq('status', 'en_espera');

    if (!ticketsBeforeUpdate || ticketsBeforeUpdate.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Los boletos ya no están en espera.',
      });
    }

    // Update tickets to pendiente
    const { data: updatedTickets, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'pendiente',
        payment_claimed_at: new Date().toISOString(),
      })
      .in('id', ticketIds)
      .eq('status', 'en_espera')
      .select();

    if (updateError) throw updateError;

    // Build WhatsApp message
    const raffleName = ticketsBeforeUpdate[0]?.raffles?.name || 'Rifa';
    const ticketNumbers = ticketsBeforeUpdate.map((t: { ticket_number: number }) => `#${t.ticket_number}`).join(', ');
    const total = ticketsBeforeUpdate.length * 50;
    const name = buyerInfo?.name || ticketsBeforeUpdate[0]?.buyer_name || 'N/A';
    const phone = buyerInfo?.phone || ticketsBeforeUpdate[0]?.buyer_phone || 'N/A';
    const email = buyerInfo?.email || ticketsBeforeUpdate[0]?.buyer_email || 'No proporcionado';
    const address = buyerInfo?.address || ticketsBeforeUpdate[0]?.buyer_address || 'N/A';

    const whatsappMessage = encodeURIComponent(
      `🎫 NUEVO PAGO CONFIRMADO\n\n` +
      `Rifa: ${raffleName}\n` +
      `Boleto(s): ${ticketNumbers}\n` +
      `Nombre: ${name}\n` +
      `Teléfono: ${phone}\n` +
      `Email: ${email}\n` +
      `Domicilio: ${address}\n` +
      `Monto: $${total} MXN\n` +
      `Estado: Pago confirmado por usuario`
    );

    return NextResponse.json({
      success: true,
      tickets: updatedTickets,
      whatsapp_url: `https://wa.me/524493873713?text=${whatsappMessage}`,
    });
  } catch (error) {
    console.error('Error claiming payment:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
