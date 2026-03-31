import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const UpdateTicketSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(['disponible', 'en_espera', 'pendiente', 'pagado']),
  buyerInfo: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
    address: z.string().min(1),
  }).optional(),
});

export async function PUT(request: NextRequest) {
  try {
    // Simple password check (in production, use proper auth)
    const authHeader = request.headers.get('authorization');
    const expectedPassword = process.env.ADMIN_PASSWORD || 'rifa2026';
    
    if (authHeader !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = UpdateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    const { ticketId, status, buyerInfo } = parsed.data;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uttlwwjzjssiykzkcemu.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dGx3d2p6anNzaXlremtjZW11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDkyNDg1MCwiZXhwIjoyMDkwNTAwODUwfQ.UjPX8jv7mRWkqjwCk8iKajB6zItLzNPoYCZyc95oFvc'
    );

    const updateData: Record<string, unknown> = {
      status,
      paid_by_admin: status === 'pagado' && buyerInfo ? true : false,
    };

    if (status === 'pagado') {
      updateData.paid_at = new Date().toISOString();
    }

    if (buyerInfo) {
      updateData.buyer_name = buyerInfo.name;
      updateData.buyer_phone = buyerInfo.phone;
      updateData.buyer_email = buyerInfo.email || null;
      updateData.buyer_address = buyerInfo.address;
    }

    const { data: updatedTicket, error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}