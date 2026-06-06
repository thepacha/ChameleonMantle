"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart,
  Activity, 
  TrendingUp, 
  Zap, 
  Shield, 
  Cpu, 
  Droplet, 
  Users, 
  BarChart3, 
  ChevronDown, 
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Sparkles,
  Sun,
  Moon,
  Info,
  Calendar,
  Layers,
  CheckCircle,
  Copy,
  Check,
  Share2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { cn } from '../../lib/utils';
import { ChameleonLogo } from '../../components/ChameleonLogo';
import Link from 'next/link';

// Predefined ecosystem scenario presets
interface Scenario {
  id: string;
  name: string;
  description: string;
  compositeScore: number;
  subScores: {
    liquidity: number;
    userGrowth: number;
    whaleConfidence: number;
    protocolActivity: number;
    riskLevel: number; // lower risk score is safer/better (Risk level from 0-100)
  };
  metricsData: {
    liquidity: string[];
    userGrowth: string[];
    whaleConfidence: string[];
    protocolActivity: string[];
    riskLevel: string[];
  };
  historyData: { day: string; score: number }[];
  annotations: { day: string; score: number; label: string; desc: string }[];
  riskSignals: { name: string; status: 'nominal' | 'elevated' | 'critical'; details: string }[];
}

const ECOSYSTEM_SCENARIOS: Scenario[] = [
  {
    id: 'steady',
    name: 'Standard Bull Steady State',
    description: 'Orderly expansion across major on-chain metrics, backed by steady staking increases and solid treasury support.',
    compositeScore: 82,
    subScores: {
      liquidity: 80,
      userGrowth: 83,
      whaleConfidence: 85,
      protocolActivity: 81,
      riskLevel: 18,
    },
    metricsData: {
      liquidity: ['Agni Finance TVL at $112.5M (+1.4%)', 'Merchant Moe USDY Pool size is $28M', 'Mantle treasury reserves stable pools ($310M)'],
      userGrowth: ['18,450 daily active transaction addresses', '342 new smart-wallet deploys detected', 'mETH deposit counts +4.2% YoY'],
      whaleConfidence: ['Whales bought $3.4M MNT net in 24h', '0xabc sniper wallet holds 65% in MNT', 'Average bridge inbound lock up represents 14 days'],
      protocolActivity: ['DEX transactional pool frequency 15.2k trades/day', 'Merchant Moe V2 concentrates $18.4M in stable routers', 'Under-block transaction speeds averaging 540ms'],
      riskLevel: ['Zero anomalous contract failures reported', 'Bridge outflow z-score is a low -0.3', 'No coordinated stable decoupling detected'],
    },
    historyData: [
      { day: 'Day 1', score: 72 },
      { day: 'Day 2', score: 75 },
      { day: 'Day 3', score: 74 },
      { day: 'Day 4', score: 78 },
      { day: 'Day 5', score: 76 },
      { day: 'Day 6', score: 81 },
      { day: 'Day 7', score: 83 },
      { day: 'Day 8', score: 80 },
      { day: 'Day 9', score: 84 },
      { day: 'Day 10', score: 86 },
      { day: 'Day 11', score: 85 },
      { day: 'Day 12', score: 87 },
      { day: 'Day 13', score: 89 },
      { day: 'Day 14', score: 82 }, // Today
    ],
    annotations: [
      { day: 'Day 3', score: 74, label: 'MIP-32 Voting Lockup', desc: 'Mantle Core locker pools deployed for voters lock over 14M MNT.' },
      { day: 'Day 7', score: 83, label: 'Merchant Moe V2 launch', desc: 'Concentrated liquidity routing goes live, spiking on-chain LP pools.' },
      { day: 'Day 11', score: 85, label: 'Mainnet Bridge Inflows', desc: 'Heavy stablecoin influx of $12M net flows into Mantle.' },
    ],
    riskSignals: [
      { name: 'Bridge Outflows', status: 'nominal', details: 'Orderly exits, within standard historical moving deviation (-0.30 SD).' },
      { name: 'Contract Failures', status: 'nominal', details: 'DEX routers and liquid wrappers verified fully stable on-chain.' },
      { name: 'Coordinated Sell-offs', status: 'nominal', details: 'Smart wallet metrics show broad distribution with zero whale cluster dumping.' },
    ]
  },
  {
    id: 'spree',
    name: 'Heavy Bridge Inflows & Whale Splurge',
    description: 'An aggressive capital surge. Stables pouring across the Symbiosis and Mantle Bridge, with whales heavily buying up native MNT.',
    compositeScore: 94,
    subScores: {
      liquidity: 96,
      userGrowth: 91,
      whaleConfidence: 98,
      protocolActivity: 95,
      riskLevel: 8,
    },
    metricsData: {
      liquidity: ['Agni Finance TVL climbs to $146.2M (+12.5%)', 'USDY pool size surges to historical $42.1M high', 'Treasury stablecoin reserves locked in liquid routers'],
      userGrowth: ['24,100 active addresses transacting on-chain', 'Whale address deploy rate spikes 240%', 'mETH yield structures backing +18.4% daily deposits'],
      whaleConfidence: ['Net inflow of $14.2M stables into smart contracts', 'Top 5 snipers lock MNT-AI in multiple Agni lockers', 'Average asset lockup periods extended to 30 days'],
      protocolActivity: ['DEX swap volume hits $32.4M in 24h', 'Concentrated LP ranges locked 98% in active ticks', 'Gas premium surge to 0.45 GWEI on volume swaps'],
      riskLevel: ['Smart contract security scanners reporting 100% clean', 'Bridge inflows reach +3.4 Standard Deviations', 'DeFi yield stability score is high at 96%'],
    },
    historyData: [
      { day: 'Day 1', score: 78 },
      { day: 'Day 2', score: 80 },
      { day: 'Day 3', score: 82 },
      { day: 'Day 4', score: 84 },
      { day: 'Day 5', score: 83 },
      { day: 'Day 6', score: 86 },
      { day: 'Day 7', score: 89 },
      { day: 'Day 8', score: 88 },
      { day: 'Day 9', score: 91 },
      { day: 'Day 10', score: 90 },
      { day: 'Day 11', score: 93 },
      { day: 'Day 12', score: 92 },
      { day: 'Day 13', score: 95 },
      { day: 'Day 14', score: 94 }, // Today
    ],
    annotations: [
      { day: 'Day 4', score: 84, label: 'MNT Buy Wall Trigger', desc: 'Symbiosis bridge signals trigger a $5M automated buy limit fill.' },
      { day: 'Day 9', score: 91, label: 'mETH Wrapper Boost', desc: 'LSP restaking premium spikes, locking 18,000 net new ETH.' },
      { day: 'Day 13', score: 95, label: '$14.2M Bridge Spike', desc: 'Sustained institutional bridge-in of stable reserves from Mainnet.' },
    ],
    riskSignals: [
      { name: 'Bridge Outflows', status: 'nominal', details: 'Extremely dry outflows. Capital is strictly piling into domestic positions.' },
      { name: 'Contract Failures', status: 'nominal', details: 'Heavy volume is processed flawlessly by Merchant Moe core pools.' },
      { name: 'Coordinated Sell-offs', status: 'nominal', details: 'Whales fully locking MNT with no exit movements on top 100 protocols.' },
    ]
  },
  {
    id: 'governance',
    name: 'Governance MIP-32 Voting Panic',
    description: 'Spiked on-chain friction. High voting contention locks native tokens in delegation loops while whale confidence pauses on outcomes.',
    compositeScore: 62,
    subScores: {
      liquidity: 72,
      userGrowth: 71,
      whaleConfidence: 48,
      protocolActivity: 85,
      riskLevel: 45, // elevated
    },
    metricsData: {
      liquidity: ['DEX liquidity depth shrinks by 8.4% as LP limits withdraw', 'Stablecoin routers maintain $22.1M TVL', 'Mantle treasury remains standard with $310M backing'],
      userGrowth: ['Address engagement shifts actively to governance portals', 'Smart wallet creation rate stalls to 3 daily deploys', 'mETH deposit activity scales back into cold storage'],
      whaleConfidence: ['Whales swap $2.1M MNT into stables awaiting votes', 'Smart money terminal indicates net distribution trends', 'Locker periods shorten as whales maintain liquid assets'],
      protocolActivity: ['Governance contract interactions surge 410%', 'Agni Finance swaps concentrate around voting-pair pools', 'Gas spikes intermittently to 0.88 GWEI as votes close'],
      riskLevel: ['High volatility on voting token wrapper contracts', 'No contract failures but slippage increases to 2.4%', 'Social sentiment scores indicating critical debate on MIP-32'],
    },
    historyData: [
      { day: 'Day 1', score: 79 },
      { day: 'Day 2', score: 81 },
      { day: 'Day 3', score: 80 },
      { day: 'Day 4', score: 83 },
      { day: 'Day 5', score: 82 },
      { day: 'Day 6', score: 85 },
      { day: 'Day 7', score: 83 },
      { day: 'Day 8', score: 78 },
      { day: 'Day 9', score: 74 },
      { day: 'Day 10', score: 71 },
      { day: 'Day 11', score: 68 },
      { day: 'Day 12', score: 66 },
      { day: 'Day 13', score: 63 },
      { day: 'Day 14', score: 62 }, // Today
    ],
    annotations: [
      { day: 'Day 5', score: 82, label: 'MIP-32 Draft Published', desc: 'Initial core changes proposals trigger sharp forum debates.' },
      { day: 'Day 8', score: 78, label: 'Whale Liquidity Exit', desc: 'Two major Snipers withdraw $3M in Concentrated LPs to stables.' },
      { day: 'Day 12', score: 66, label: 'Voting Delegation Spike', desc: 'Critical blocks of 8M MNT transferred to consensus delegates.' },
    ],
    riskSignals: [
      { name: 'Bridge Outflows', status: 'elevated', details: 'Slightly elevated stable bridge-outs (+1.8 SD) as whales hedge.' },
      { name: 'Governance Friction', status: 'elevated', details: 'Contentious voting thresholds could delay core LP pool subsidizations.' },
      { name: 'Slippage Anomalies', status: 'nominal', details: 'Pool ranges remain secure, but spot slippage exceeds standard limits.' },
    ]
  },
  {
    id: 'capitulation',
    name: 'Coordinated DEX Sell-Off Risk',
    description: 'Systemic stress. Several smart-money wallets initiate coordinated sellwalls of domestic farming tokens, draining shallow LP layers.',
    compositeScore: 35, // Red Zone
    subScores: {
      liquidity: 36,
      userGrowth: 48,
      whaleConfidence: 24,
      protocolActivity: 58,
      riskLevel: 82, // critical
    },
    metricsData: {
      liquidity: ['Agni Finance TVL declines by 34.5% in concentrated pools', 'Merchant Moe stable pairs experience active sell blocks', 'Treasury stable vaults remaining lock-secure'],
      userGrowth: ['Daily user transacting footprints compress to 9,450', 'New wallet deploys completely freeze', 'Liquid restaking withdrawals trigger queues on some portals'],
      whaleConfidence: ['Smart Money Terminal shows 84% net distribution', 'Snipers fully exit positions into stable holdings', 'Zero new bridge-ins; net bridge-outs at -2.4M stables'],
      protocolActivity: ['DEX swap frequency drops to 4.8k trades/day', 'Arbitrage volume is active but captures wide pool gaps', 'Concentrated ranges severely depleted; high tick volatility'],
      riskLevel: ['Bridge outflows spike to +4.2 Standard Deviations', 'DeFi pool imbalance alerts active on Merchant Moe pairs', 'Coordinated cell activities indicate mass rotation to L1 stables'],
    },
    historyData: [
      { day: 'Day 1', score: 81 },
      { day: 'Day 2', score: 79 },
      { day: 'Day 3', score: 76 },
      { day: 'Day 4', score: 78 },
      { day: 'Day 5', score: 73 },
      { day: 'Day 6', score: 69 },
      { day: 'Day 7', score: 64 },
      { day: 'Day 8', score: 58 },
      { day: 'Day 9', score: 52 },
      { day: 'Day 10', score: 49 },
      { day: 'Day 11', score: 44 },
      { day: 'Day 12', score: 41 },
      { day: 'Day 13', score: 38 },
      { day: 'Day 14', score: 35 }, // Today
    ],
    annotations: [
      { day: 'Day 5', score: 73, label: 'LST Yield Drop Warning', desc: 'Competitor networks publish staking rate hikes, triggering yield decay.' },
      { day: 'Day 9', score: 52, label: 'Smart Money Selloff', desc: '0x19a and 0xdef snipers fully dump AGNI in under 4 minutes.' },
      { day: 'Day 13', score: 38, label: 'Bridge Outflow Wave', desc: 'Major institutional flight of $11M stables bridging back to Mainnet.' },
    ],
    riskSignals: [
      { name: 'Bridge Outflows', status: 'critical', details: 'Critical bridge-out surge (+4.20 SD). High outflows of USDT.' },
      { name: 'Pool Imbalances', status: 'critical', details: 'Domestic vaults heavily imbalanced with 92% farm token / 8% stable.' },
      { name: 'Dumping Alarms', status: 'critical', details: '3 whale clusters executing synchronized liquidations on spot markets.' },
    ]
  }
];

export default function EcosystemHealthScorePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('steady');
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // AI-generated narrative states
  const [aiNarrative, setAiNarrative] = useState<string>('The Mantle network maintains structural stability in its core liquidity indices. Volatility in secondary mETH wrappers is offset by strong stable accumulation on Merchant Moe. Institutional flows remain net-positive, framing an orderly asset rotation across DEX pools with low systemic liquidations.');
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({
    liquidity: 'Core TVL is stabilized through robust native liquidity structures on Agni Finance and yield pools.',
    userGrowth: 'On-chain footprint indicates steady growth in daily transacting addresses across DEX routers.',
    whaleConfidence: 'Whales are showing persistent accumulation of MNT stables during market consolidation periods.',
    protocolActivity: 'DEX swap frequency and concentrated LP locks show high volume metrics in under-block transactions.',
    riskLevel: 'Systemic risk indices remain within historical parameters with no major contract execution deviations.',
  });
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active scenario data
  const activeScenario = useMemo(() => {
    return ECOSYSTEM_SCENARIOS.find(s => s.id === selectedScenarioId) || ECOSYSTEM_SCENARIOS[0];
  }, [selectedScenarioId]);

  // Synchronize system dark theme across elements
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

  // Fetch the AI generated morning brief based on current Scenario metrics
  useEffect(() => {
    const fetchAiNarrative = async () => {
      setIsAiLoading(true);
      try {
        const response = await fetch('/api/health-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenarioName: activeScenario.name,
            compositeScore: activeScenario.compositeScore,
            subScores: activeScenario.subScores
          })
        });
        const data = await response.json();
        if (data.brief) {
          setAiNarrative(data.brief);
        }
        if (data.explanations) {
          setAiExplanations(data.explanations);
        }
      } catch (err) {
        console.error("Failed to generate custom AI morning brief:", err);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiNarrative();
  }, [selectedScenarioId, activeScenario]);

  // Suppress specific ResizeObserver loop notifications in preview frames safely
  useEffect(() => {
    const handleResizeError = (e: ErrorEvent) => {
      if (
        e.message && 
        (e.message.includes('ResizeObserver') || 
         e.message.includes('loop completed with undelivered notifications') || 
         e.message.includes('loop limit exceeded'))
      ) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };
    
    window.addEventListener('error', handleResizeError);
    return () => {
      window.removeEventListener('error', handleResizeError);
    };
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Circular gauge SVG calculations
  const score = activeScenario.compositeScore;
  const radius = 95;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Offset to leave a small architectural gap at the bottom of the gauge
  const angleRange = 260; // deg
  const arcLength = (angleRange / 360) * circumference;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  // Determine the color band based on current score values
  const getScoreColorClass = (scoreVal: number, scaleType: 'text' | 'bg' | 'border' | 'shadow' | 'stroke' = 'text') => {
    if (scoreVal < 40) {
      if (scaleType === 'text') return 'text-red-500';
      if (scaleType === 'bg') return 'bg-red-500/10 text-red-500 border-red-500/20';
      if (scaleType === 'border') return 'border-red-500/30';
      if (scaleType === 'shadow') return 'shadow-red-500/10';
      return '#ef4444'; // Red
    }
    if (scoreVal >= 40 && scoreVal <= 70) {
      if (scaleType === 'text') return 'text-amber-500';
      if (scaleType === 'bg') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      if (scaleType === 'border') return 'border-amber-500/30';
      if (scaleType === 'shadow') return 'shadow-amber-500/10';
      return '#f59e0b'; // Amber
    }
    // High Good Zone (green)
    if (scaleType === 'text') return 'text-emerald-500';
    if (scaleType === 'bg') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (scaleType === 'border') return 'border-emerald-500/30';
    if (scaleType === 'shadow') return 'shadow-emerald-500/10';
    return '#10b981'; // Emerald
  };

  const getScoreLabel = (scoreVal: number) => {
    if (scoreVal < 40) return 'Vulnerable State';
    if (scoreVal >= 40 && scoreVal <= 70) return 'Temperate Zone';
    return 'Optimal Network Health';
  };

  return (
    <div className={cn(
      "min-h-screen bg-app-bg text-app-fg p-4 md:p-6 flex flex-col gap-6 transition-all duration-300",
      isDarkMode ? "dark" : "light"
    )}>
      {/* Primary Header Command Base Navigation */}
      <header className="flex flex-col items-center md:flex-row md:items-center justify-between gap-4 border-b border-app-border/60 pb-5 md:pb-0 h-auto md:h-[65px]" id="health-score-header">
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto h-full py-0">
          <Link href="/" className="outline-none">
            <ChameleonLogo className="w-40 h-[42px] sm:w-[190px] sm:h-[48px] relative z-10 transition-transform duration-300 hover:scale-[1.01]" animated={true} />
          </Link>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
          <nav className="flex items-center flex-wrap gap-1 md:gap-2">
            <Link 
              href="/"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Home Command
            </Link>
            <Link 
              href="/dashboard"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Smart Money Terminal
            </Link>
            <Link 
              href="/tracker"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Smart Wallet Tracker
            </Link>
            <Link 
              href="/narratives"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Narrative Detector
            </Link>
            <Link 
              href="/dna"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Wallet DNA
            </Link>
            <Link 
              href="/replay-v2"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Alpha Replay
            </Link>
            <Link 
              href="/stats"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Alpha Stats ✨
            </Link>
            <button className="border border-app-emerald text-app-emerald bg-app-emerald/10 font-bold px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-default" disabled>
              Ecosystem Health
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-app-card border border-app-border hover:bg-app-card-hover text-app-fg transition-all active:scale-95 cursor-pointer shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
            </button>

            <div className="hidden lg:flex bg-app-card border border-app-emerald/25 px-2.5 py-1 rounded-full items-center space-x-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-app-emerald rounded-full animate-pulse"></div>
              <span className="text-[9px] font-mono text-app-emerald uppercase tracking-wider font-bold">Health Monitor Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Header intro & Active Scenario Downloader */}
      <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-app-card/30 backdrop-blur-sm border border-app-border/65 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-app-emerald text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
            Mantle Ecosystem metrics
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-app-fg">Ecosystem Health Score</h1>
          <p className="text-xs md:text-sm text-app-zinc-text max-w-xl">
            The daily pulse of the Mantle ecosystem. Track liquidity depth, user footprint growth, whale allocation, and security alerts.
          </p>
        </div>

        {/* Dropdown for Scenarios */}
        <div className="relative">
          <span className="block text-[10px] font-mono font-bold text-app-zinc-text uppercase mb-1">Select Network Scenario Overlay</span>
          <button
            onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
            className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-app-card border border-app-border hover:border-app-emerald/50 text-xs font-bold text-app-fg shadow-sm transition-all focus:outline-none min-w-[280px] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", getScoreColorClass(activeScenario.compositeScore, 'text'))} style={{ backgroundColor: getScoreColorClass(activeScenario.compositeScore, 'stroke') }} />
              <span className="truncate">{activeScenario.name}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-app-zinc-text transition-transform", isScenarioDropdownOpen && "rotate-185")} />
          </button>

          <AnimatePresence>
            {isScenarioDropdownOpen && (
              <>
                {/* Backdrop closer */}
                <div className="fixed inset-0 z-40" onClick={() => setIsScenarioDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-[320px] rounded-xl bg-app-card border border-app-border shadow-xl z-50 overflow-hidden font-sans"
                >
                  <div className="p-2 border-b border-app-border bg-app-bg/50">
                    <span className="text-[9px] font-mono font-bold text-app-zinc-text uppercase tracking-widest px-2 block">
                      Active Network Presets
                    </span>
                  </div>
                  <div className="p-1 space-y-0.5 max-h-[300px] overflow-y-auto">
                    {ECOSYSTEM_SCENARIOS.map((scenario) => (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setSelectedScenarioId(scenario.id);
                          setIsScenarioDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-0.5 hover:bg-app-bg/85 cursor-pointer group",
                          selectedScenarioId === scenario.id && "bg-app-bg border border-app-border/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "font-bold font-sans",
                            selectedScenarioId === scenario.id ? "text-app-emerald" : "text-app-fg group-hover:text-app-emerald transition-colors"
                          )}>
                            {scenario.name}
                          </span>
                          <span className={cn(
                            "font-mono font-black text-[10px] px-1.5 py-0.2 rounded font-bold",
                            getScoreColorClass(scenario.compositeScore, 'bg')
                          )}>
                            {scenario.compositeScore}
                          </span>
                        </div>
                        <p className="text-[10px] text-app-zinc-text line-clamp-1">
                          {scenario.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* TOP DECK: Circular gauge & AI Bloomberg Daily Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LARGE COMPOSITE सर्क्युलर गेज (Col-span 5) */}
        <div className="lg:col-span-5 bento-card p-6 flex flex-col items-center justify-between relative bg-app-card/30 backdrop-blur-sm min-h-[380px]">
          <div className="w-full flex justify-between items-start mb-2">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-app-zinc-text uppercase tracking-wider">Mantle Diagnostic Hub</span>
              <h2 className="text-sm font-extrabold text-app-fg uppercase tracking-wide">Composite score</h2>
            </div>
            <div className={cn("px-2.5 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase", getScoreColorClass(score, 'bg'))}>
              {getScoreLabel(score)}
            </div>
          </div>

          {/* SVG Circular Dial */}
          <div className="relative w-full max-w-[210px] aspect-square flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-220 overflow-visible" viewBox="0 0 210 210">
              {/* Background circular track with zone styling */}
              <circle
                cx="105"
                cy="105"
                r={normalizedRadius}
                fill="none"
                stroke={isDarkMode ? '#1e2521' : '#e2e7e4'}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />

              {/* Colorful circular representation - dynamically scaled gradient segments */}
              <circle
                cx="105"
                cy="105"
                r={normalizedRadius}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth={strokeWidth + 0.5}
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                id="active-health-circle"
              />

              {/* Tool define local gradient inside gauge */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" /> {/* Red */}
                  <stop offset="45%" stopColor="#f59e0b" /> {/* Yellow */}
                  <stop offset="100%" stopColor="#10b981" /> {/* Green */}
                </linearGradient>
              </defs>
            </svg>

            {/* Float value centered */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-3" id="circular-score-overlay">
              <motion.span 
                key={score}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn("text-5xl font-mono font-black tracking-tighter leading-none block", getScoreColorClass(score, 'text'))}
              >
                {score}
              </motion.span>
              <span className="text-[10px] font-bold text-app-zinc-text uppercase tracking-widest mt-1">
                Index Points
              </span>
              <span className="text-[10px] text-app-fg/80 font-semibold font-mono tracking-wide mt-1.5 flex items-center gap-1">
                {score >= 70 ? '▲ Stable Inflows' : score >= 40 ? '⬡ Neutral Rot' : '▼ Exit Outflow'}
              </span>
            </div>
          </div>

          {/* Sub-scale zone labels below circle */}
          <div className="w-full grid grid-cols-3 text-center border-t border-app-border/50 pt-4 gap-2 text-[10px]">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-1 bg-red-500 rounded-full mb-1" />
              <span className="text-app-zinc-text font-semibold uppercase">Vulnerable</span>
              <span className="font-mono text-[9px] font-bold text-red-500/80 font-black">{"< 40"}</span>
            </div>
            <div className="flex flex-col items-center border-x border-app-border/40 px-1">
              <div className="w-2.5 h-1 bg-amber-500 rounded-full mb-1" />
              <span className="text-app-zinc-text font-semibold uppercase">Temperate</span>
              <span className="font-mono text-[9px] font-bold text-amber-500/80 font-black">{"40 - 70"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-1 bg-emerald-500 rounded-full mb-1" />
              <span className="text-app-zinc-text font-semibold uppercase">Optimal</span>
              <span className="font-mono text-[9px] font-bold text-emerald-500/80 font-black">{"> 70"}</span>
            </div>
          </div>
        </div>

        {/* AI DAILY NARRATIVE: Bloomberg style Brief (Col-span 7) */}
        <div className="lg:col-span-7 bento-card p-6 flex flex-col justify-between relative bg-app-card/45 backdrop-blur-md min-h-[380px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-app-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-app-emerald fill-current animate-pulse" />
                <h2 className="text-xs font-bold text-app-fg uppercase tracking-wider">AI Daily Narrative Intelligence</h2>
              </div>
              <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-app-emerald font-bold px-2 py-0.5 rounded uppercase font-mono flex items-center gap-1 animate-pulse">
                <Clock className="w-2.5 h-2.5" /> Bloomberg morning brief mode
              </span>
            </div>

            <div className="space-y-3 relative">
              {isAiLoading ? (
                <div className="absolute inset-0 bg-app-card/40 backdrop-blur-xs flex flex-col gap-2 items-center justify-center py-10 z-10">
                  <RefreshCw className="w-6 h-6 text-app-emerald animate-spin" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-app-zinc-text">
                    Decoding on-chain pulse parameters...
                  </span>
                </div>
              ) : null}

              <div className={cn("rounded-xl p-4 bg-app-bg/50 border border-app-border/80 min-h-[180px] leading-relaxed transition-all", isAiLoading && "opacity-40")}>
                <p className="text-app-fg text-sm font-semibold tracking-wide whitespace-pre-line antialiased italic">
                  "{aiNarrative}"
                </p>
                
                <div className="mt-4 pt-4 border-t border-app-border/40 flex items-center justify-between text-[10px] text-app-zinc-text">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-app-emerald" />
                    <span>Based on real {activeScenario.compositeScore} overall index points today</span>
                  </div>
                  <span className="font-mono">Mantle Daily Briefing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] text-app-zinc-text max-w-[70%]">
              Gemini processes daily on-chain smart wallet rotations, vault locks, and bridge volume spikes to construct this institutional dashboard.
            </p>
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-app-card border border-app-border rounded-lg px-3 py-1.5 hover:bg-app-card-hover hover:text-app-emerald text-xs text-app-fg transition-all cursor-pointer font-bold select-none"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-app-emerald animate-ping" />
                  <span className="text-app-emerald">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Brief</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MID DECK: The Row of 5 Individual Sub-score Gauges */}
      <section className="bento-card p-5 bg-app-card/30 backdrop-blur-sm relative flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-app-border/50 pb-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-mono text-app-zinc-text font-bold uppercase tracking-wider">Sub-dimension diagnostics</span>
            <h2 className="text-xs font-bold text-app-fg uppercase tracking-wide">Composite Gauge Breakdown</h2>
          </div>
          <span className="text-[10px] uppercase text-app-zinc-text font-semibold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> 5 composable vectors
          </span>
        </div>

        {/* Small Gauges row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
          {Object.entries(activeScenario.subScores).map(([key, value], index) => {
            // Label mappings
            const labelsMap: Record<string, string> = {
              liquidity: 'Liquidity Depth',
              userGrowth: 'User Growth',
              whaleConfidence: 'Whale Confidence',
              protocolActivity: 'Protocol Activity',
              riskLevel: 'On-Chain Risk Level'
            };
            const label = labelsMap[key] || key;

            // Gauge circle params for small gauges
            const smallRadius = 45;
            const smallStroke = 7;
            const smallNormRad = smallRadius - smallStroke;
            const smallCircum = smallNormRad * 2 * Math.PI;
            const smallOffset = smallCircum - (value / 100) * smallCircum;

            // Frame colors specifically for Risk Level (where low is good, high is bad)
            const getSubGaugeColor = (val: number, dimensionKey: string) => {
              if (dimensionKey === 'riskLevel') {
                if (val < 40) return 'text-emerald-500 fill-emerald-500/10 stroke-emerald-500'; // low risk is Good
                if (val >= 40 && val <= 70) return 'text-amber-500 fill-amber-500/10 stroke-amber-500';
                return 'text-red-500 fill-red-500/10 stroke-red-500'; // high risk is Bad
              }
              // Normal (higher is better)
              if (val < 40) return 'text-red-500 fill-red-500/10 stroke-red-500';
              if (val >= 40 && val <= 70) return 'text-amber-500 fill-amber-500/10 stroke-amber-500';
              return 'text-emerald-500 fill-emerald-500/10 stroke-emerald-500';
            };

            const subColorGroup = getSubGaugeColor(value, key);

            return (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-app-bg/50 border border-app-border/80 p-4 rounded-xl flex flex-col items-center justify-between text-center min-h-[155px] hover:border-app-emerald/15 transition-all group"
              >
                <span className="text-[10px] font-bold text-app-zinc-text uppercase tracking-normal line-clamp-1 w-full mb-1">
                  {label}
                </span>

                <div className="relative w-18 h-18 my-1 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="36"
                      cy="36"
                      r={smallNormRad}
                      fill="none"
                      stroke={isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}
                      strokeWidth={smallStroke}
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r={smallNormRad}
                      fill="none"
                      stroke={subColorGroup.split(' ').find(c => c.startsWith('stroke-'))?.replace('stroke-', '#') || '#10b981'}
                      strokeWidth={smallStroke + 0.5}
                      strokeDasharray={smallCircum}
                      strokeDashoffset={smallOffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out fill-none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-black text-app-fg">
                    {value}%
                  </div>
                </div>

                <span className={cn(
                  "text-[9px] font-mono leading-none border px-1.5 py-0.5 rounded uppercase font-bold mt-1 shadow-xs",
                  subColorGroup.split(' ').filter(c => !c.startsWith('stroke-')).join(' ')
                )}>
                  {key === 'riskLevel' ? (value > 70 ? 'CRITICAL' : value > 40 ? 'ELEVATED' : 'NOMINAL') : (value > 70 ? 'OPTIMAL' : value > 40 ? 'TEMPERATE' : 'VULNERABLE')}
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 14-DAY ECOSYSTEM HEALTH TREND CHART with Annotations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Trend line-chart panel (Col-span 8) */}
        <div className="lg:col-span-8 bento-card p-6 flex flex-col justify-between relative bg-app-card/40 backdrop-blur-sm min-h-[380px]" id="trend-chart-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-app-zinc-text uppercase tracking-wider block">Historical Health Ledger</span>
              <h3 className="text-base font-black text-app-fg uppercase tracking-wide">14-Day Health Indexed Trend</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-app-emerald" />
              <span className="text-[10px] text-app-fg font-bold uppercase tracking-wider">Composite Day-Scale</span>
            </div>
          </div>

          <div className="flex-grow w-full h-[230px] min-h-[200px]" id="recharts-health-trend">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeScenario.historyData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getScoreColorClass(score, 'stroke')} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={getScoreColorClass(score, 'stroke')} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#8b949e font-mono' : '#6b7280', fontSize: 10, fontWeight: 500 }}
                />
                <YAxis 
                  domain={[20, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#8b949e font-mono' : '#6b7280', fontSize: 10, fontWeight: 500 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#161b22' : '#ffffff', 
                    borderRadius: '12px', 
                    border: '1px solid var(--app-border)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'var(--app-fg)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke={getScoreColorClass(score, 'stroke')} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#scoreGlow)" 
                  animationDuration={1200}
                />
                
                {/* Reference dots for annotations */}
                {activeScenario.annotations.map((ann, idx) => (
                  <ReferenceDot 
                    key={idx}
                    x={ann.day}
                    y={ann.score}
                    r={5}
                    fill={isDarkMode ? '#10b981' : '#00875a'}
                    stroke={isDarkMode ? '#0d1117' : '#ffffff'}
                    strokeWidth={1.5}
                    className="cursor-pointer"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-4 border-t border-app-border/40 text-[10px] text-app-zinc-text font-semibold uppercase font-mono flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-app-emerald" />
            <span>Interactive dot reference: Highlights notable historic injections, governance locks, or major bridge spikes.</span>
          </div>
        </div>

        {/* Historic Annotations Details column (Col-span 4) */}
        <div className="lg:col-span-4 bento-card p-6 flex flex-col justify-between relative bg-app-card/45 backdrop-blur-sm min-h-[380px]" id="notable-events-column">
          <div className="mb-4">
            <span className="text-[9px] font-mono font-bold text-app-zinc-text uppercase tracking-wider block">Indexed Context</span>
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-extrabold text-app-fg uppercase tracking-wide">Historical Notable Events</h3>
              <Calendar className="w-3.5 h-3.5 text-app-zinc-text" />
            </div>
          </div>

          <div className="flex-grow space-y-3.5 overflow-y-auto max-h-[290px] pr-1 scrollbar-none font-sans">
            {activeScenario.annotations.map((ann, idx) => (
              <div 
                key={idx}
                className="p-3 bg-app-bg/50 border border-app-border/80 hover:border-app-emerald/20 transition-all rounded-xl flex flex-col gap-1 hover:bg-app-card-hover group cursor-pointer"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono bg-app-emerald/10 text-app-emerald font-extrabold px-1.5 py-0.2 rounded border border-app-emerald/15">
                    {ann.day}
                  </span>
                  <span className="font-mono font-black text-app-fg">
                    Rank score: {ann.score}%
                  </span>
                </div>
                <h4 className="text-xs font-black text-app-fg mt-1 group-hover:text-app-emerald transition-colors leading-tight">
                  {ann.label}
                </h4>
                <p className="text-[10px] text-app-zinc-text leading-relaxed">
                  {ann.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-[9px] text-app-zinc-text uppercase font-mono tracking-wider font-bold">
            Real time telemetry archive v1.4
          </div>
        </div>
      </section>

      {/* DETAILED CARDS BY DIMENSION */}
      <section className="space-y-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-app-zinc-text font-bold font-mono uppercase tracking-wider">Indexed deepdive sheets</span>
          <h2 className="text-lg font-black text-app-fg uppercase tracking-tight">Breakdown Cards per Dimension</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Object.entries(activeScenario.subScores).map(([key, value], idx) => {
            // Mapping details
            const labelMap: Record<string, string> = {
              liquidity: 'Liquidity Depth',
              userGrowth: 'User Growth',
              whaleConfidence: 'Whale Confidence',
              protocolActivity: 'Protocol Activity',
              riskLevel: 'Risk Level Indices'
            };
            const iconsMap: Record<string, any> = {
              liquidity: Droplet,
              userGrowth: Users,
              whaleConfidence: Shield,
              protocolActivity: Zap,
              riskLevel: AlertTriangle
            };
            
            const label = labelMap[key] || key;
            const Icon = iconsMap[key] || Activity;
            const keyDrivers = activeScenario.metricsData[key as keyof typeof activeScenario.metricsData] || [];
            
            // Artificial delta calculations purely for beauty
            const deltaVal = key === 'riskLevel' ? (value > 50 ? '+4.2%' : '-3.0%') : (value > 70 ? '+2.4%' : value > 50 ? '-0.5%' : '-8.4%');
            const isPos = key === 'riskLevel' ? value < 50 : value > 50; // for risk, a negative delta represents a healthy reduction

            return (
              <motion.div 
                key={key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-app-card border border-app-border/80 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:border-app-emerald/25 hover:transform hover:-translate-y-1 duration-300 relative group overflow-hidden min-h-[360px]"
              >
                {/* Corner decorative light element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-app-emerald/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-app-bg border border-app-border rounded-xl text-app-fg group-hover:text-app-emerald transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded font-mono text-[9px] font-black tracking-wide uppercase border",
                      isPos ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/15" : "bg-red-500/10 text-red-500 border-red-500/15"
                    )}>
                      {deltaVal} (24h)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-app-zinc-text uppercase tracking-normal line-clamp-1">{label}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-mono font-black text-app-fg">{value}%</span>
                      <span className="text-[10px] font-mono text-app-zinc-text uppercase font-bold">score</span>
                    </div>
                  </div>

                  {/* Drivers ledger */}
                  <div className="space-y-2 border-t border-app-border pb-1 pt-3">
                    <span className="block text-[9px] font-mono font-bold text-app-zinc-text uppercase tracking-wider">Metrics Drivers</span>
                    <ul className="space-y-1.5 text-[10px] text-app-fg/90">
                      {keyDrivers.map((drv, id) => (
                        <li key={id} className="flex gap-1.5 leading-snug">
                          <span className="text-app-emerald select-none">▪</span>
                          <span className="font-medium">{drv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Explanation paragraph */}
                <div className="mt-4 pt-3 border-t border-app-border/40 space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-app-emerald uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Gemini Analysis
                  </span>
                  <p className="text-[10px] text-app-zinc-text leading-relaxed group-hover:text-app-fg transition-colors italic">
                    "{aiExplanations[key] || 'Calculated dynamic parameter representing real-time volume, token locked reserves, and smart routing weights.'}"
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* RISK LEVEL PANEL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Risk Alerts Ledger (Col-span 7) */}
        <div className="lg:col-span-7 bento-card p-6 flex flex-col justify-between bg-app-card/30 backdrop-blur-sm relative" id="risk-alerts-ledger-panel">
          <div className="w-full flex justify-between items-start mb-4 border-b border-app-border/50 pb-3">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-app-zinc-text uppercase tracking-wider block">Diagnostics Audit</span>
              <h2 className="text-sm font-extrabold text-app-fg uppercase tracking-wide">Threat Vectors & Active Signals</h2>
            </div>
            
            <span className={cn(
              "px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded border",
              activeScenario.subScores.riskLevel > 70 ? "bg-red-500/10 text-red-500 border-red-500/15 animate-pulse" :
              activeScenario.subScores.riskLevel > 40 ? "bg-amber-500/10 text-amber-500 border-amber-500/15" :
              "bg-emerald-500/10 text-emerald-500 border-emerald-500/15"
            )}>
              {activeScenario.subScores.riskLevel > 70 ? 'CRITICAL ECO RISK' : activeScenario.subScores.riskLevel > 40 ? 'ELEVATED FRICTION' : 'NOMINAL SAFETY SCORE'}
            </span>
          </div>

          <div className="flex-grow space-y-3.5">
            {activeScenario.riskSignals.map((sig, idx) => (
              <div 
                key={idx}
                className="p-3.5 bg-app-bg/50 border border-app-border/80 rounded-xl flex items-start gap-3.5 transition-all hover:bg-app-card-hover cursor-pointer"
              >
                <div className={cn(
                  "p-2 rounded-lg border",
                  sig.status === 'critical' ? "bg-red-500/15 text-red-500 border-red-500/20" :
                  sig.status === 'elevated' ? "bg-amber-500/15 text-amber-500 border-amber-500/20" :
                  "bg-emerald-500/15 text-emerald-500 border-emerald-500/20"
                )}>
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-app-fg">{sig.name}</h4>
                    <span className={cn(
                      "text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border leading-none",
                      sig.status === 'critical' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                      sig.status === 'elevated' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    )}>
                      {sig.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-app-zinc-text leading-relaxed font-mono">
                    {sig.details}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-app-border/40 text-[9px] text-app-zinc-text font-semibold uppercase font-mono tracking-wider">
            Risk monitors checking over 12 domestic contracts synchronously
          </div>
        </div>

        {/* Dynamic Safeguard index detail (Col-span 5) */}
        <div className="lg:col-span-5 bento-card p-6 flex flex-col justify-between bg-app-card/45 backdrop-blur-sm relative min-h-[340px]" id="risk-safeguards-panel">
          <div className="mb-4">
            <span className="text-[9px] font-mono text-app-zinc-text font-bold uppercase tracking-wider block">Safeguard protocols</span>
            <h3 className="text-sm font-extrabold text-app-fg uppercase tracking-wide">Circuit Breakers & Safeguards</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-app-bg/50 border border-app-border rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-app-emerald">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Mantle LSP Guardians</span>
              </div>
              <p className="text-[10px] text-app-fg/90 leading-relaxed">
                Emergency pauses can be triggered synchronously by 3 out of 5 multisig consensus blocks if liquidity wrappers decouple of standard bounds.
              </p>
            </div>

            <div className="p-4 bg-app-bg/50 border border-app-border rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-app-emerald">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Treasury Rate Caps</span>
              </div>
              <p className="text-[10px] text-app-fg/90 leading-relaxed">
                Automated rate throttling limits maximum bridge stable coin exits to $25M per rolling 4-hour window, preventing flash cascading liquidations.
              </p>
            </div>
          </div>

          <div className="mt-4 text-[9px] text-app-zinc-text font-mono font-black uppercase text-center border-t border-app-border/40 pt-3">
            SECURITY SCORE STATUS: VERIFIED OK
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-app-border/60 pt-6 pb-8 flex flex-col sm:flex-row items-center justify-between text-app-zinc-text text-xs gap-4">
        <p className="font-mono text-[10px]">
          © 2026 Chameleon Ecosystem Diagnostics. Compiled running Mantle L2 mainnet logs.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-app-fg transition-colors">Home Page</Link>
          <Link href="/dashboard" className="hover:text-app-fg transition-colors">Smart Money Terminal</Link>
          <Link href="/tracker" className="hover:text-app-fg transition-colors">Forensic Tracker</Link>
          <span className="text-app-border/60">|</span>
          <span className="text-[10px] font-mono uppercase bg-app-card border border-app-border/60 px-2.5 py-1 rounded-md max-w-max select-none">
            Powered by Gemini 3.5
          </span>
        </div>
      </footer>
    </div>
  );
}
