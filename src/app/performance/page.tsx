'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Info, Copy, Sun, Moon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Header } from '@/src/components/Header';
import { HeroStats } from '@/src/components/performance/HeroStats';
import { AccuracyBreakdown } from '@/src/components/performance/AccuracyBreakdown';
import { MarketComparison } from '@/src/components/performance/MarketComparison';
import { SignalLogTable } from '@/src/components/performance/SignalLogTable';
import { OnChainProof } from '@/src/components/performance/OnChainProof';

export default function PerformanceValidationCenter() {
  const [isDark, setIsDark] = useState(false); // Default to white theme (isDark = false)

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans relative transition-colors duration-250",
      isDark ? "bg-[#0a0a0a] text-white selection:bg-[#00ff88]/30" : "bg-white text-slate-900 selection:bg-[#00aa5a]/10"
    )}>
      
      {/* Unified Header */}
      <Header isDarkMode={isDark} toggleTheme={() => setIsDark(!isDark)} />

      {/* SUB HEADER AUDIT CALLOUT */}
      <div className={cn(
        "border-b px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 transition-colors",
        isDark ? "bg-[#0e0e0e] border-[#1c1c1c]" : "bg-slate-50 border-slate-200"
      )} id="audit-sub-header">
        <div className="flex items-center gap-2">
          <ShieldCheck className={cn("w-4 h-4", isDark ? "text-[#00ff88]" : "text-[#00aa5a]")} />
          <span className={cn(
            "text-[11px] font-mono font-bold tracking-tight uppercase",
            isDark ? "text-[#a0a0a0]" : "text-slate-600"
          )}>
            Validation protocol: <span className={isDark ? "text-white" : "text-slate-900"}>Active</span> · Sample size: <span className={isDark ? "text-white" : "text-slate-900"}>4,812 outputs</span> · Immutability validation: <span className={isDark ? "text-[#00ff88] font-bold" : "text-[#00aa5a] font-bold"}>Passed</span>
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#ff6b35] font-semibold flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#ff6b35]" />
          All data generated matches exact verifiable Mantle records.
        </div>
      </div>

      {/* CORE WORKSPACE CONTENT */}
      <main className={cn(
        "flex-grow flex flex-col transition-colors",
        isDark ? "bg-[#0a0a0a]" : "bg-slate-50/50"
      )} id="validation-workspace-hub">
        
        {/* Section 1: Hero stats row */}
        <HeroStats isDark={isDark} />

        {/* NOTE: Verifiable Signal Lifecycle (WorkflowDiagram) section has been deleted as requested */}

        {/* Section 2: Accuracy breakdown */}
        <AccuracyBreakdown isDark={isDark} />

        {/* Section 3: Market comparison AreaChart */}
        <MarketComparison isDark={isDark} />

        {/* Section 4: Real-time Signal log scrollable grid */}
        <SignalLogTable isDark={isDark} />

        {/* Section 5: On-chain Proof parameters */}
        <OnChainProof isDark={isDark} />

      </main>

      {/* FLAT DENSE STATUS FOOTER */}
      <footer className={cn(
        "border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono select-none transition-colors",
        isDark ? "bg-[#070707] border-[#1c1c1c] text-[#666]" : "bg-slate-50 border-slate-200 text-slate-500"
      )} id="validation-global-footer">
        <div>
          © 2026 CHAMELEON ALPHA · THE VERIFIABLE SIGNAL PLATFORM FOR MANTLE NETWORK
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-amber-600 cursor-pointer transition-colors">POLICIES</span>
          <span>·</span>
          <span className="hover:text-amber-600 cursor-pointer transition-colors">SECURITY SCHEMAS</span>
          <span>·</span>
          <span className="hover:text-amber-600 cursor-pointer transition-colors">LEDGER INTEGRITY AUDITS</span>
        </div>
      </footer>

    </div>
  );
}
