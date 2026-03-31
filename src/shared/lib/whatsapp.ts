import { BANK_INFO } from '@/config/constants';
import { Ticket } from '@/shared/types/ticket';

interface WhatsAppMessageData {
  tickets: Ticket[];
  buyerName: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerAddress: string;
  raffleName: string;
}

export function generateWhatsAppMessage(data: WhatsAppMessageData): string {
  const ticketNumbers = data.tickets.map((t) => `#${t.ticket_number}`).join(', ');
  const total = data.tickets.length * 50;

  return encodeURIComponent(
    `🎫 NUEVA RESERVA DE BOLETO\n\n` +
    `Rifa: ${data.raffleName}\n` +
    `Boleto(s): ${ticketNumbers}\n` +
    `Nombre: ${data.buyerName}\n` +
    `Teléfono: ${data.buyerPhone}\n` +
    `Email: ${data.buyerEmail || 'No proporcionado'}\n` +
    `Domicilio: ${data.buyerAddress}\n` +
    `Monto: $${total} MXN\n` +
    `Estado: Pago confirmado por usuario`
  );
}

export function getWhatsAppUrl(data: WhatsAppMessageData): string {
  const message = generateWhatsAppMessage(data);
  return `https://wa.me/${BANK_INFO.whatsapp}?text=${message}`;
}
