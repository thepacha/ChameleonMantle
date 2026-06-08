"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Activity, 
  Shield, 
  Cpu, 
  TrendingUp, 
  ExternalLink, 
  Share2, 
  Search, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Wallet,
  Network,
  Sun,
  Moon,
  BarChart3,
  MessageSquare,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  DollarSign,
  User,
  Image as ImageIcon,
  Download,
  Copy,
  Layers,
  Terminal,
  Settings,
  Flame,
  Check
} from 'lucide-react';
import { Header } from '@/src/components/Header';
import { ChameleonLogo } from '@/src/components/ChameleonLogo';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '@/src/lib/utils';
import Link from 'next/link';
import { HISTORICAL_SIGNALS } from '@/src/lib/replay-data';
import { HistoricalSignal } from '@/src/types';

// Let's enrich our signal structures for the incredible features in v2
interface EnhancedHistoricalSignal extends HistoricalSignal {
  blockHeight: number;
  gasUsed: string;
  txMethodSignature: string;
  zScoreDistribution: number[]; // bell curve plot indices
  networkFeeUsd: number;
}

const ENHANCED_SIGNALS: EnhancedHistoricalSignal[] = HISTORICAL_SIGNALS.map((sig, idx) => ({
  ...sig,
  blockHeight: 65123984 + idx * 870,
  gasUsed: "148,432 Gwei",
  txMethodSignature: sig.type === 'SNIPER_BUY' ? 'swapExactTokensForTokens' : 'addLiquidityETH',
  zScoreDistribution: [-2.5, -2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
  networkFeeUsd: 12.45 + idx * 7.2
}));

function ReplayContentV2() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');
  
  // Find initial signal or use fallback
  const [selectedSignal, setSelectedSignal] = useState<EnhancedHistoricalSignal>(
    (ENHANCED_SIGNALS.find(s => s.id === initialId) || ENHANCED_SIGNALS[0]) as EnhancedHistoricalSignal
  );
  
  const [currentStage, setCurrentStage] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Autoplay Controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2500); // ms per step
  
  // Interactive Position Calculator State
  const [investmentAmount, setInvestmentAmount] = useState(1000); // USD
  
  // Share Customizer State
  const [shareConfig, setShareConfig] = useState({
    username: 'ChameleonAlpha',
    cardTheme: 'dark-neon', // 'dark-neon' | 'cyber-punk' | 'ghost-slate' | 'emerald'
    hasWatermark: true,
    showAddress: true
  });
  
  // Copy or download statuses
  const [hasCopied, setHasCopied] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  // Sync theme
  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Autoplay Effect
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStage((prev) => {
          if (prev >= 4) {
            setIsPlaying(false);
            return 4; // Stop at end
          }
          return prev + 1;
        });
      }, playSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playSpeed]);

  const stages = [
    { id: 0, title: 'Detection', subtitle: 'Anomalous Entry Detection', icon: AlertCircle, color: 'text-amber-500', glow: 'shadow-amber-500/20' },
    { id: 1, title: 'Capital Flow', subtitle: 'Visual Flow Map Playback', icon: Network, color: 'text-blue-500', glow: 'shadow-blue-500/20' },
    { id: 2, title: 'AI Reasoning', subtitle: 'On-chain Reasoning Nodes', icon: Cpu, color: 'text-emerald-500', glow: 'shadow-emerald-500/20' },
    { id: 3, title: 'Market Response', subtitle: 'Trading Price Execution', icon: Activity, color: 'text-purple-500', glow: 'shadow-purple-500/20' },
    { id: 4, title: 'Outcome', subtitle: 'PnL and Wallet Positions', icon: CheckCircle2, color: 'text-rose-500', glow: 'shadow-rose-500/20' },
  ];

  const handleShare = () => {
    setIsSharing(true);
    setHasDownloaded(false);
    setHasCopied(false);
  };

  const handleCopyLink = () => {
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownloadImage = () => {
    setHasDownloaded(true);
    setTimeout(() => {
      setHasDownloaded(false);
      setIsSharing(false);
    }, 1500);
  };

  // Interactive Calculations
  const calculatedReturn = useMemo(() => {
    const rawPnl = parseFloat(selectedSignal.stages.outcome.pnl.replace('%', '').trim());
    const finalAmount = investmentAmount * (1 + rawPnl / 100);
    const profitNet = finalAmount - investmentAmount;
    const tokensAcquired = Math.floor(investmentAmount / selectedSignal.initialPrice);
    const finalValue = tokensAcquired * selectedSignal.stages.marketResponse.peakPrice;
    const finalPnlValue = finalValue - investmentAmount;
    
    return {
      finalAmount: finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      profitNet: profitNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      tokensAcquired: tokensAcquired.toLocaleString(),
      finalValuePeak: finalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      peakProfitNet: finalPnlValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      isPositive: profitNet >= 0
    };
  }, [investmentAmount, selectedSignal]);

  // Normal distribution bell curve coordinates for render
  const generateBellCurvePath = () => {
    let points = [];
    const mean = 0;
    const standardDeviation = 1.2;
    for (let x = -4; x <= 4; x += 0.2) {
      // Normal distribution equation
      const y = (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / standardDeviation, 2));
      const svgX = ((x + 4) / 8) * 400; // Map -4..4 to 0..400
      const svgY = 150 - y * 300; // Map y coordinate inverted
      points.push(`${svgX},${svgY}`);
    }
    return `M ${points.join(' L ')}`;
  };

  // Compute standard visual position for target zscore inside distribution
  const targetZScoreX = useMemo(() => {
    // clamp between -4 and +5
    const score = Math.max(-4, Math.min(5, selectedSignal.stages.detection.zScore));
    return ((score + 4) / 9) * 400;
  }, [selectedSignal]);

  return (
    <div className={cn(
      "min-h-screen bg-app-bg text-app-fg p-4 md:p-6 flex flex-col gap-6 transition-colors duration-300",
      isDarkMode ? "dark" : ""
    )}>
      {/* Unified Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* Hero Control Console */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        <div className="flex-1 bg-app-card border border-app-border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
          {/* Subtle background abstract element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-app-emerald/5 rounded-full filter blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="p-3 bg-app-emerald/10 rounded-xl text-app-emerald relative">
              <History className="w-7 h-7" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-app-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-app-emerald"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-app-fg">Alpha Replay Engine</span>
                <span className="text-[10px] font-mono bg-app-zinc bg-app-card border border-app-border px-2 py-0.5 rounded text-app-zinc-text font-semibold uppercase">PRO PLATFORM</span>
              </div>
              <p className="text-xs text-app-zinc-text font-medium mt-1">Simulate historical anomalies, bridge settlement logs, and neural Claude foresight.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
             <div className="relative group w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-app-zinc-text" />
              <select 
                value={selectedSignal.id}
                onChange={(e) => {
                  const sig = ENHANCED_SIGNALS.find(s => s.id === e.target.value);
                  if (sig) setSelectedSignal(sig);
                  setCurrentStage(0);
                }}
                className="w-full bg-app-bg border border-app-border hover:border-app-emerald/50 rounded-xl py-2.5 pl-10 pr-8 text-xs focus:outline-none focus:border-app-emerald transition-all font-bold uppercase tracking-wider appearance-none cursor-pointer"
              >
                {ENHANCED_SIGNALS.map(s => (
                  <option key={s.id} value={s.id}>{s.token} — {s.typeName} ({s.time})</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-app-fg text-app-bg px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-app-emerald/5"
            >
              <Share2 className="w-4 h-4" />
              Generate Poster Card
            </button>
          </div>
        </div>
      </div>

      {/* Autoplay & Pro Timeline Scrubber */}
      <div className="bg-app-card border border-app-border rounded-2xl p-6 shadow-md relative overflow-hidden">
        {/* Hologram aesthetic lines */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-app-emerald/20 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-app-border/40">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-app-emerald animate-spin-slow" />
            <h2 className="text-xs font-black uppercase tracking-widest text-app-fg">Multi-Phase Signal Lifecycle Playback</h2>
          </div>
          
          {/* Simulation Controllers */}
          <div className="flex items-center gap-2.5 bg-app-bg/60 p-1.5 rounded-xl border border-app-border/80 self-stretch md:self-auto">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "p-2 rounded-lg transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider",
                isPlaying ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-app-emerald/15 text-app-emerald border border-app-emerald/20 hover:bg-app-emerald/25"
              )}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'PAUSE PLAYBACK' : 'START SIMULATION'}
            </button>

            <button 
              onClick={() => {
                setCurrentStage(0);
                setIsPlaying(false);
              }}
              className="p-2 rounded-lg bg-app-card border border-app-border text-app-zinc-text hover:text-app-fg hover:bg-app-card-hover transition-all"
              title="Reset Lifecycle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-app-border mx-1" />

            {/* Play Speed selector */}
            <select
              value={playSpeed}
              onChange={(e) => setPlaySpeed(Number(e.target.value))}
              className="bg-transparent border-none text-[10px] font-black uppercase font-mono tracking-wider focus:outline-none cursor-pointer text-app-zinc-text hover:text-app-fg"
            >
              <option value="4000">1.0x (Slow)</option>
              <option value="2500">1.5x (Normal)</option>
              <option value="1200">2.5x (Fast)</option>
            </select>
          </div>
        </div>

        {/* The Timeline Track with high contrast elements */}
        <div className="relative py-4 px-2 overflow-x-auto md:overflow-visible">
          <div className="relative h-18 min-w-[700px] md:min-w-0 flex items-center">
            {/* Progress Bar background */}
            <div className="absolute left-0 right-0 h-1.5 bg-app-bg border border-app-border rounded-full" />
            
            {/* Progress Bar active with glowing effect */}
            <motion.div 
              className="absolute left-0 h-1.5 bg-gradient-to-r from-app-emerald via-emerald-400 to-emerald-500 rounded-full z-10 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
              transition={{ type: 'spring', stiffness: 45 }}
            />

            {/* Timeline Nodes */}
            <div className="absolute inset-0 flex justify-between items-center px-4">
              {stages.map((stage) => {
                const Icon = stage.icon;
                const isActive = currentStage === stage.id;
                const isPast = currentStage > stage.id;

                return (
                  <button
                    key={stage.id}
                    onClick={() => {
                      setCurrentStage(stage.id);
                      setIsPlaying(false); // pause play when clicked manual
                    }}
                    className="relative z-20 group flex flex-col items-center outline-none cursor-pointer"
                  >
                    <motion.div 
                      className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                        isActive ? "bg-app-card border-app-emerald shadow-lg scale-110 ring-4 ring-app-emerald/10" : 
                        isPast ? "bg-app-emerald border-app-emerald text-white" : "bg-app-bg border-app-border text-app-zinc-text hover:text-app-fg"
                      )}
                      whileHover={{ scale: 1.12 }}
                    >
                      <Icon className={cn("w-4.5 h-4.5", isActive ? stage.color : "text-current")} />
                    </motion.div>
                    
                    <div className="absolute -bottom-8 whitespace-nowrap flex flex-col items-center">
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-tight transition-all",
                         isActive ? "text-app-fg scale-105" : "text-app-zinc-text"
                       )}>
                         {stage.title}
                       </span>
                       <span className="text-[7.5px] font-mono text-app-zinc-text uppercase tracking-tighter opacity-70 mt-0.5">
                          Phase {stage.id + 1}
                       </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Stage Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[580px]">
        {/* Left Interactive Panel */}
        <div className="lg:col-span-8 flex flex-col justify-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-app-card border border-app-border rounded-2xl p-6 md:p-8 shadow-md flex flex-col justify-between h-full"
            >
              
              {/* STAGE 1: DETECTION - WITH BELL-CURVE */}
              {currentStage === 0 && (
                <div className="flex flex-col gap-6 h-full justify-between">
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-12 bg-amber-500 rounded-full" />
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-app-fg">Stage 1: Anomaly Entry Detection</h3>
                          <p className="text-xs text-app-zinc-text font-medium uppercase tracking-wider">Initial block validation & deviation trigger score</p>
                        </div>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl font-mono font-black text-sm bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-md">
                        SIGNAL DEVIATION: +{selectedSignal.stages.detection.zScore} SD
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-10 gap-6 mt-6 items-center">
                      <div className="md:col-span-6 bg-app-bg border border-app-border p-5 rounded-2xl relative">
                        <div className="absolute top-3 right-3 text-[9px] font-mono font-bold text-amber-500 uppercase">
                          Standard Deviation Distribution
                        </div>
                        <h4 className="text-[10px] font-black uppercase text-app-zinc-text tracking-widest mb-4">Normal Z-Score Curve Mapping</h4>
                        
                        {/* Custom SVG Bell Curve */}
                        <div className="relative w-full h-40 flex items-end">
                          <svg className="w-full h-full text-app-border" viewBox="0 0 400 150">
                            <defs>
                              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <path 
                              d={generateBellCurvePath()} 
                              fill="none" 
                              stroke="var(--app-border)" 
                              strokeWidth={2} 
                            />
                            {/* Distribution Highlight */}
                            <path 
                              d={`${generateBellCurvePath()} L 400,150 L 0,150 Z`} 
                              fill="url(#curveGradient)"
                              opacity={0.3}
                            />
                            
                            {/* Standard deviations dashed lines */}
                            <line x1="80" y1="20" x2="80" y2="150" stroke="var(--app-border)" strokeDasharray="3,3" opacity={0.6} />
                            <line x1="200" y1="10" x2="200" y2="150" stroke="var(--app-border)" strokeDasharray="3,3" opacity={0.6} />
                            <line x1="320" y1="20" x2="320" y2="150" stroke="var(--app-border)" strokeDasharray="3,3" opacity={0.6} />
                            
                            {/* Deviation text */}
                            <text x="70" y="145" className="text-[9px] font-mono fill-app-zinc-text" fontSize="9">-2 SD</text>
                            <text x="190" y="145" className="text-[9px] font-mono fill-app-zinc-text" fontSize="9">Mean</text>
                            <text x="310" y="145" className="text-[9px] font-mono fill-app-zinc-text" fontSize="9">+2 SD</text>

                            {/* Signal pinpoint */}
                            <motion.line 
                              x1={targetZScoreX} 
                              y1="10" 
                              x2={targetZScoreX} 
                              y2="140" 
                              stroke="#f59e0b" 
                              strokeWidth={3}
                              className="shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              transition={{ duration: 0.5 }}
                            />
                          </svg>

                          {/* Glowing Dot overlay on the pinpoint curve */}
                          <div 
                            className="absolute bg-amber-500 w-3 h-3 rounded-full animate-ping shadow-[0_0_15px_rgba(245,158,11,0.9)]"
                            style={{ left: `${(targetZScoreX / 400) * 100}%`, top: '40%' }}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-4 flex flex-col gap-4">
                        <div className="bg-app-bg border border-app-border p-4 rounded-xl">
                          <h4 className="text-[9px] font-mono font-black uppercase text-app-zinc-text tracking-widest mb-2">Detection Insight</h4>
                          <p className="text-sm font-extrabold text-app-fg leading-snug">{selectedSignal.stages.detection.anomaly}</p>
                        </div>

                        <div className="bg-app-bg border border-app-border p-4 rounded-xl">
                          <h4 className="text-[9px] font-mono font-black uppercase text-app-zinc-text tracking-widest mb-3">Address Fingerprints</h4>
                          <div className="flex flex-col gap-2">
                            {selectedSignal.stages.detection.wallets.map(w => (
                              <div key={w} className="flex items-center justify-between bg-app-card border border-app-border px-3 py-1.5 rounded-lg hover:border-amber-500/30 transition-all">
                                <span className="text-[11px] font-mono font-bold text-app-fg">{w}</span>
                                <span className="text-[8px] font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/15 px-1 rounded">DEVIANT</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-app-border/40 flex justify-between items-center">
                    <div className="flex gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono font-black uppercase text-app-zinc-text">Event Height</span>
                        <span className="text-xs font-black text-app-fg font-mono">B#{selectedSignal.blockHeight}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono font-black uppercase text-app-zinc-text">Validator Gas Log</span>
                        <span className="text-xs font-black text-app-fg font-mono">{selectedSignal.gasUsed}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCurrentStage(1)}
                      className="group flex items-center gap-2 text-amber-500 font-black uppercase text-xs tracking-widest bg-amber-500/5 px-6 py-3 rounded-xl border border-amber-500/20 hover:bg-amber-500/10 transition-all font-mono"
                    >
                      FLOW ANIMATION <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: CAPITAL FLOW - SVG NODE FORCE FLOW NETWORK */}
              {currentStage === 1 && (
                <div className="flex flex-col gap-6 h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-12 bg-blue-500 rounded-full" />
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-app-fg">Stage 2: Capital Flow Map Playback</h3>
                          <p className="text-xs text-app-zinc-text font-medium uppercase tracking-wider">Tracing liquidity migration from cross-chain avenues</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono font-black bg-blue-500/10 text-blue-500 border border-blue-500/15 px-3 py-1.5 rounded-lg uppercase animate-pulse">
                        SIMULATION SPEED: {playSpeed === 1200 ? '2.5X ULTRA' : playSpeed === 2500 ? '1.5X STANDARD' : '1.0X ANALYTIC'}
                      </div>
                    </div>

                    <div className="bg-app-bg border border-app-border p-4 rounded-2xl mt-6 relative h-64 flex items-center justify-center overflow-hidden">
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none" />

                      {/* Floating glowing circle network */}
                      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        {/* Define glowing filters */}
                        <defs>
                          <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Interactive flow links */}
                        <motion.path 
                          d="M 120,130 Q 250,90 380,130" 
                          fill="none" 
                          stroke="rgb(59, 130, 246)" 
                          strokeWidth="2" 
                          strokeDasharray="4,4" 
                          opacity={0.6}
                        />
                        <motion.path 
                          d="M 380,130 Q 510,170 640,130" 
                          fill="none" 
                          stroke="rgb(16, 185, 129)" 
                          strokeWidth="2" 
                          strokeDasharray="4,4" 
                          opacity={0.6}
                        />

                        {/* Traveling capital pulses */}
                        <motion.circle 
                          r="5" 
                          fill="rgb(59, 130, 246)"
                          filter="url(#glowBlue)"
                        >
                          <animateMotion 
                            path="M 120,130 Q 250,90 380,130" 
                            dur="2s" 
                            repeatCount="indefinite" 
                          />
                        </motion.circle>

                        <motion.circle 
                          r="3.5" 
                          fill="rgb(16, 185, 129)" 
                        >
                          <animateMotion 
                            path="M 380,130 Q 510,170 640,130" 
                            dur="1.3s" 
                            repeatCount="indefinite" 
                          />
                        </motion.circle>
                      </svg>

                      {/* Node markers */}
                      <div className="absolute inset-0 flex justify-between items-center px-12 md:px-24">
                        {/* Source bridge */}
                        <motion.div 
                          className="flex flex-col items-center gap-2 relative z-10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                        >
                          <div className="w-14 h-14 rounded-2xl bg-app-card border-2 border-blue-500/40 flex items-center justify-center text-blue-500 shadow-xl">
                            <Layers className="w-6 h-6 animate-pulse" />
                          </div>
                          <span className="text-[9px] font-mono font-black uppercase text-app-zinc-text bg-app-card border border-app-border px-2 py-0.5 rounded shadow-sm">
                            SOURCE: {selectedSignal.stages.capitalFlow.source.split(' ')[0]}
                          </span>
                        </motion.div>

                        {/* Intermediate Swapper Pool */}
                        <motion.div 
                          className="flex flex-col items-center gap-2 relative z-10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="w-16 h-16 rounded-full bg-app-card border-2 border-app-emerald/40 flex items-center justify-center text-app-emerald shadow-2xl relative">
                            <Activity className="w-7 h-7" />
                            <span className="absolute -top-1 -right-1 bg-app-emerald text-[7.5px] font-mono font-black text-white px-1 py-0.5 rounded">
                              SWAP
                            </span>
                          </div>
                          <span className="text-[9px] font-mono font-black uppercase text-app-fg bg-app-card border border-app-border px-2 py-0.5 rounded shadow-sm">
                            PROTOCOL: {selectedSignal.stages.capitalFlow.target}
                          </span>
                        </motion.div>

                        {/* Accumulating Target Whales */}
                        <motion.div 
                          className="flex flex-col items-center gap-2 relative z-10"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <div className="w-14 h-14 rounded-2xl bg-app-card border-2 border-purple-500/40 flex items-center justify-center text-purple-500 shadow-xl">
                            <Wallet className="w-6 h-6" />
                          </div>
                          <span className="text-[9px] font-mono font-black uppercase text-app-zinc-text bg-app-card border border-app-border px-2 py-0.5 rounded shadow-sm">
                            TARGET: SM WALLETS
                          </span>
                        </motion.div>
                      </div>

                      {/* Net inbound statistic */}
                      <div className="absolute top-4 left-4 bg-app-card/90 backdrop-blur-md border border-app-border p-3 rounded-xl">
                        <span className="block text-[8px] font-mono uppercase text-app-zinc-text tracking-widest font-black">MIGRATION VOLUMETRICS</span>
                        <span className="text-base font-black text-blue-500 font-mono">{selectedSignal.stages.capitalFlow.inflow} NET USD</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-app-border/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <p className="text-xs text-app-zinc-text font-medium max-w-lg leading-relaxed">
                      Liquidity originated from secure bridge settlement channels. Cross-referenced transactions indicates instant routing to the <span className="text-app-fg font-bold">{selectedSignal.stages.capitalFlow.target}</span> liquidity pool address.
                    </p>
                    <button 
                      onClick={() => setCurrentStage(2)}
                      className="group flex items-center gap-2 text-blue-500 font-black uppercase text-xs tracking-widest bg-blue-500/5 px-6 py-3 rounded-xl border border-blue-500/20 hover:bg-blue-500/10 transition-all font-mono self-stretch md:self-auto text-center justify-center"
                    >
                      CLAUDE REASONING CORE <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: AI REASONING - CLAUDE LOGS */}
              {currentStage === 2 && (
                <div className="flex flex-col gap-6 h-full justify-between">
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-12 bg-emerald-500 rounded-full" />
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-app-fg">Stage 3: AI Neural Reasoning Output</h3>
                          <p className="text-xs text-app-zinc-text font-medium uppercase tracking-wider">Original predictive response compiled at time of signal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-black font-mono">
                        <Terminal className="w-3.5 h-3.5" /> CLAUDE-3.5-SONNET
                      </div>
                    </div>

                    <div className="bg-app-bg border border-app-border rounded-xl p-5 mt-6 font-mono text-xs relative overflow-hidden">
                      {/* Terminal header */}
                      <div className="flex items-center gap-1.5 pb-3 border-b border-app-border/40 mb-4 text-app-zinc-text text-[10px]">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                        <span className="ml-2 font-black uppercase tracking-widest text-[8px] text-app-zinc-text">NEURAL LOG: PRO_DEVIATION_AGENT</span>
                      </div>

                      <p className="text-app-fg leading-relaxed whitespace-pre-wrap">{selectedSignal.stages.aiReasoning.output}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6">
                        {selectedSignal.stages.aiReasoning.dataPoints.map((dp, idx) => (
                          <div key={idx} className="p-3.5 bg-app-card border border-app-border rounded-xl flex flex-col justify-between border-l-4 border-l-emerald-500">
                            <span className="text-[7.5px] font-black uppercase text-app-zinc-text tracking-widest">METRIC_NODE_0{idx+1}</span>
                            <span className="text-[11px] font-black text-app-fg mt-1 uppercase">{dp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-app-border/40 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono font-black uppercase text-app-zinc-text">Model Confidence Score</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xl font-black text-emerald-500 font-mono">{selectedSignal.stages.aiReasoning.confidence}%</span>
                        <Sparkles className="w-4 h-4 text-emerald-500 animate-[pulse_1.5s_infinite]" />
                      </div>
                    </div>
                    <button 
                      onClick={() => setCurrentStage(3)}
                      className="group flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest bg-emerald-500/5 px-6 py-3 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/10 transition-all font-mono"
                    >
                      MARKET PRICE REACTION <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: MARKET RESPONSE - CHARTS + VOLUME */}
              {currentStage === 3 && (
                <div className="flex flex-col gap-6 h-full justify-between">
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-12 bg-purple-500 rounded-full" />
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-app-fg">Stage 4: Market Response Execution</h3>
                          <p className="text-xs text-app-zinc-text font-medium uppercase tracking-wider">Trading price volatility correlation and volume spikes</p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/25 rounded-xl text-purple-500 text-xs font-black font-mono">
                        MAX DELTA: {selectedSignal.stages.marketResponse.priceChange}
                      </div>
                    </div>

                    {/* Integrated Price Area Chart and Volume Bar Chart below */}
                    <div className="bg-app-bg border border-app-border rounded-2xl p-4 mt-6">
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedSignal.stages.marketResponse.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorPriceV2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <XAxis 
                              dataKey="time" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 9, fill: '#8fa396', fontWeight: 600 }} 
                            />
                            <YAxis 
                              domain={['auto', 'auto']} 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 9, fill: '#8fa396', fontWeight: 600 }}
                              tickFormatter={(v) => `$${v.toFixed(selectedSignal.initialPrice < 5 ? 2 : 0)}`}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: isDarkMode ? '#161b22' : '#ffffff', borderRadius: '12px', border: '1px solid var(--app-border)', fontSize: '11px' }}
                            />
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <Area type="monotone" dataKey="price" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorPriceV2)" />
                            
                            {/* Visual cue for the AI signal fired block */}
                            <ReferenceDot 
                              x={selectedSignal.stages.marketResponse.chartData[2].time} 
                              y={selectedSignal.stages.marketResponse.chartData[2].price} 
                              r={6} 
                              fill="#10b981" 
                              stroke="#ffffff" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Volume Bar Chart Panel for pro aesthetic */}
                      <div className="h-14 w-full mt-2 border-t border-app-border/40 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={selectedSignal.stages.marketResponse.chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                            <XAxis dataKey="time" hide />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ backgroundColor: isDarkMode ? '#161b22' : '#ffffff', borderRadius: '12px', border: '1px solid var(--app-border)', fontSize: '11px' }}
                            />
                            <Bar dataKey="volume" fill={isDarkMode ? '#3f4f46' : '#bfdbfe'} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-app-border/40 flex justify-between items-center">
                    <div className="flex gap-6 font-mono text-xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-app-zinc-text">Accumulation Mean</span>
                        <span className="text-app-fg font-black">${selectedSignal.initialPrice}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-app-zinc-text">Peak Extent</span>
                        <span className="text-purple-500 font-black">${selectedSignal.stages.marketResponse.peakPrice}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCurrentStage(4)}
                      className="group flex items-center gap-2 text-purple-500 font-black uppercase text-xs tracking-widest bg-purple-500/5 px-6 py-3 rounded-xl border border-purple-500/20 hover:bg-purple-500/10 transition-all font-mono"
                    >
                      LEDGER POSITION OUTCOME <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 5: OUTCOME - WITH INTERACTIVE INVESTMENT POSITION CALCULATOR */}
              {currentStage === 4 && (
                <div className="flex flex-col gap-6 h-full justify-between">
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-12 bg-rose-500 rounded-full" />
                        <div>
                          <h3 className="text-xl font-black tracking-tight text-app-fg">Stage 5: Final Signal Outcome Ledger</h3>
                          <p className="text-xs text-app-zinc-text font-medium uppercase tracking-wider">Settled alpha ROI yields and intelligent position aftermaths</p>
                        </div>
                      </div>
                      <div className={cn(
                        "px-3.5 py-1.5 rounded-xl font-mono font-black text-xs border uppercase tracking-wider shadow-md text-white",
                        selectedSignal.status === 'hit' ? "bg-app-emerald border-app-emerald" : "bg-rose-500 border-rose-500"
                      )}>
                        {selectedSignal.status === 'hit' ? '🎯 VERIFIED OUTCOME: HIT' : '❌ VERIFIED OUTCOME: MISS'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Left: Stats & Interactive return calculator */}
                      <div className="bg-app-bg border border-app-border p-5 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] uppercase font-mono font-black text-app-zinc-text tracking-widest">PROPOSITION CALCULATOR</span>
                            <span className="text-[8px] font-mono text-app-zinc-text uppercase bg-app-card border border-app-border px-1.5 py-0.5 rounded">CUSTOM SIZE</span>
                          </div>

                          <div className="space-y-3">
                             <div className="flex flex-col gap-1">
                               <label className="text-[10px] font-mono font-bold text-app-zinc-text uppercase">Hypothetical Allocation Size (USD)</label>
                               <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-zinc-text font-bold font-mono text-xs">$</span>
                                  <input 
                                    type="number"
                                    value={investmentAmount}
                                    onChange={(e) => setInvestmentAmount(Math.max(1, Number(e.target.value)))}
                                    className="w-full bg-app-card border border-app-border rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-black focus:outline-none focus:border-app-emerald transition-all"
                                  />
                               </div>
                             </div>

                             <div className="pt-3 border-t border-app-border/40 grid grid-cols-2 gap-3 font-mono">
                                <div className="p-3 bg-app-card/60 border border-app-border rounded-xl">
                                  <span className="block text-[8px] font-bold text-app-zinc-text uppercase">EST. TOKENS BOUGHT</span>
                                  <span className="text-xs font-black text-app-fg">{calculatedReturn.tokensAcquired}</span>
                                </div>
                                <div className="p-3 bg-app-card/60 border border-app-border rounded-xl">
                                  <span className="block text-[8px] font-bold text-app-zinc-text uppercase">YIELD VALUE PEAK</span>
                                  <span className="text-xs font-black text-purple-500">${calculatedReturn.finalValuePeak}</span>
                                </div>
                             </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-app-border/40 mt-4">
                          <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-semibold text-app-zinc-text uppercase font-mono">Net Yield</span>
                            <span className={cn(
                              "text-3xl font-black font-mono tracking-tighter",
                              calculatedReturn.isPositive ? "text-app-emerald" : "text-rose-500"
                            )}>
                              {calculatedReturn.isPositive ? '+' : ''}${calculatedReturn.profitNet}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Smart money actions log */}
                      <div className="flex flex-col gap-4">
                        <div className="bg-app-bg border border-app-border p-4 rounded-xl flex-grow flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-mono font-black text-app-zinc-text uppercase tracking-widest block mb-2">Smart Money Behavior Aftermath</span>
                            <p className="text-xs font-extrabold text-app-fg leading-relaxed italic">
                              "{selectedSignal.stages.outcome.smartMoneyNextMoves}"
                            </p>
                          </div>
                          <div className="pt-4 mt-4 border-t border-app-border/40">
                             <span className="text-[9px] font-mono font-black text-app-zinc-text uppercase tracking-widest block mb-1">PRO POSITION SUGGESTION</span>
                             <span className="text-xs font-bold text-app-fg block">Ensure trailing stop-loss triggers stay above entry liquidity standard.</span>
                          </div>
                        </div>

                        <div className="bg-app-bg border border-app-border p-4 rounded-xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                               <Flame className="w-5 h-5 text-rose-500" />
                             </div>
                             <div>
                               <span className="text-[10px] font-bold block text-app-zinc-text uppercase tracking-wider">Final Return Rate</span>
                               <span className="text-sm font-black text-app-fg font-mono">{selectedSignal.stages.outcome.pnl}</span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-app-border/40 flex justify-between items-center">
                    <Link 
                      href="/dashboard"
                      className="group flex items-center gap-2 text-app-fg font-black uppercase text-xs tracking-widest bg-app-bg px-5 py-3 rounded-xl border border-app-border hover:bg-app-card-hover transition-all"
                    >
                      Back to live trading terminal
                    </Link>
                    <button 
                      onClick={() => setCurrentStage(0)}
                      className="group flex items-center gap-2 text-app-zinc-text font-black uppercase text-xs tracking-widest hover:text-app-fg transition-all font-mono"
                    >
                      RESTART PLAYBACK
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: On-chain Evidence Panel & Payload Decoder */}
        <div className="lg:col-span-4 flex flex-col justify-stretch">
           <div className="bg-app-card border border-app-border rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-app-border/40">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-app-emerald" />
                    <h2 className="text-[11px] font-black text-app-fg uppercase tracking-widest font-mono">ON-CHAIN LEDGER VERIFICATIONS</h2>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-app-bg text-[9px] font-mono font-bold text-app-zinc-text border border-app-border">
                     BLOCKCHAIN v2.0
                  </div>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                   {selectedSignal.evidence.map((ev) => (
                      <div 
                        key={ev.id} 
                        className="bg-app-bg border border-app-border p-3 rounded-xl hover:bg-app-card-hover hover:border-app-emerald/20 transition-all group cursor-pointer relative overflow-hidden"
                      >
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-mono font-black text-app-emerald bg-app-emerald/5 px-2 py-0.5 rounded border border-app-emerald/10 uppercase tracking-tighter">
                               {ev.type}
                            </span>
                            <span className="text-[10px] text-app-zinc-text优化 font-mono font-bold">{ev.timestamp}</span>
                         </div>
                         
                         <div className="flex justify-between items-center gap-1.5">
                            <div className="flex flex-col">
                               <span className="text-xs font-black text-app-fg font-mono">{ev.amount}</span>
                               <span className="text-[9px] font-mono text-app-zinc-text">{ev.address}</span>
                            </div>
                            <a 
                              href={`https://mantlescan.xyz/tx/${ev.hash}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-1.5 rounded-lg bg-app-card border border-app-border text-app-zinc-text hover:text-app-emerald hover:border-app-emerald/30 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                               <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                         </div>
                         {/* Background decoration */}
                         <div className="absolute right-0 bottom-0 opacity-[0.03] rotate-12 translate-x-2 translate-y-2 pointer-events-none">
                            <BarChart3 className="w-12 h-12" />
                         </div>
                      </div>
                   ))}
                </div>
              </div>

              {/* Payload decoders for pro presentation aspect */}
              <div className="mt-4 pt-4 border-t border-app-border/40">
                 <div className="bg-app-bg border border-app-border p-3.5 rounded-xl font-mono text-[9px]">
                    <div className="flex justify-between items-center text-app-zinc-text uppercase font-black text-[8px] mb-2.5">
                       <span>TRANSACTION CALL PAYLOAD</span>
                       <span className="text-app-emerald">COMPILED SUCCESS</span>
                    </div>
                    <div className="space-y-1.5 text-app-zinc-text">
                       <div><span className="text-app-fg font-bold">Block height:</span> {selectedSignal.blockHeight}</div>
                       <div><span className="text-app-fg font-bold">Call Signature:</span> {selectedSignal.txMethodSignature}(...)</div>
                       <div><span className="text-app-fg font-bold">Network fee:</span> ~${selectedSignal.networkFeeUsd.toFixed(2)} USD</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Share Poster Generating Card Customizer Overlay */}
      <AnimatePresence>
        {isSharing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-app-card border border-app-border rounded-3xl p-6 shadow-2xl max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative"
            >
               {/* Close button */}
               <button 
                 onClick={() => setIsSharing(false)}
                 className="absolute top-4 right-4 text-app-zinc-text hover:text-app-fg font-black text-sm p-1"
               >
                 ✕ Close
               </button>

               {/* Left Pane: Poster Preview */}
               <div className="flex flex-col justify-center items-stretch gap-4">
                  <span className="text-[10px] font-mono font-black text-app-zinc-text uppercase tracking-widest block text-center">PREVIEW POSTER GRAPHIC</span>
                  
                  {/* Dynamic generation preview container */}
                  <div className={cn(
                    "w-full aspect-[4/5] rounded-2xl p-5 text-left relative overflow-hidden flex flex-col justify-between border shadow-2xl",
                    shareConfig.cardTheme === 'dark-neon' ? "bg-slate-950 border-purple-500/30 text-white" :
                    shareConfig.cardTheme === 'cyber-punk' ? "bg-zinc-900 border-yellow-500/30 text-white" :
                    shareConfig.cardTheme === 'ghost-slate' ? "bg-stone-50 border-stone-200 text-stone-900" :
                    "bg-teal-950 border-emerald-500/30 text-white"
                  )}>
                     {/* Backdrop ambient color */}
                     {shareConfig.cardTheme === 'dark-neon' && <div className="absolute top-1/4 -right-1/4 w-44 h-44 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />}
                     {shareConfig.cardTheme === 'cyber-punk' && <div className="absolute bottom-1/4 -left-1/4 w-44 h-44 bg-yellow-600/20 rounded-full blur-2xl pointer-events-none" />}
                     {shareConfig.cardTheme === 'emerald' && <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />}

                     <div className="flex justify-between items-start relative z-10">
                        <ChameleonLogo className="w-24 h-6 opacity-40" />
                        <span className="text-[8px] font-mono font-black uppercase text-app-zinc-text">#ChameleonForecast</span>
                     </div>

                     <div className="relative z-10 my-auto py-2">
                        <span className="text-[8px] font-mono font-black uppercase bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
                           VERIFIED WINNER
                        </span>
                        <h4 className="text-xl font-black tracking-tight mt-1.5 uppercase leading-none">
                           {selectedSignal.token} {selectedSignal.typeName}
                        </h4>
                        <div className="text-[8px] font-mono uppercase text-app-zinc-text mt-1">
                           DETECTED AT BLOCK {selectedSignal.blockHeight}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-app-border/30 pt-3 font-mono">
                           <div>
                              <span className="block text-[7px] text-app-zinc-text uppercase font-black">YIELD DELTA</span>
                              <span className="text-lg font-black text-emerald-400">{selectedSignal.stages.outcome.pnl}</span>
                           </div>
                           <div>
                              <span className="block text-[7px] text-app-zinc-text uppercase font-black">CONFIDENCE</span>
                              <span className="text-lg font-black text-app-fg">{selectedSignal.confidence}%</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-between items-end border-t border-app-border/30 pt-3 relative z-10 text-[9px] font-mono">
                        <div>
                           <span className="block text-[6px] text-app-zinc-text uppercase font-black">Generated By</span>
                           <span className="font-bold text-app-fg opacity-80">@{shareConfig.username}</span>
                        </div>
                        {shareConfig.hasWatermark && (
                          <div className="text-[7px] font-mono font-black text-app-zinc-text uppercase tracking-widest italic opacity-50">
                             POWERED BY CHAMELEON
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right Pane: Controls / Customizers */}
               <div className="flex flex-col justify-between items-stretch">
                  <div className="space-y-4">
                     <h3 className="text-xl font-black tracking-tight text-app-fg">Poster Customizer</h3>
                     <p className="text-xs text-app-zinc-text font-medium">Tweak visual presets and watermark tags prior to publishing.</p>

                     <div className="space-y-3.5 pt-2">
                        {/* Custom username */}
                        <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono font-bold text-app-zinc-text uppercase">Custom Attribution Handle</label>
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-zinc-text font-mono">@</span>
                              <input 
                                type="text"
                                value={shareConfig.username}
                                onChange={(e) => setShareConfig({...shareConfig, username: e.target.value})}
                                className="w-full bg-app-bg border border-app-border rounded-xl pl-8 pr-3 py-2 text-xs font-bold focus:outline-none focus:border-app-emerald"
                              />
                           </div>
                        </div>

                        {/* Theme Selectors */}
                        <div className="flex flex-col gap-1">
                           <label className="text-[10px] font-mono font-bold text-app-zinc-text uppercase">Select Poster Theme</label>
                           <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: 'dark-neon', label: 'Twilight Orchid' },
                                { id: 'cyber-punk', label: 'Gold Cyberpunk' },
                                { id: 'ghost-slate', label: 'Clean Ivory' },
                                { id: 'emerald', label: 'Mantle Emerald' },
                              ].map((theme) => (
                                <button
                                  key={theme.id}
                                  onClick={() => setShareConfig({...shareConfig, cardTheme: theme.id})}
                                  className={cn(
                                    "px-3 py-2 rounded-xl text-left text-[11px] font-bold border transition-all cursor-pointer",
                                    shareConfig.cardTheme === theme.id ? "bg-app-emerald/10 border-app-emerald text-app-fg" : "bg-app-bg border-app-border text-app-zinc-text hover:bg-app-card-hover"
                                  )}
                                >
                                  {theme.label}
                                </button>
                              ))}
                           </div>
                        </div>

                        {/* Toggle properties */}
                        <div className="space-y-2">
                           <label className="flex items-center gap-2.5 cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={shareConfig.hasWatermark}
                                onChange={(e) => setShareConfig({...shareConfig, hasWatermark: e.target.checked})}
                                className="rounded text-app-emerald focus:ring-app-emerald"
                              />
                              <span className="text-[11px] font-semibold text-app-fg">Watermark 'Powered by Chameleon'</span>
                           </label>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-app-border/40 grid grid-cols-2 gap-3 font-mono">
                     <button
                       onClick={handleCopyLink}
                       className="flex items-center justify-center gap-2 bg-app-bg border border-app-border py-3 rounded-xl text-xs font-bold uppercase hover:bg-app-card-hover transition-all cursor-pointer"
                     >
                       {hasCopied ? <Check className="w-4 h-4 text-app-emerald" /> : <Copy className="w-4 h-4" />}
                       {hasCopied ? 'Link Copied!' : 'Copy Link'}
                     </button>
                     <button
                       onClick={handleDownloadImage}
                       className="flex items-center justify-center gap-2 bg-app-fg text-app-bg border border-transparent py-3 rounded-xl text-xs font-bold uppercase hover:opacity-90 transition-all cursor-pointer"
                     >
                       {hasDownloaded ? <Check className="w-4 h-4 text-app-emerald" /> : <Download className="w-4 h-4" />}
                       {hasDownloaded ? 'Saved!' : 'Download Card'}
                     </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReplayPageV2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-14 h-14 border-4 border-app-emerald border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono font-black uppercase tracking-widest text-app-zinc-text">Launching High-Fidelity Alpha Replay V2 Engine...</p>
        </div>
      </div>
    }>
      <ReplayContentV2 />
    </Suspense>
  );
}
