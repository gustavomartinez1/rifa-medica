'use client';

import { useState, useEffect } from 'react';
import { Ticket, BuyerInfo } from '@/shared/types/ticket';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { BANK_INFO, EXPIRATION_MINUTES } from '@/config/constants';

interface PurchaseFormProps {
  selectedTickets: Ticket[];
  onSubmit: (buyerInfo: BuyerInfo) => Promise<void>;
  isLoading?: boolean;
}

export function PurchaseForm({ selectedTickets, onSubmit, isLoading }: PurchaseFormProps) {
  const [formData, setFormData] = useState<BuyerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<BuyerInfo>>({});
  const [timeLeft, setTimeLeft] = useState<number>(EXPIRATION_MINUTES * 60);

  // Countdown timer
  useEffect(() => {
    if (selectedTickets.length === 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedTickets.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validate = () => {
    const newErrors: Partial<BuyerInfo> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'Domicilio es requerido';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const updateField = (field: keyof BuyerInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (selectedTickets.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Completar compra</h3>
        {timeLeft > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-yellow-700">
              Tiempo restante: {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Selected tickets summary */}
      <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
        <p className="font-medium text-emerald-800 mb-2">
          Boletos seleccionados:
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedTickets.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center px-3 py-1 bg-white border border-emerald-200 rounded-full text-sm font-medium text-emerald-700"
            >
              #{t.ticket_number}
            </span>
          ))}
        </div>
        <p className="mt-2 text-lg font-bold text-emerald-800">
          Total: ${selectedTickets.length * 50} MXN
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo"
          placeholder="Tu nombre completo"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          error={errors.name}
          required
        />
        
        <Input
          label="Teléfono"
          placeholder="449 123 4567"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          error={errors.phone}
          required
        />
        
        <Input
          label="Correo electrónico (opcional)"
          placeholder="tu@email.com"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={errors.email}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domicilio completo <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Calle, número, colonia, ciudad, CP"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            className={`
              w-full px-4 py-2 border rounded-lg transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1
              ${errors.address 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-emerald-500'
              }
            `}
            rows={3}
            required
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isLoading || timeLeft === 0}
        >
          {isLoading ? 'Reservando...' : 'Confirmar compra'}
        </Button>

        {timeLeft === 0 && (
          <p className="text-center text-red-600 text-sm">
            Tu sesión ha expirado. Por favor selecciona los boletos nuevamente.
          </p>
        )}
      </form>
    </div>
  );
}