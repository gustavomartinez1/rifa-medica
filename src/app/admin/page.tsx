'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/shared/lib/supabase';
import { Ticket, Raffle } from '@/shared/types/ticket';
import { TICKET_STATES } from '@/config/constants';

type FilterStatus = 'all' | 'disponible' | 'en_espera' | 'pendiente' | 'pagado';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterRaffle, setFilterRaffle] = useState<string>('all');
  const [stats, setStats] = useState({
    disponible: 0,
    en_espera: 0,
    pendiente: 0,
    pagado: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use proper auth
    if (password === 'rifa2026segura' || password === 'rifa2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
    setPassword('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch raffles
      const { data: rafflesData } = await supabase.from('raffles').select('*').order('created_at');
      setRaffles(rafflesData || []);

      // Fetch all tickets
      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .order('raffle_id', { ascending: true })
        .order('ticket_number', { ascending: true });
      setTickets(ticketsData || []);

      // Calculate stats
      const newStats = { disponible: 0, en_espera: 0, pendiente: 0, pagado: 0 };
      ticketsData?.forEach((t) => {
        if (t.status in newStats) {
          newStats[t.status as keyof typeof newStats]++;
        }
      });
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: newStatus,
          paid_at: newStatus === 'pagado' ? new Date().toISOString() : null,
        })
        .eq('id', ticketId);

      if (error) throw error;
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Error al actualizar el boleto');
    }
  };

  const exportCSV = () => {
    const filteredTickets = tickets.filter((t) => {
      const statusMatch = filterStatus === 'all' || t.status === filterStatus;
      const raffleMatch = filterRaffle === 'all' || t.raffle_id === filterRaffle;
      return statusMatch && raffleMatch;
    });

    const csv = [
      ['Boleto', 'Rifa', 'Estado', 'Nombre', 'Teléfono', 'Email', 'Domicilio'].join(','),
      ...filteredTickets.map((t) => {
        const raffle = raffles.find((r) => r.id === t.raffle_id);
        return [
          t.ticket_number,
          raffle?.name || '',
          t.status,
          t.buyer_name || '',
          t.buyer_phone || '',
          t.buyer_email || '',
          t.buyer_address || '',
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rifa-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTickets = tickets.filter((t) => {
    const statusMatch = filterStatus === 'all' || t.status === filterStatus;
    const raffleMatch = filterRaffle === 'all' || t.raffle_id === filterRaffle;
    return statusMatch && raffleMatch;
  });

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Ingresa la contraseña para acceder</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Iniciar sesión
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Contraseña: rifa2026segura
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Panel Admin - Rifa Médica</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Disponibles</p>
            <p className="text-3xl font-bold text-green-600">{stats.disponible}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">En espera</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.en_espera}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Pendientes</p>
            <p className="text-3xl font-bold text-orange-600">{stats.pendiente}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-sm text-gray-500 mb-1">Vendidos</p>
            <p className="text-3xl font-bold text-gray-600">{stats.pagado}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Rifa</label>
              <select
                value={filterRaffle}
                onChange={(e) => setFilterRaffle(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todas las rifas</option>
                {raffles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Todos</option>
                <option value="disponible">Disponible</option>
                <option value="en_espera">En espera</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
              </select>
            </div>
            <div className="ml-auto">
              <button
                onClick={exportCSV}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">#</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rifa</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Comprador</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Teléfono</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Cargando...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No se encontraron boletos
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const raffle = raffles.find((r) => r.id === ticket.raffle_id);
                    const statusColors: Record<string, string> = {
                      disponible: 'bg-green-100 text-green-800',
                      en_espera: 'bg-yellow-100 text-yellow-800',
                      pendiente: 'bg-orange-100 text-orange-800',
                      pagado: 'bg-gray-100 text-gray-800',
                    };
                    return (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{ticket.ticket_number}</td>
                        <td className="px-6 py-4 text-gray-600">{raffle?.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{ticket.buyer_name || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{ticket.buyer_phone || '-'}</td>
                        <td className="px-6 py-4">
                          {ticket.status === 'pendiente' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'pagado')}
                              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                            >
                              Confirmar pago
                            </button>
                          )}
                          {ticket.status === 'en_espera' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'disponible')}
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              Liberar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}