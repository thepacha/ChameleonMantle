'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';

interface StatTileProps {
  label: string;
  target: number;
  format: (val: number) => string;
  deltaText: string;
}

function AnimatedCounter({ target, duration = 1500, format }: { target: number; duration?: number; format: (val: number) => string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!active) return;
      if (!startTime) startTime = timestamp;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad: f(t) = t * (2 - t)
      const easedProgress = progress * (2 - progress);
      const currentValue = easedProgress * target;
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(step);

    return () => {
      active = false;
    };
  }, [target, duration]);

  return <>{format(count)}</>;
}

export function HeroStats({ isDark }: { isDark: boolean }) {
  const stats = [
    {
      label: 'Signal Accuracy',
      target: 74.2,
      format: (val: number) => `${val.toFixed(1)}%`,
      deltaText: '+0.3% today',
    },
    {
      label: 'vs Market Outperformance',
      target: 31.4,
      format: (val: number) => `+${val.toFixed(1)}%`,
      deltaText: '+1.8% vs last week',
    },
    {
      label: 'Signals Tracked',
      target: 4812,
      format: (val: number) => Math.floor(val).toLocaleString(),
      deltaText: '+128 updated 1h ago',
    },
    {
      label: 'Alpha Generated',
      target: 2.8,
      format: (val: number) => `$${val.toFixed(1)}M`,
      deltaText: '+$45K accumulated today',
    },
  ];

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b",
      isDark ? "border-[#1c1c1c] bg-[#0c0c0c]" : "border-[#e5e7eb] bg-white"
    )} id="performance-hero-strip">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={cn(
            "p-8 flex flex-col justify-between min-h-[190px]",
            isDark ? "border-[#1c1c1c]" : "border-[#e5e7eb]",
            // Bloomberg aesthetic: flat cells separated by borders
            idx > 0 ? "md:border-l" : "",
            idx > 1 ? "lg:border-l" : "",
            idx === 1 ? "max-md:border-t" : "",
            idx >= 2 ? "max-lg:border-t" : ""
          )}
          id={`hero-stat-card-${idx}`}
        >
          <div className={cn(
            "text-[72px] font-bold font-mono tracking-tighter leading-none",
            isDark ? "text-[#00ff88]" : "text-[#00aa5a]"
          )} id={`stat-value-${idx}`}>
            <AnimatedCounter target={stat.target} format={stat.format} />
          </div>
          <div className="mt-4">
            <span className={cn(
              "text-[12px] uppercase font-bold tracking-wider block font-sans",
              isDark ? "text-[#a0a0a0]" : "text-slate-500"
            )}>
              {stat.label}
            </span>
            <span className={cn(
              "text-[11px] font-mono tracking-tight block mt-1",
              isDark ? "text-[#666]" : "text-slate-400"
            )}>
              • {stat.deltaText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
