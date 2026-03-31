'use client';

import { useEffect, useState } from 'react';
import { RAFFLE_DATE } from '@/config/constants';

interface CountdownTimerProps {
  targetDate?: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const now = new Date();
  const difference = target.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({ targetDate = RAFFLE_DATE, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Segundos', value: timeLeft.seconds },
  ];

  return (
    <div className={`flex gap-3 md:gap-4 ${className}`}>
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-3 md:p-4 min-w-[70px] md:min-w-[90px] shadow-lg">
            <span className="text-2xl md:text-4xl font-bold block text-center">
              {String(unit.value).padStart(2, '0')}
            </span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-black/10" />
          </div>
          <span className="text-xs md:text-sm font-medium text-gray-600 mt-2">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}