"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, 
  Fingerprint, 
  Network, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Layers, 
  Flame, 
  Activity, 
  CheckCircle2, 
  MousePointerClick, 
  ArrowUpRight, 
  Search, 
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Blocks,
  Sun,
  Moon
} from "lucide-react";
import { Header } from "@/src/components/Header";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

// Static mock profiles for the Interactive Sandbox (Section 3) to show immediate feature outcomes
const METADATA_WALLETS = [
  {
    address: "0xabc14298cf085b42d76a5b78f4ea492eb9c24942",
    tag: "Ape Sniper & LP Farmer",
    data: {
      classification: "Ape Sniper Core",
      confidenceScore: 94,
      pattern: "Instant Pool Ingress",
      summary: "This node targets freshly seeded liquidity vaults inside Agni Finance and Merchant Moe. Executes bulk stables swaps within 4.2 seconds of target block propagation.",
      convictionScore: 89,
      convictionLevel: "High Velocity",
      riskScore: 78,
      riskLevel: "Medium Risk",
      stats: { winRate: "81%", winPnl: "+$240k", activeDays: "142 Days" }
    }
  },
  {
    address: "0x44f9cf2e21bbda7c2901977cf923984ca903bccc",
    tag: "Liquid Staking Whale",
    data: {
      classification: "Custodial Whale Vault",
      confidenceScore: 98,
      pattern: "mETH Staking Vault",
      summary: "Maintains heavy capital reserves in core Mantle Treasury structures. Demonstrates continuous long-term mETH custody and low transaction frequency.",
      convictionScore: 95,
      convictionLevel: "Absolute Conviction",
      riskScore: 12,
      riskLevel: "Minimal Risk",
      stats: { winRate: "94%", winPnl: "+$720k", activeDays: "310 Days" }
    }
  },
  {
    address: "0x19adfa43bb1cc20e9871fcceaa77b94109ca37b1",
    tag: "MEV Arbitrage Bot",
    data: {
      classification: "HFT Sandwich Bot",
      confidenceScore: 96,
      pattern: "Flash Loan Arbitrage",
      summary: "Uses concentrated gas premiums to front-run slip blocks on volatile pools. Rebalances LP positions iteratively with instant high-frequency exits.",
      convictionScore: 72,
      convictionLevel: "Opportunistic",
      riskScore: 88,
      riskLevel: "High Risk",
      stats: { winRate: "92%", winPnl: "+$31k", activeDays: "450 Days" }
    }
  }
];

// Seed live blocks for Section 1 visual ticker
const MOCK_BLOCKS = [
  { block: "#284,912", event: "LP Pool Inbound", desc: "$1.2M USDC bridged from Mainnet to Symbiosis", type: "bridge" },
  { block: "#284,913", event: "Coordinated Swap", desc: "4 snipers acquired MEME in under 2.8s", type: "sniper" },
  { block: "#284,914", event: "Treasury Ingress", desc: "350k MNT reallocated to Agni concentration pool", type: "treasury" },
  { block: "#284,915", event: "Dormant Reactivation", desc: "Wallet 0x78c... active after 120 days of silence", type: "anomaly" }
];

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedSandboxAddress, setSelectedSandboxAddress] = useState(METADATA_WALLETS[0].address);
  const [sandboxCustomInput, setSandboxCustomInput] = useState("");
  const [sandboxIsLoading, setSandboxIsLoading] = useState(false);
  const [activeSandboxProfile, setActiveSandboxProfile] = useState<any>(METADATA_WALLETS[0].data);
  const [scannedLogs, setScannedLogs] = useState<any[]>(MOCK_BLOCKS);
  
  // Dynamic metrics
  const [syncedBlocksCount, setSyncedBlocksCount] = useState(284915);
  const [activeAnomaliesCount, setActiveAnomaliesCount] = useState(14);

  // Synchronize design theme
  useEffect(() => {
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (storedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Soft random updates to simulate block ticker
  useEffect(() => {
    const blockInterval = setInterval(() => {
      setSyncedBlocksCount(prev => prev + 1);
      if (Math.random() > 0.6) {
        setActiveAnomaliesCount(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      }
    }, 4500);
    return () => clearInterval(blockInterval);
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSandboxScan = (addressStr: string) => {
    setSandboxIsLoading(true);
    
    // Check if we have preset matching
    const matchingPreset = METADATA_WALLETS.find(
      w => w.address.toLowerCase() === addressStr.trim().toLowerCase()
    );

    setTimeout(() => {
      if (matchingPreset) {
        setActiveSandboxProfile(matchingPreset.data);
      } else {
        // Build beautiful robust fallback simulated analysis
        const isHex = addressStr.startsWith("0x") && addressStr.length === 42;
        const score = isHex ? Math.round(55 + (addressStr.charCodeAt(5) % 35)) : 68;
        setActiveSandboxProfile({
          classification: isHex ? "Active Ecosystem Node" : "Unverified Token Participant",
          confidenceScore: 81,
          pattern: "Standard Liquidity Allocation",
          summary: `This target wallet manifests transaction records indexing typical gas limits. No anomalous MEV cycles or large balance migrations were flagged inside active blocks.`,
          convictionScore: score,
          convictionLevel: score > 75 ? "Consistent Core" : "Transient Explorer",
          riskScore: Math.round(100 - score),
          riskLevel: score > 75 ? "Minimal" : "Medium",
          stats: { winRate: "58%", winPnl: "+$4,820", activeDays: "68 Active Days" }
        });
      }
      setSandboxIsLoading(false);
    }, 1250);
  };

  const currentSandboxRecord = METADATA_WALLETS.find(w => w.address === selectedSandboxAddress) || {address: sandboxCustomInput, tag: "Custom Node Query"};

  return (
    <div className={cn(
      "min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-all duration-150 flex flex-col font-sans overflow-x-hidden",
      isDarkMode ? "dark" : ""
    )}>
      
      {/* Universal Sticky Nav Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} dateRangeText="Forensic Radar Active" />

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center">

        {/* ==============================================
            SECTION 1: HERO (The Camouflage Breaker)
           ============================================== */}
        <section className="w-full relative py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-[var(--border)] overflow-hidden flex flex-col items-center" id="hero-camoflage-section">
          
          {/* Subtle glowing mesh backgrounds to set mood */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] h-[320px] bg-emerald-500/[0.045] dark:bg-emerald-500/[0.02] rounded-full blur-[120px] pointer-events-none select-none" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-purple-500/[0.035] dark:bg-purple-500/[0.015] rounded-full blur-[100px] pointer-events-none select-none" />

          {/* Subtitle Accent Badge */}
          <div className="flex bg-[var(--bg-surface)] border border-emerald-500/25 dark:border-emerald-500/15 rounded-full px-3 py-1 items-center gap-2 shadow-sm font-mono mb-6 md:mb-8 animate-fadeIn" id="hero-mini-banner">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#10B981] uppercase tracking-widest font-mono">
              Real-Time Mantle Block Telemetry Synchronized
            </span>
          </div>

          <div className="max-w-4xl w-full text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-zinc-900 dark:text-white" id="hero-title-header">
              Spot the smart capital of
              <span className="bg-gradient-to-r from-[#10B981] via-emerald-400 to-[#10B981] bg-clip-text text-transparent block md:inline md:pl-3">
                Mantle Blockchain.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] font-medium max-w-2xl mx-auto leading-relaxed" id="hero-subtitle">
              Crypto moves fast. Camouflaged capital moves faster. Chameleon intercepts live block sequences, identifies smart wallet DNA archetypes, and reveals system anomalies—before the chart reacts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4" id="hero-ctas">
              <Link href="/dashboard" className="w-full sm:w-auto bg-[#10B981] hover:bg-[#0da471] text-white font-extrabold px-8 py-3.5 rounded-xl text-sm tracking-wide transition-all shadow-md shadow-emerald-500/10 active:scale-95 text-center cursor-pointer uppercase">
                Launch Live Terminal
              </Link>
              <Link href="/dna" className="w-full sm:w-auto bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] font-bold px-8 py-3.5 rounded-xl text-sm tracking-wide transition-all active:scale-95 text-center cursor-pointer uppercase">
                Explore Wallet DNA
              </Link>
            </div>
          </div>

          {/* Block Telemetry Widget (Hero Visual) */}
          <div className="w-full max-w-5xl mt-16 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-xl p-5 overflow-hidden flex flex-col gap-4 relative" id="hero-pulse-board">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Activity className="w-4.5 h-4.5 text-[#10B981] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight font-mono">
                    CHAMELEON BLOCK PULSE
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase font-sans tracking-wide">
                    Live telemetry feed from Mantle Mainnet nodes
                  </p>
                </div>
              </div>

              {/* Status blocks info */}
              <div className="flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                <div className="bg-[var(--bg-base)] px-2.5 py-1 rounded border border-[var(--border)]">
                  Block Height: <span className="text-emerald-500">{syncedBlocksCount}</span>
                </div>
                <div className="bg-[var(--bg-base)] px-2.5 py-1 rounded border border-[var(--border)]">
                  Anomalies Registered: <span className="text-[#F59E0B]">{activeAnomaliesCount}</span>
                </div>
              </div>
            </div>

            {/* Simulated Live Block Logs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
              {MOCK_BLOCKS.map((col, idx) => (
                <div key={idx} className="bg-[var(--bg-base)] border border-[var(--border)] p-3.5 rounded-xl flex flex-col gap-1.5 hover:border-emerald-500/20 transition-all select-none">
                  <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                    <span className="text-[var(--text-muted)] font-extrabold font-mono">{col.block}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase font-sans border",
                      col.type === 'bridge' ? 'bg-blue-500/10 text-blue-500 border-blue-500/15' :
                      col.type === 'sniper' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/15' :
                      col.type === 'treasury' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15' :
                      'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/15'
                    )}>
                      {col.type}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wide leading-none text-[var(--text-primary)]">
                    {col.event}
                  </h4>
                  <p className="text-[10px] leading-relaxed text-[var(--text-secondary)] font-medium">
                    {col.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==============================================
            SECTION 2: THE SPECTRUM (Core Pillars)
           ============================================== */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-[var(--border)] bg-[var(--bg-surface)]" id="core-spectrum-section">
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            
            {/* Header text */}
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold text-[#10B981] font-mono uppercase tracking-widest block">
                INTELLIGENCE PILLARS
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white" id="spectrum-heading">
                UNVEILING THE ON-CHAIN SPECTRUM
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold max-w-lg mx-auto uppercase tracking-wide">
                Chameleon decodes raw Mantle block telemetry into three distinct streams of core intelligence
              </p>
            </div>

            {/* Responsive block grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="spectrum-bento-grid">
              
              {/* PILLAR 1 */}
              <div className="bento-card flex flex-col justify-between min-h-[300px]" id="pillar-anomaly">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center shrink-0 border border-[#F59E0B]/20">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                      Intelligent Anomaly Radar
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                      Continuous monitoring at block-level frequency. Chameleon calculates rolling Z-scores of gas volumes, scans pool boundaries for coordinated contract seeds, and detects instant pool slippage irregularities.
                    </p>
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-4 mt-6 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                  <span>LATENCY: &lt;1 BLOCK HEIGHT</span>
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                </div>
              </div>

              {/* PILLAR 2 */}
              <div className="bento-card flex flex-col justify-between min-h-[300px]" id="pillar-dna">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center shrink-0 border border-[#8B5CF6]/20">
                    <Fingerprint className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                      Cognitive Wallet DNA
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                      Stop digging through transaction tables manually. Chameleon aggregates holding periods, swap behaviors, and historical protocol frequencies to compile addresses into recognizable archetypes like Sniper or Whale.
                    </p>
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-4 mt-6 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B5CF6]">
                  <span>GEMINI COGNITIVE CORE</span>
                  <div className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                </div>
              </div>

              {/* PILLAR 3 */}
              <div className="bento-card flex flex-col justify-between min-h-[300px]" id="pillar-map">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <Network className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                      High-Fidelity Capital Flows
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                      Track the direct movements of deep liquidity. Watch heavy multi-sig bridge ingress, treasury reallocations, and large-amount counterpart allocations across Mantle hubs using interactive network graphs.
                    </p>
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-4 mt-6 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500">
                  <span>D3 DYNAMIC MODELING</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ==============================================
            SECTION 3: THE SANDBOX (Instant Interactive Scan)
           ============================================== */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-[var(--border)]" id="interactive-testing-sandbox">
          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            
            {/* Header copy */}
            <div className="w-full space-y-3">
              <span className="text-[10px] font-bold text-[#10B981] font-mono uppercase tracking-widest block text-center md:text-left">
                DEMONSTRATIVE SANDBOX
              </span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                    TRY INSTANT FORENSICS SCAN
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium max-w-xl">
                    Select one of our parsed block-active wallets below (or type a customized hex address) to run continuous DNA compiling and watch the AI profile generate.
                  </p>
                </div>
                <Link href="/dna" className="text-xs font-black uppercase tracking-wider text-[#10B981] hover:underline flex items-center gap-1 shrink-0 self-center md:self-end">
                  Open Advanced DNA Hub <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Core interactive playground */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 md:p-7 shadow-lg flex flex-col md:flex-row gap-6 items-stretch" id="sandbox-engine-card">
              
              {/* Left query board */}
              <div className="w-full md:w-[280px] flex flex-col justify-between shrink-0 gap-5">
                
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-[var(--text-muted)] block">
                    1. Select Target Wallet
                  </label>
                  
                  {/* Preset option buttons */}
                  <div className="flex flex-col gap-2">
                    {METADATA_WALLETS.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedSandboxAddress(item.address);
                          setSandboxCustomInput("");
                          handleSandboxScan(item.address);
                        }}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border flex flex-col text-xs transition-all relative cursor-pointer",
                          selectedSandboxAddress === item.address && !sandboxCustomInput
                            ? "border-[#10B981] bg-[#10B981]/[0.05] text-[var(--text-primary)] font-bold shadow-sm"
                            : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]"
                        )}
                      >
                        <span className="font-mono text-[10px] text-[var(--text-muted)] block leading-none">Preset Address {idx + 1}</span>
                        <span className="font-semibold text-[var(--text-primary)] mt-1.5 leading-none">{item.tag}</span>
                        <span className="font-mono text-[10px] mt-1 tabular-nums block text-[var(--text-muted)]">{item.address.slice(0, 10)}...{item.address.slice(-6)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom scanner input form */}
                <div className="space-y-3">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-[var(--text-muted)] block">
                    Or Enter Custom Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0x... (42-char hex)"
                      value={sandboxCustomInput}
                      onChange={(e) => {
                        setSandboxCustomInput(e.target.value);
                        setSelectedSandboxAddress("");
                      }}
                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-xl py-2 px-3 pl-8 text-xs font-mono focus:outline-none focus:border-[#10B981] placeholder:text-[var(--text-muted)] uppercase"
                    />
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  </div>

                  <button
                    onClick={() => {
                      if (sandboxCustomInput.trim()) {
                        handleSandboxScan(sandboxCustomInput);
                      }
                    }}
                    disabled={!sandboxCustomInput.trim() || sandboxIsLoading}
                    className="w-full h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] hover:border-[#10B981] hover:text-[#10B981] text-xs font-bold transition-all disabled:opacity-50 active:scale-97 cursor-pointer uppercase tracking-wider"
                  >
                    Scan Custom Target
                  </button>
                </div>

              </div>

              {/* Right compile board */}
              <div className="flex-grow bg-[var(--bg-base)] rounded-xl border border-[var(--border)] p-5 min-h-[340px] flex flex-col justify-between relative overflow-hidden" id="sandbox-intel-board">
                
                {/* Visual mesh matrix background */}
                <div className="absolute inset-0 select-none opacity-20 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px]" />

                <AnimatePresence mode="wait">
                  {sandboxIsLoading ? (
                    <motion.div
                      key="sandbox-loading-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 text-center z-10"
                    >
                      <RefreshCw className="w-10 h-10 text-[#10B981] animate-spin mb-4" />
                      <p className="text-[11px] font-mono uppercase font-black text-[#10B981] tracking-wider animate-pulse">
                        Sifting Block Transactions...
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase max-w-xs mt-1 leading-relaxed">
                        Compiling rolling metrics, contract counters, and generating Gemini forensic analysis profile.
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Profile rendering content */}
                <div className="relative z-10 w-full flex flex-col justify-between h-full gap-5">
                  <div className="space-y-4">
                    
                    {/* DNA Header indicator */}
                    <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                      <div>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] font-black uppercase block leading-none">
                          FORENSIC DNA PROFILE DECODED
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--text-primary)] uppercase truncate block max-w-[190px] sm:max-w-xs mt-1.5" title={currentSandboxRecord.address}>
                          {currentSandboxRecord.address.slice(0, 14)}...{currentSandboxRecord.address.slice(-10)}
                        </span>
                      </div>

                      {/* Spark Badge indicating compile confidence */}
                      <span className="text-[9px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/25 shrink-0 flex items-center gap-1 uppercase leading-none">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>{activeSandboxProfile.confidenceScore}% Acc</span>
                      </span>
                    </div>

                    {/* Classification Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5 bg-[var(--bg-surface)] border border-[var(--border)] p-2.5 rounded-lg">
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block leading-none">Archetype Classification</span>
                        <span className="text-xs font-black uppercase text-zinc-900 dark:text-white block mt-1 tracking-tight">
                          {activeSandboxProfile.classification}
                        </span>
                      </div>
                      <div className="space-y-0.5 bg-[var(--bg-surface)] border border-[var(--border)] p-2.5 rounded-lg">
                        <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block leading-none">Holding Action Pattern</span>
                        <span className="text-xs font-black uppercase text-zinc-900 dark:text-white block mt-1 tracking-tight">
                          {activeSandboxProfile.pattern}
                        </span>
                      </div>
                    </div>

                    {/* Witty AI Forensic summary block */}
                    <div className="bg-[var(--bg-surface)] border border-[var(--border)] p-3 rounded-xl">
                      <span className="text-[9px] font-mono text-[var(--text-muted)] font-bold uppercase block leading-none">Gemini Cognitive Commentary</span>
                      <p className="text-[11px] leading-relaxed italic text-[var(--text-secondary)] font-semibold mt-2.5 font-sans">
                        &quot;{activeSandboxProfile.summary}&quot;
                      </p>
                    </div>

                  </div>

                  {/* Dynamic Indicators footer */}
                  <div className="border-t border-[var(--border)] pt-3.5 flex items-center justify-between gap-3 flex-wrap">
                    
                    {/* Spark indicators */}
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <div>
                        <span className="text-[var(--text-muted)] uppercase font-bold">Win Rate: </span>
                        <span className="text-emerald-500 font-extrabold">{activeSandboxProfile.stats.winRate}</span>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] uppercase font-bold">Volume Delta: </span>
                        <span className="text-[var(--text-primary)] font-extrabold">{activeSandboxProfile.stats.winPnl}</span>
                      </div>
                    </div>

                    {/* Risk parameters */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono font-black text-[var(--text-muted)] uppercase">Risk:</span>
                      <span className={cn(
                        "text-[9px] font-mono font-bold border rounded px-2 py-0.5 uppercase leading-none",
                        activeSandboxProfile.riskLevel === "Minimal Risk" || activeSandboxProfile.riskLevel === "Minimal"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/15"
                          : activeSandboxProfile.riskLevel === "Medium Risk" || activeSandboxProfile.riskLevel === "Medium"
                          ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/15"
                          : "bg-red-500/10 text-red-500 border-red-500/15"
                      )}>
                        {activeSandboxProfile.riskLevel}
                      </span>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ==============================================
            SECTION 4: THE CHRONICLE (The Data Pipeline)
           ============================================== */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 border-b border-[var(--border)] bg-[var(--bg-surface)]" id="chronicle-hunt-pipeline">
          <div className="max-w-4xl mx-auto flex flex-col gap-10">
            
            {/* Header Title */}
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold text-[#10B981] font-mono uppercase tracking-widest block">
                ENGINE PIPELINE MAPPING
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white" id="pipeline-heading">
                CHRONICLE OF THE HUNT
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-semibold uppercase max-w-md mx-auto tracking-wide">
                How raw block packets convert into live visualizable alpha
              </p>
            </div>

            {/* Pipeline flowchart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative" id="pipeline-chart-flow">
              
              {/* CONNECTING HORIZONTAL LINE ON DESKTOP */}
              <div className="hidden md:block absolute top-[22px] left-1/6 right-1/6 h-[1px] bg-[var(--border)] z-0" />

              {/* STEP 1 */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl flex flex-col gap-3.5 relative z-10 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold font-mono flex items-center justify-center">01</span>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#10B981] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15 leading-none">JSON-RPC</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wide">
                    Mantle Telemetry Sync
                  </h4>
                  <p className="text-[11px] leading-relaxed text-[var(--text-secondary)] font-medium">
                    Continuous pipeline integration checking transaction blocks direct from RPC node providers. Captures transfer heights, contract interactions, gas caps and bridge allocations.
                  </p>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl flex flex-col gap-3.5 relative z-10 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[10px] font-bold font-mono flex items-center justify-center">02</span>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/15 leading-none">Radar Sort</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wide">
                    Z-Score Sorting
                  </h4>
                  <p className="text-[11px] leading-relaxed text-[var(--text-secondary)] font-medium">
                    Our anomaly engines categorize telemetry instantly. Sorts sudden pool volume spikes exceeding 3 standard deviations, fast LP limits sweeps, and dormant whale re-triggers.
                  </p>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl flex flex-col gap-3.5 relative z-10 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] text-[10px] font-bold font-mono flex items-center justify-center">03</span>
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded border border-[#8B5CF6]/15 leading-none">Cognitive Core</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wide">
                    Cognitive Synthesis
                  </h4>
                  <p className="text-[11px] leading-relaxed text-[var(--text-secondary)] font-medium">
                    Integrated Gemini processors compile wallet archetypes into human-readable action commentary. Assigns transaction win weights, risks parameters, and nests addresses in similar clusters.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ==============================================
            SECTION 5: CLAIM YOUR EDGE (CTA & FOOTER)
           ============================================== */}
        <section className="w-full py-16 sm:py-24 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-[#1E1E1E] to-[#121A15] text-white overflow-hidden flex flex-col items-center relative border-t border-[#10B981]/15" id="cta-completion-pane">
          
          {/* Subtle green ambient backing glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/[0.035] rounded-full blur-[100px] pointer-events-none select-none" />

          {/* Glowing central card */}
          <div className="max-w-3xl w-full text-center space-y-6 md:space-y-8 z-10 relative">
            <span className="text-[10px] font-bold text-[#10B981] font-mono uppercase tracking-widest block animate-pulse">
              Spot Camouflaged Capital
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1.1] text-white">
              Stop trading in the <span className="text-[#10B981]">blind spot.</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
              Mantle L2 liquidity aggregates fast. Whale wallets, sophisticated frontrunner arbitrage bots, and system protocol allocators are moving deep capital daily. Uncover them before they split the pool.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link href="/dashboard" className="w-full sm:w-auto bg-[#10B981] hover:bg-[#0da471] text-white font-extrabold px-8 py-3.5 rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md active:scale-95 text-center cursor-pointer">
                Claim Your Edge — Try Demo (Free)
              </Link>
            </div>
            
            {/* Divider */}
            <div className="border-t border-zinc-800/80 w-full pt-12 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-1 text-left">
              <div className="space-y-2 text-center md:text-left">
                <Link href="/" className="inline-block">
                  <img
                    src="https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon%20-%20BLACK%20BACKGROUND.svg"
                    alt="Chameleon Logo Minimalist"
                    className="h-10 object-contain mx-auto md:mx-0"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <p className="text-[10px] text-zinc-500 font-medium">
                  Cognitive smart money tracking terminal for the Mantle dynamic network ecosystem.
                </p>
              </div>

              {/* Minimal Directory map linkages */}
              <div className="flex items-center gap-6 text-[11px] font-mono text-zinc-400 font-semibold justify-center md:justify-end">
                <Link href="/" className="hover:text-emerald-500 transition-colors uppercase">Home</Link>
                <Link href="/dashboard" className="hover:text-emerald-500 transition-colors uppercase">Live Radar</Link>
                <Link href="/dna" className="hover:text-emerald-500 transition-colors uppercase">Behavioral DNA</Link>
                <Link href="/stats" className="hover:text-emerald-500 transition-colors uppercase">Stats Hub</Link>
              </div>
            </div>

            {/* Trademark notices */}
            <div className="pt-6 border-t border-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-mono text-zinc-650 text-center w-full">
              <span>Chameleon © 2026. Decentralized finance data aggregator. All systems operational.</span>
              <span className="text-[#10B981] font-bold">Mantle V3 Core Approved Block Telemetry</span>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
