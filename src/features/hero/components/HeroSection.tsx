'use client';

import { useState, useEffect } from 'react';
import { CountdownTimer } from './CountdownTimer';
import { Button } from '@/shared/ui/Button';
import { RAFFLE_DATE } from '@/config/constants';

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  const [raffleEnded, setRaffleEnded] = useState(false);

  useEffect(() => {
    const now = new Date();
    const raffleDate = new Date(RAFFLE_DATE);
    if (now > raffleDate) {
      setRaffleEnded(true);
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-emerald-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
        {/* Header badge */}
        {raffleEnded ? (
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            Rifa Terminada
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Rifa Benéfica
          </div>
        )}

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          {raffleEnded ? (
            <>
              ¡Gracias por apoyar a{' '}
              <span className="text-emerald-600">Felix!</span>
            </>
          ) : (
            <>
              Ayúdanos a recaudación fondos para el{' '}
              <span className="text-emerald-600">tratamiento médico de Felix</span>
            </>
          )}
        </h1>

        {/* Countdown or Result message */}
        <div className="mb-10">
          {raffleEnded ? (
            <div className="bg-emerald-100 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-xl text-emerald-800 font-semibold mb-2">¡El sorte ya se realizó!</p>
              <p className="text-emerald-700">Consulta los ganadores abajo</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">La rifa se realizará el:</p>
              <CountdownTimer />
              <p className="text-sm text-gray-500 mt-4">8 de Abril de 2026, 5:00 PM</p>
            </>
          )}
        </div>

        {/* CTA */}
        {!raffleEnded && (
          <Button size="lg" onClick={onCtaClick} className="shadow-xl hover:shadow-2xl">
            Ver rifas disponibles
          </Button>
        )}

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            100% de los fondos al tratamiento
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Datos bancarios verificados
          </div>
        </div>
      </div>
    </section>
  );
}