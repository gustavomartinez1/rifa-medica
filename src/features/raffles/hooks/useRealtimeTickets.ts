'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/shared/lib/supabase';
import { Ticket } from '@/shared/types/ticket';

interface UseRealtimeTicketsOptions {
  raffleId: string;
}

export function useRealtimeTickets({ raffleId }: UseRealtimeTicketsOptions) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // Fetch initial tickets
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('raffle_id', raffleId)
          .order('ticket_number', { ascending: true });

        if (error) throw error;
        setTickets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`tickets-${raffleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `raffle_id=eq.${raffleId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTickets((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Ticket) : t
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [raffleId]);

  return { tickets, loading, error };
}