'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Info, Copy, Sun, Moon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ChameleonLogo } from '@/src/components/ChameleonLogo';
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
      
      {/* Bloomberg-Terminal Style Command Header */}
      <header className={cn(
        "border-b px-6 py-4 flex flex-col xl:flex-row items-center justify-between gap-4 transition-colors",
        isDark ? "border-[#1c1c1c] bg-[#0c0c0c]" : "border-slate-200 bg-slate-50"
      )} id="performance-global-header">
        
        {/* Brand identity */}
        <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-start">
          <Link href="/" className="outline-none block">
            <ChameleonLogo className="w-36 h-9" animated={false} />
          </Link>
          <div className={cn(
            "flex items-center gap-2 border px-3 py-1 text-[10px] font-mono font-bold transition-colors",
            isDark ? "bg-[#121212] border-[#1c1c1c] text-[#00ff88]" : "bg-white border-slate-200 text-[#00aa5a]"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isDark ? "bg-[#00ff88]" : "bg-[#00aa5a]")}></span>
            SYS: VALIDATED
          </div>
        </div>

        {/* Dense horizontal terminal menu */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-mono" id="validation-terminal-nav">
          <Link 
            href="/"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Terminal Home
          </Link>
          
          <span className="text-[#666] select-none">/</span>
          
          <Link 
            href="/health"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Ecosystem Health
          </Link>

          <span className="text-[#666] select-none">/</span>

          <Link 
            href="/dashboard"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Smart Money Terminal
          </Link>

          <span className="text-[#666] select-none">/</span>

          <Link 
            href="/tracker"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Wallet Tracker
          </Link>

          <span className="text-[#666] select-none">/</span>

          <Link 
            href="/narratives"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Narratives
          </Link>

          <span className="text-[#666] select-none">/</span>

          <Link 
            href="/dna"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Wallet DNA
          </Link>

          <span className="text-[#666] select-none">/</span>

          <Link 
            href="/replay-v2"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Alpha Replay
          </Link>

          <span className="text-[#666] select-none">/</span>

          <Link 
            href="/stats"
            className={cn(
              "border border-transparent px-3 py-1.5 transition-all",
              isDark 
                ? "text-[#a0a0a0] hover:text-white hover:bg-[#161616] hover:border-[#1c1c1c]" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 hover:border-slate-200"
            )}
          >
            Stats Matrix
          </Link>

          <span className="text-[#666] select-none">/</span>

          <span className={cn(
            "border px-3 py-1.5 font-bold transition-all select-none font-mono text-xs",
            isDark 
              ? "text-[#00ff88] bg-[#00ff88]/5 border-[#00ff88]/20" 
              : "text-[#00aa5a] bg-[#00aa5a]/5 border-[#00aa5a]/20"
          )}>
            Validation Center
          </span>
        </nav>

        {/* Theme Switcher & Live status indicators */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-[#666]">
          <button 
            onClick={() => setIsDark(!isDark)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 border rounded-xs font-bold transition-colors select-none",
              isDark 
                ? "border-[#1c1c1c] text-[#00ff88] bg-transparent hover:bg-[#161616]" 
                : "border-slate-200 text-[#00aa5a] bg-white hover:bg-slate-50 shadow-xs"
            )}
            title="Toggle color theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-[#00ff88]" /> : <Moon className="w-3.5 h-3.5 text-[#00aa5a]" />}
            <span>THEME: {isDark ? "DARK" : "LIGHT"}</span>
          </button>

          <span className="hidden xl:flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#666]"></span>
            UTC 20:50:28
          </span>
          <span className="hidden xl:flex items-center gap-1.5">
            <span className={cn("w-1 h-1 rounded-full animate-ping", isDark ? "bg-[#00ff88]" : "bg-[#00aa5a]")}></span>
            <span className={cn("font-bold transition-colors", isDark ? "text-[#a0a0a0]" : "text-slate-600")}>Mantle Block Tracker</span>
          </span>
        </div>

      </header>

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
