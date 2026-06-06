'use client';

import React from 'react';
import { cn } from '@/src/lib/utils';
import { SIGNAL_TYPES, WALLET_DNA_ACCURACY } from './mockData';

export function AccuracyBreakdown({ isDark }: { isDark: boolean }) {
  // Format for Signal Types Chart Data
  const signalTypesData = SIGNAL_TYPES.map((item) => ({
    name: item.name,
    accuracy: item.accuracy,
    count: item.count,
    formattedLabel: `${item.name} (${item.count.toLocaleString()} sigs)`,
  }));

  // Format for Wallet DNA Accuracy Chart Data
  const walletDnaData = WALLET_DNA_ACCURACY.map((item) => ({
    name: item.name,
    accuracy: item.accuracy,
    formattedLabel: item.name,
  }));

  return (
    <div className={cn(
      "grid grid-cols-1 lg:grid-cols-2 border-b",
      isDark ? "border-[#1c1c1c] bg-[#0a0a0a]" : "border-[#e5e7eb] bg-white"
    )} id="performance-accuracy-breakdown">
      
      {/* Left Column - By Signal Type */}
      <div className={cn("p-8", isDark ? "border-[#1c1c1c]" : "border-[#e5e7eb]")} id="signal-type-accuracy-panel">
        <div className="mb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#666] font-mono block">
            Metric breakdown · 01
          </span>
          <h2 className={cn("text-[14px] uppercase font-bold tracking-wider mt-1", isDark ? "text-white" : "text-slate-900")}>
            Accuracy By Signal Type
          </h2>
          <p className={cn("text-[11px] font-mono mt-1", isDark ? "text-[#666]" : "text-slate-500")}>
            Success rate sorted by anomaly trigger category.
          </p>
        </div>

        {/* Custom Visual HTML list with accurate flat bars */}
        <div className="space-y-4" id="signal-type-bars">
          {signalTypesData.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1.5" id={`sig-type-row-${idx}`}>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className={cn("font-bold truncate max-w-[70%]", isDark ? "text-white" : "text-slate-800")}>{item.name}</span>
                <span className={cn("font-bold", isDark ? "text-[#00ff88]" : "text-[#00aa5a]")}>
                  {item.accuracy}% <span className="text-[#666] text-[10px]">({item.count.toLocaleString()} signals)</span>
                </span>
              </div>
              <div className={cn(
                "w-full h-5 border relative",
                isDark ? "bg-[#121212] border-[#191919]" : "bg-slate-100 border-slate-200"
              )}>
                <div
                  className={cn("h-full", isDark ? "bg-[#00ff88]" : "bg-[#00aa5a]")}
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column - By Wallet DNA Type */}
      <div className={cn(
        "p-8 max-lg:border-t lg:border-l",
        isDark ? "border-[#1c1c1c]" : "border-[#e5e7eb]"
      )} id="wallet-dna-accuracy-panel">
        <div className="mb-6">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#666] font-mono block">
            Metric breakdown · 02
          </span>
          <h2 className={cn("text-[14px] uppercase font-bold tracking-wider mt-1", isDark ? "text-white" : "text-slate-900")}>
            Accuracy By Wallet DNA Type
          </h2>
          <p className={cn("text-[11px] font-mono mt-1", isDark ? "text-[#666]" : "text-slate-500")}>
            Success rate sorted by underlying active wallet characteristics.
          </p>
        </div>

        {/* Custom list for Wallet DNA */}
        <div className="space-y-4" id="wallet-dna-bars">
          {walletDnaData.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1.5" id={`wallet-rna-row-${idx}`}>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className={cn("font-bold truncate max-w-[75%]", isDark ? "text-white" : "text-slate-800")}>{item.name}</span>
                <span className="text-[#ff6b35] font-bold">{item.accuracy}%</span>
              </div>
              <div className={cn(
                "w-full h-5 border relative",
                isDark ? "bg-[#121212] border-[#191919]" : "bg-slate-100 border-slate-200"
              )}>
                <div
                  className="h-full bg-[#ff6b35]"
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
