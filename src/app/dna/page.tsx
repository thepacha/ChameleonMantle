"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search,
  Wallet,
  Activity,
  Zap,
  Flame,
  Cpu,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  ExternalLink,
  Sun,
  Moon,
  Sparkles,
  Award,
  Clock,
  History,
  Shield,
  HelpCircle,
  TrendingUp,
  Boxes,
  Compass,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn, formatCurrency, formatNumber } from '@/src/lib/utils';
import { Header } from '@/src/components/Header';
import Link from 'next/link';

interface SignalItem {
  id: string;
  date: string;
  token: string;
  action: 'BUY' | 'SELL' | 'LP_ADD' | 'LP_REMOVE';
  confidence: number;
  outcome: string;
  isProfit: boolean | null;
  txHash: string;
}

interface PortfolioItem {
  token: string;
  balance: string;
  usdValue: number;
  pctOfPortfolio: number;
  entryPriceEst: string;
  unrealizedPnl: string;
  isPnlPositive: boolean;
}

interface RelatedWallet {
  address: string;
  ens?: string;
  coMovements: number;
  sharedTrades: number;
}

interface WalletIntelReport {
  address: string;
  ens?: string;
  dna: string;
  dnaIconName: 'zap' | 'layers' | 'cpu' | 'flame' | 'activity' | 'shield';
  confidenceScore: number;
  firstActiveDate: string;
  totalVolume: string;
  winRate: number;
  realizedPnl: number;
  avgHoldTime: string;
  preferredDex: string;
  favoriteSector: string;
  convictionScore: number;
  signals: SignalItem[];
  pnlHistory: { day: string; val: number }[];
  portfolio: PortfolioItem[];
  relatedWallets: RelatedWallet[];
  heatmapDays: { date: string; count: number }[];
}

// Simple hash builder to generate deterministic mock data for any wallet searched
function getAddressHash(str: string): number {
  let hash = 0;
  const lowercase = str.trim().toLowerCase();
  for (let i = 0; i < lowercase.length; i++) {
    hash = lowercase.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const PRESETS: Record<string, Partial<WalletIntelReport>> = {
  'snipes.eth': {
    address: '0xabc14298cf085b42d76a5b78f4ea492eb9c24942',
    ens: 'snipes.eth',
    dna: 'Early Trend Sniper',
    dnaIconName: 'zap',
    confidenceScore: 96,
    firstActiveDate: '2023-11-20',
    totalVolume: '$2,840,500',
    winRate: 81,
    realizedPnl: 240430,
    avgHoldTime: '1.8 Days',
    preferredDex: 'Agni Finance',
    favoriteSector: 'AI x GPU',
    convictionScore: 96,
    portfolio: [
      { token: 'MNT', balance: '124,500', usdValue: 92130, pctOfPortfolio: 65, entryPriceEst: '$0.65', unrealizedPnl: '+$11,205 (12%)', isPnlPositive: true },
      { token: 'AGNI', balance: '354,000', usdValue: 28320, pctOfPortfolio: 20, entryPriceEst: '$0.07', unrealizedPnl: '+$3,540 (14%)', isPnlPositive: true },
      { token: 'USDC', balance: '14,170', usdValue: 14170, pctOfPortfolio: 10, entryPriceEst: '$1.00', unrealizedPnl: 'Flat', isPnlPositive: true },
      { token: 'CGPT', balance: '58,000', usdValue: 7080, pctOfPortfolio: 5, entryPriceEst: '$0.10', unrealizedPnl: '+$1,280 (18%)', isPnlPositive: true }
    ],
    signals: [
      { id: 'sig-1', date: '21h ago', token: 'MNT', action: 'BUY', confidence: 96, outcome: '+14% Run', isProfit: true, txHash: '0xabff...7a1' },
      { id: 'sig-2', date: '2d ago', token: 'CGPT', action: 'BUY', confidence: 91, outcome: '+188% Explode', isProfit: true, txHash: '0xbcde...c33' },
      { id: 'sig-3', date: '4d ago', token: 'AGNI', action: 'BUY', confidence: 85, outcome: '+42% Apex', isProfit: true, txHash: '0xcd19...ff4' },
      { id: 'sig-4', date: '1w ago', token: 'MOE', action: 'SELL', confidence: 80, outcome: '-8% Cut', isProfit: false, txHash: '0xdeae...b12' }
    ],
    relatedWallets: [
      { address: '0xdef8432ce9dca838bdf8811eef24177dd31c111a', ens: 'yieldmaster.eth', coMovements: 14, sharedTrades: 12 },
      { address: '0x19adfa43bb1cc20e9871fcceaa77b94109ca37b1', ens: 'alphahunter.eth', coMovements: 21, sharedTrades: 19 }
    ]
  },
  'yieldmaster.eth': {
    address: '0xdef8432ce9dca838bdf8811eef24177dd31c111a',
    ens: 'yieldmaster.eth',
    dna: 'LP Farmer',
    dnaIconName: 'layers',
    confidenceScore: 88,
    firstActiveDate: '2023-04-14',
    totalVolume: '$8,450,110',
    winRate: 76,
    realizedPnl: 140510,
    avgHoldTime: '12 Days',
    preferredDex: 'Agni Finance',
    favoriteSector: 'DeFi Yields',
    convictionScore: 88,
    portfolio: [
      { token: 'ETH', balance: '28.5', usdValue: 63200, pctOfPortfolio: 45, entryPriceEst: '$2,100', unrealizedPnl: '+$3,350 (5%)', isPnlPositive: true },
      { token: 'MNT', balance: '66,400', usdValue: 49130, pctOfPortfolio: 35, entryPriceEst: '$0.70', unrealizedPnl: '+$2,650 (5%)', isPnlPositive: true },
      { token: 'USDC', balance: '21,080', usdValue: 21080, pctOfPortfolio: 15, entryPriceEst: '$1.00', unrealizedPnl: 'Flat', isPnlPositive: true }
    ],
    signals: [
      { id: 'sig-11', date: '34m ago', token: 'MNT/USDC', action: 'LP_ADD', confidence: 91, outcome: '+18% APY Range', isProfit: true, txHash: '0xdf32...94a' },
      { id: 'sig-12', date: '2d ago', token: 'ETH/USDT', action: 'LP_ADD', confidence: 84, outcome: '+24% APY Yield', isProfit: true, txHash: '0xfeed...822' }
    ],
    relatedWallets: [
      { address: '0xabc14298cf085b42d76a5b78f4ea492eb9c24942', ens: 'snipes.eth', coMovements: 14, sharedTrades: 12 },
      { address: '0x44f9cf2e21bbda7c2901977cf923984ca903bccc', ens: 'thewhale.eth', coMovements: 25, sharedTrades: 22 }
    ]
  },
  'thewhale.eth': {
    address: '0x44f9cf2e21bbda7c2901977cf923984ca903bccc',
    ens: 'thewhale.eth',
    dna: 'Whale Accumulator',
    dnaIconName: 'flame',
    confidenceScore: 91,
    firstActiveDate: '2022-09-08',
    totalVolume: '$14,210,000',
    winRate: 68,
    realizedPnl: 720110,
    avgHoldTime: '45 Days',
    preferredDex: 'FusionX DEX',
    favoriteSector: 'LRT / Restaking',
    convictionScore: 91,
    portfolio: [
      { token: 'ETH', balance: '185.0', usdValue: 410700, pctOfPortfolio: 70, entryPriceEst: '$2,050', unrealizedPnl: '+$43,150 (11%)', isPnlPositive: true },
      { token: 'mETH', balance: '52.4', usdValue: 117360, pctOfPortfolio: 20, entryPriceEst: '$2,140', unrealizedPnl: '+$5,120 (4.5%)', isPnlPositive: true }
    ],
    signals: [
      { id: 'sig-21', date: '12h ago', token: 'ETH', action: 'BUY', confidence: 91, outcome: '+6.2% Block', isProfit: true, txHash: '0x44fa...ccc' }
    ],
    relatedWallets: [
      { address: '0xdef8432ce9dca838bdf8811eef24177dd31c111a', ens: 'yieldmaster.eth', coMovements: 25, sharedTrades: 22 }
    ]
  }
};

function generateDeterministicReport(addressOrEns: string): WalletIntelReport {
  const query = addressOrEns.trim().toLowerCase();
  
  // Try exact key presets first
  if (PRESETS[query]) {
    const p = PRESETS[query];
    const seed = getAddressHash(query);
    return {
      address: p.address || '0xabc14298cf085b42d76a5b78f4ea492eb9c24942',
      ens: p.ens,
      dna: p.dna!,
      dnaIconName: p.dnaIconName!,
      confidenceScore: p.confidenceScore || 95,
      firstActiveDate: p.firstActiveDate || '2023-11-20',
      totalVolume: p.totalVolume || '$2,840,500',
      winRate: p.winRate || 80,
      realizedPnl: p.realizedPnl || 240000,
      avgHoldTime: p.avgHoldTime || '2 Days',
      preferredDex: p.preferredDex || 'Agni Finance',
      favoriteSector: p.favoriteSector || 'DeFi',
      convictionScore: p.convictionScore || 90,
      signals: p.signals || [],
      pnlHistory: generatePnlHistory(p.realizedPnl || 240000, seed),
      portfolio: p.portfolio || [],
      relatedWallets: p.relatedWallets || [],
      heatmapDays: generateHeatmapDays(seed)
    };
  }

  // Generate dynamic matching if searched by 0x address of preset
  for (const presetKey of Object.keys(PRESETS)) {
    const preset = PRESETS[presetKey];
    if (preset.address?.toLowerCase() === query) {
      return generateDeterministicReport(presetKey);
    }
  }

  // Generates a fully dynamic deterministic result if searched completely new wallet
  const seed = getAddressHash(query);
  const isEns = query.endsWith('.eth') || query.endsWith('.mnt');
  
  const formattedAddress = isEns 
    ? `0x${(seed % 10000).toString(16).padStart(4, '0')}729abfae${(seed % 999).toString(16)}bc${(seed % 42).toString(16)}34a2c1`
    : (query.startsWith('0x') ? query : `0x${query.substring(0, 38).padEnd(38, 'f')}51d`);
    
  const formattedEns = isEns ? query : `${query.substring(0, 7)}.eth`;

  const dnasInfo: { type: string; icon: 'zap' | 'layers' | 'cpu' | 'flame' | 'activity' | 'shield' }[] = [
    { type: 'Early Trend Sniper', icon: 'zap' },
    { type: 'LP Farmer', icon: 'layers' },
    { type: 'Arbitrage & MEV Bot', icon: 'cpu' },
    { type: 'Whale Accumulator', icon: 'flame' },
    { type: 'High-Frequency Ape', icon: 'activity' },
    { type: 'Governance Insider', icon: 'shield' }
  ];
  
  const chosenDna = dnasInfo[seed % dnasInfo.length];
  const winRate = 48 + (seed % 40);
  const volumeValue = 120000 + (seed % 150) * 12500;
  const realizedPnl = (seed % 3 !== 0 ? 1 : -1) * Math.round(volumeValue * (0.05 + (seed % 15) / 100));

  const preferredDex = ['Agni Finance', 'Merchant Moe', 'FusionX DEX', 'Cleopatra Exchange'][seed % 4];
  const favoriteSector = ['AI & Depin', 'DeFi / Concentrated Pools', 'Liquid LRT Restaking', 'Meme Ecosystem', 'Mantle Core L2'][seed % 5];
  const avgHoldTimes = ['3.5 Hours', '2.5 Days', '8.9 Days', '22 Days', '54 Days'];

  return {
    address: formattedAddress,
    ens: formattedEns,
    dna: chosenDna.type,
    dnaIconName: chosenDna.icon,
    confidenceScore: 82 + (seed % 17),
    firstActiveDate: `2023-0${(seed % 8) + 1}-1${seed % 9}`,
    totalVolume: formatCurrency(volumeValue).replace('.00', ''),
    winRate,
    realizedPnl,
    avgHoldTime: avgHoldTimes[seed % avgHoldTimes.length],
    preferredDex,
    favoriteSector,
    convictionScore: 75 + (seed % 24),
    portfolio: [
      { token: 'MNT', balance: formatNumber(volumeValue * 0.45), usdValue: Math.round(volumeValue * 0.4), pctOfPortfolio: 40, entryPriceEst: '$0.71', unrealizedPnl: '+$6,410 (+8.2%)', isPnlPositive: true },
      { token: 'USDC', balance: formatNumber(volumeValue * 0.3), usdValue: Math.round(volumeValue * 0.3), pctOfPortfolio: 30, entryPriceEst: '$1.00', unrealizedPnl: 'Flat', isPnlPositive: true },
      { token: 'AGNI', balance: formatNumber(volumeValue * 0.2), usdValue: Math.round(volumeValue * 0.15), pctOfPortfolio: 15, entryPriceEst: '$0.08', unrealizedPnl: '-$1,120 (-4.2%)', isPnlPositive: false }
    ],
    signals: [
      { id: `dyn-sig-1`, date: '1d ago', token: 'MNT', action: 'BUY', confidence: 85, outcome: 'Active holding', isProfit: null, txHash: `0x${seed.toString(16).substring(0, 4)}...72a2` },
      { id: `dyn-sig-2`, date: '4d ago', token: 'MOE', action: 'SELL', confidence: 90, outcome: '+14% Profit', isProfit: true, txHash: `0x${(seed + 1).toString(16).substring(0, 4)}...f811` }
    ],
    relatedWallets: [
      { address: '0xabc14298cf085b42d76a5b78f4ea492eb9c24942', ens: 'snipes.eth', coMovements: 9, sharedTrades: 6 }
    ],
    heatmapDays: generateHeatmapDays(seed),
    pnlHistory: generatePnlHistory(realizedPnl, seed)
  };
}

function generatePnlHistory(realized: number, seed: number): { day: string; val: number }[] {
  const result = [];
  const points = 8;
  const start = Math.round(realized * 0.1);
  for (let i = 0; i < points; i++) {
    const fraction = (i + 1) / points;
    const noisyMultiplier = Math.sin(i + seed) * (realized * 0.12);
    result.push({
      day: `P${i + 1}`,
      val: Math.round(start + (realized - start) * fraction + noisyMultiplier)
    });
  }
  return result;
}

function generateHeatmapDays(seed: number): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1); // 365 days ago
  
  for (let i = 0; i < 365; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Deterministic counts with appealing visuals
    const dSeed = seed + i;
    let count = 0;
    if (dSeed % 9 === 0 || dSeed % 14 === 0) {
      count = (dSeed % 4) + 1;
    } else if (dSeed % 27 === 0) {
      count = (dSeed % 7) + 5;
    }
    result.push({ date: dateStr, count });
  }
  return result;
}

export default function WalletDnaPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [report, setReport] = useState<WalletIntelReport | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sync state & recents
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    const savedRecents = localStorage.getItem('chameleon_recent_searches');
    if (savedRecents) {
      try {
        setRecents(JSON.parse(savedRecents));
      } catch (e) {
        setRecents(['snipes.eth', 'yieldmaster.eth', 'thewhale.eth']);
      }
    } else {
      const init = ['snipes.eth', 'yieldmaster.eth', 'thewhale.eth'];
      setRecents(init);
      localStorage.setItem('chameleon_recent_searches', JSON.stringify(init));
    }

    // Default load 'snipes.eth' on start
    runReport('snipes.eth');
  }, []);

  const runReport = async (query: string) => {
    const data = generateDeterministicReport(query);
    setReport(data);

    // Save recent search
    const clean = query.trim().toLowerCase();
    if (clean) {
      setRecents(prev => {
        const withoutCurrent = prev.filter(x => x.toLowerCase() !== clean);
        const nextList = [query, ...withoutCurrent].slice(0, 5);
        localStorage.setItem('chameleon_recent_searches', JSON.stringify(nextList));
        return nextList;
      });
    }

    // Load AI generated summary route
    setIsAiLoading(true);
    setAiAnalysis('');
    try {
      const response = await fetch('/api/wallet-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: data.address,
          dna: data.dna,
          winRate: data.winRate,
          realizedPnl: data.realizedPnl >= 0 ? `+$${formatNumber(data.realizedPnl)}` : `-$${formatNumber(Math.abs(data.realizedPnl))}`,
          favoriteSector: data.favoriteSector,
          avgHoldTime: data.avgHoldTime,
          preferredDex: data.preferredDex
        })
      });
      const resData = await response.json();
      if (resData.profile) {
        setAiAnalysis(resData.profile);
      } else {
        throw new Error('Fallback response needed');
      }
    } catch (e) {
      console.warn('Gemini API call failed, using default description: ', e);
      setAiAnalysis(`Forensic intelligence indicates that ${data.ens || 'this wallet'} operates with high efficiency as a ${data.dna} on Mantle chain. Analysis shows targeted liquidity acquisition in the ${data.favoriteSector} sector. Swaps correspond neatly with transaction flow patterns surrounding major DEX nodes like ${data.preferredDex}.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const toggleTheme = () => {
    const target = !isDarkMode;
    setIsDarkMode(target);
    if (target) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const renderDnaBadgeIcon = (icon: string) => {
    const cnStr = "w-4.5 h-4.5";
    if (icon === 'zap') return <Zap className={`${cnStr} text-amber-400`} />;
    if (icon === 'layers') return <Layers className={`${cnStr} text-emerald-400`} />;
    if (icon === 'cpu') return <Cpu className={`${cnStr} text-teal-400`} />;
    if (icon === 'flame') return <Flame className={`${cnStr} text-orange-400`} />;
    if (icon === 'activity') return <Activity className={`${cnStr} text-blue-400`} />;
    return <Shield className={`${cnStr} text-violet-400`} />;
  };

  // Convert flat heatmap days to structured 7-row columns for visualization
  const heatmapGrid = useMemo(() => {
    if (!report) return [];
    const days = report.heatmapDays;
    const columns: typeof days[] = [];
    let temp: typeof days = [];
    days.forEach((day, i) => {
      temp.push(day);
      if (temp.length === 7 || i === days.length - 1) {
        columns.push(temp);
        temp = [];
      }
    });
    return columns;
  }, [report]);

  return (
    <div className="min-h-screen bg-app-bg text-app-fg p-4 md:p-6 flex flex-col gap-6 selection:bg-emerald-500/30">
      
      {/* Unified Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      {/* SUB-HEADER DESCRIPTION */}
      <section className="flex flex-col gap-1.5 md:flex-row md:items-baseline justify-between" id="intro-section">
        <div>
          <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest font-black">
            Forensic On-Chain Analysis
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-app-fg mt-1">
            Wallet Search & DNA Profiler
          </h1>
        </div>
        <p className="text-xs text-app-zinc-text font-medium leading-relaxed max-w-sm">
          Execute specialized profiles on Mantle Network addresses. Trace performance metrics, portfolio positions, history signals, and on-chain heatmaps instantly.
        </p>
      </section>

      {/* LARGE CENTERED SEARCH BLOCK */}
      <section className="bento-card bg-app-card/35 p-6 md:p-8 flex flex-col items-center justify-center gap-5 w-full relative overflow-hidden" id="centered-search-box">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-emerald-500 to-indigo-500"></div>
        
        <div className="max-w-xl w-full text-center">
          <h2 className="text-xs sm:text-sm font-bold text-app-fg uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-app-emerald animate-pulse" />
            Decrypt Any Mantle Ledger address or Domain Name
          </h2>
          <p className="text-[11px] text-app-zinc-text font-medium mt-1">
            Provides complete on-chain personality classification, conviction indexing, and historical transaction frequency curves.
          </p>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (searchVal.trim()) runReport(searchVal);
          }}
          className="max-w-2xl w-full flex relative items-center"
          id="search-wallet-form"
        >
          <div className="absolute left-4 text-app-zinc-text">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Enter address (0x...) or domain name (e.g., snipes.eth)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full text-xs sm:text-sm border border-app-border/85 rounded-2xl pl-12 pr-24 py-3.5 bg-app-bg text-app-fg focus:outline-none focus:border-app-emerald focus:ring-1 focus:ring-app-emerald/30 transition-all font-mono"
            id="wallet-search-input"
          />
          <button 
            type="submit"
            className="absolute right-2 px-4.5 py-2 bg-app-emerald hover:bg-emerald-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            id="scythe-search-btn"
          >
            Scythe
          </button>
        </form>

        {/* Recent Search Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl w-full" id="recent-search-logs">
          <span className="text-[10px] font-bold text-app-zinc-text uppercase tracking-wider flex items-center gap-1">
            <History className="w-3.5 h-3.5" /> Recent Scans:
          </span>
          {recents.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchVal(item);
                runReport(item);
              }}
              className="bg-app-bg hover:bg-app-card-hover border border-app-border text-[10px] text-app-zinc-text hover:text-app-fg px-3 py-1 rounded-full font-mono transition-all cursor-pointer active:scale-95"
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* SCAN RESULT PANEL */}
      <AnimatePresence mode="wait">
        {report && (
          <motion.div
            key={report.address}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-6"
            id="search-result-container"
          >
            
            {/* COMPONENT 1: DNA PROFILE CARD (RESULT) & STATS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Profile card left column */}
              <div className="lg:col-span-7 bento-card p-5.5 flex flex-col justify-between gap-5 relative bg-app-card/45" id="dna-profile-card">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-app-bg border border-app-border rounded-xl shadow-inner">
                      <Wallet className="w-5.5 h-5.5 text-app-emerald" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-extrabold text-app-fg font-mono leading-none">
                          {report.ens || 'Anonymous Ledger'}
                        </h2>
                        <span className="text-[9px] text-app-zinc-text uppercase font-bold tracking-wider">resolved</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10.5px] text-app-zinc-text font-mono tracking-tight bg-app-bg px-2 py-0.5 rounded border border-app-border">
                          {report.address.substring(0, 18)}...{report.address.substring(report.address.length - 12)}
                        </span>
                        <button 
                          onClick={() => handleCopy(report.address)}
                          className="text-app-zinc-text hover:text-app-emerald transition-colors p-1 cursor-pointer"
                          title="Copy Full Wallet Address"
                        >
                          {addressCopied ? <Check className="w-3.5 h-3.5 text-app-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-right">
                    <div className="flex items-center gap-1.5 bg-app-bg border border-app-border px-3 py-1 rounded-full shadow-inner">
                      {renderDnaBadgeIcon(report.dnaIconName)}
                      <span className="text-xs font-black text-app-fg uppercase tracking-wide">
                        {report.dna}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-app-zinc-text font-bold">
                      Classification Confidence: <strong className="text-app-emerald font-mono">{report.confidenceScore}%</strong>
                    </span>
                  </div>
                </div>

                {/* AI-Generated Profile Summary Container */}
                <div className="bg-app-bg/55 border border-app-border p-4 rounded-xl flex flex-col gap-2 relative">
                  <div className="flex justify-between items-center pb-0.5">
                    <span className="text-[9px] font-mono bg-app-emerald/10 text-app-emerald border border-app-emerald/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider flex items-center gap-1 select-none">
                      <Sparkles className="w-3 h-3 text-app-emerald animate-pulse" />
                      AI On-chain Agent Profiling
                    </span>
                    <span className="text-[9px] text-app-zinc-text uppercase tracking-widest font-mono">
                      gemini-3.5-flash
                    </span>
                  </div>

                  {isAiLoading ? (
                    <div className="space-y-2 py-1.5 animate-pulse">
                      <div className="h-3 w-full bg-app-border/40 rounded"></div>
                      <div className="h-3 w-5/6 bg-app-border/40 rounded"></div>
                      <div className="h-3 w-4/5 bg-app-border/40 rounded"></div>
                    </div>
                  ) : (
                    <p className="text-[11.5px] text-app-fg font-medium leading-relaxed italic pr-1">
                      "{aiAnalysis}"
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-app-border/50 pt-3.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-app-zinc-text" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-app-zinc-text uppercase font-bold">First active date</span>
                      <span className="text-xs text-app-fg font-mono font-extrabold">{report.firstActiveDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-l border-app-border/50 pl-4">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] text-app-zinc-text uppercase font-bold text-shadow">Estimated Total Volume</span>
                      <span className="text-xs text-app-fg font-mono font-extrabold text-indigo-400">{report.totalVolume}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATS MATRIX CARD GRID RIGHT (Colspan-5) */}
              <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-4 items-stretch" id="dna-stats-matrix">
                
                {/* Win Rate */}
                <div className="bento-card p-4 flex flex-col justify-between bg-app-card/45">
                  <span className="text-[9.5px] text-app-zinc-text uppercase font-bold tracking-wider">Win Rate</span>
                  <div className="flex flex-col gap-0.5 mt-2">
                    <span className="text-2xl font-black font-mono text-app-emerald leading-tight">{report.winRate}%</span>
                    <div className="w-full h-1.5 bg-app-bg border border-app-border/30 rounded mt-1.5 overflow-hidden">
                      <div className="bg-app-emerald h-full rounded" style={{ width: `${report.winRate}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Realized PnL */}
                <div className="bento-card p-4 flex flex-col justify-between bg-app-card/45">
                  <span className="text-[9.5px] text-app-zinc-text uppercase font-bold tracking-wider">Realized PnL</span>
                  <span className={cn(
                    "text-[19px] font-black font-mono mt-3 leading-tight tracking-tight break-all",
                    report.realizedPnl >= 0 ? "text-app-emerald" : "text-rose-500"
                  )}>
                    {report.realizedPnl >= 0 ? '+' : '-'}${formatNumber(Math.abs(report.realizedPnl))}
                  </span>
                </div>

                {/* Avg Hold Time */}
                <div className="bento-card p-4 flex flex-col justify-between bg-app-card/45">
                  <span className="text-[9.5px] text-app-zinc-text uppercase font-bold tracking-wider">Avg Hold Time</span>
                  <span className="text-[17px] font-black font-mono mt-3 text-indigo-400 leading-tight">{report.avgHoldTime}</span>
                </div>

                {/* Preferred DEX */}
                <div className="bento-card p-4 flex flex-col justify-between bg-app-card/45">
                  <span className="text-[9.5px] text-app-zinc-text uppercase font-bold tracking-wider">Preferred DEX</span>
                  <span className="text-xs font-black text-app-fg mt-3 leading-snug">{report.preferredDex}</span>
                </div>

                {/* Favorite Sector */}
                <div className="bento-card p-4 flex flex-col justify-between bg-app-card/45">
                  <span className="text-[9.5px] text-app-zinc-text uppercase font-bold tracking-wider">Favorite Sector</span>
                  <span className="text-xs font-black text-sky-400 mt-3 leading-snug">{report.favoriteSector}</span>
                </div>

                {/* Conviction Score */}
                <div className="bento-card p-4 flex flex-col justify-between bg-app-card/45">
                  <span className="text-[9.5px] text-app-zinc-text uppercase font-bold tracking-wider">Conviction Score</span>
                  <div className="flex items-baseline gap-0.5 mt-3">
                    <span className="text-2xl font-black font-mono text-purple-400">{report.convictionScore}</span>
                    <span className="text-[9px] text-app-zinc-text font-bold">/100</span>
                  </div>
                </div>

              </div>
            </div>

            {/* COMPONENT 2: PNL TIMELINE CHART & PORTFOLIO SNAPSHOT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Cumulative PnL Curve Chart */}
              <div className="lg:col-span-7 bento-card p-5.5 flex flex-col justify-between bg-app-card/45 h-[340px]" id="cumulative-pnl-card">
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <span className="text-[9px] font-bold text-app-zinc-text uppercase tracking-wider block mb-0.5">ESTIMATED BALANCE SHEET</span>
                    <h3 className="text-sm font-extrabold text-app-fg">PnL Timeline (Cumulative Return Curve)</h3>
                  </div>
                  <span className="bg-app-emerald/15 text-app-emerald font-mono font-bold text-[9px] px-2 py-0.5 rounded border border-app-emerald/20 uppercase">
                    Historic Flow PnL
                  </span>
                </div>

                {/* Chart Box */}
                <div className="flex-grow w-full h-[190px] min-h-[170px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.pnlHistory} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="dnaPnlGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={report.realizedPnl >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0.25}/>
                          <stop offset="95%" stopColor={report.realizedPnl >= 0 ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255, 255, 255, 0.03)" : "rgba(0,0,0,0.03)"} vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8fa396', fontSize: 10, fontWeight: 500 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8fa396', fontSize: 10, fontWeight: 500 }}
                        tickFormatter={(val) => `${val >= 0 ? '+' : '-'}$${formatNumber(Math.abs(val)).split(',')[0]}k`}
                      />
                      <Tooltip 
                        formatter={(val: any) => [`$${formatNumber(Number(val))}`, 'Cumulative PnL']}
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#111614' : '#ffffff', 
                          borderRadius: '12px', 
                          border: '1px solid var(--app-border)',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: 'var(--app-fg)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke={report.realizedPnl >= 0 ? "#10b981" : "#f43f5e"} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#dnaPnlGrad)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <span className="text-[10px] text-app-zinc-text font-medium text-center">
                  Data trace tracks cumulative delta curves beginning from block {742010 + getAddressHash(report.address) % 50000} swaps.
                </span>
              </div>

              {/* Portfolio Snapshot Balance Table */}
              <div className="lg:col-span-5 bento-card p-5.5 flex flex-col justify-between bg-app-card/45" id="portfolio-snapshot-card">
                <div className="flex justify-between items-baseline mb-3 border-b border-app-border pb-2">
                  <div>
                    <span className="text-[9px] font-bold text-app-zinc-text uppercase tracking-wider block mb-0.5">CURRENT COLD STORAGE</span>
                    <h3 className="text-sm font-extrabold text-app-fg">Portfolio Live Snapshot</h3>
                  </div>
                  <span className="text-xs text-app-zinc-text font-mono font-bold">
                    {report.portfolio.length} Holdings
                  </span>
                </div>

                <div className="flex-grow overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="portfolio-summary-table">
                    <thead>
                      <tr className="text-app-zinc-text font-bold uppercase border-b border-app-border/40 pb-2 text-[10px]">
                        <th className="py-2">Token</th>
                        <th className="py-2 text-right">Balance</th>
                        <th className="py-2 text-right">USD Value</th>
                        <th className="py-2 text-right">Est PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/20 text-[11px]">
                      {report.portfolio.map((item, id) => (
                        <tr key={id} className="hover:bg-app-bg/30 transition-colors">
                          <td className="py-2.5 font-extrabold text-app-fg">
                            <div className="flex items-center gap-1">
                              <span className="bg-app-bg px-2 py-0.5 rounded border border-app-border uppercase font-black text-[10px]">
                                {item.token}
                              </span>
                              <span className="text-[9px] text-app-zinc-text font-normal">{item.pctOfPortfolio}%</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-app-fg">{item.balance}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-app-fg">{formatCurrency(item.usdValue).split('.')[0]}</td>
                          <td className={cn(
                            "py-2.5 text-right font-mono font-bold",
                            item.isPnlPositive ? "text-app-emerald" : "text-rose-500"
                          )}>
                            {item.unrealizedPnl}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-2.5 border-t border-app-border/40 text-[9.5px] text-app-zinc-text font-medium flex items-center justify-between">
                  <span>Estimated cost basis metrics</span>
                  <span className="font-bold flex items-center gap-1 text-app-emerald">Live sync <span className="w-1.5 h-1.5 rounded-full bg-app-emerald animate-ping"></span></span>
                </div>
              </div>
            </div>

            {/* COMPONENT 3: YEAR OVERVIEW ACTIVITY HEATMAP */}
            <div className="bento-card p-5.5 flex flex-col gap-4 bg-app-card/45" id="chronicle-heatmap-card">
              <div className="border-b border-app-border/45 pb-3 flex justify-between items-center flex-wrap gap-4">
                <div>
                  <span className="text-[9px] font-bold text-app-zinc-text uppercase tracking-wider block mb-0.5">TRANSACTION CLOCK FREQUENCY</span>
                  <h3 className="text-base font-black text-app-fg">On-Chain Activity Heatmap (Daily tx activity over last 365 Days)</h3>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-app-zinc-text">
                  <span>Less</span>
                  <div className="w-3.5 h-3.5 rounded bg-zinc-800 border border-app-border/10"></div>
                  <div className="w-3.5 h-3.5 rounded bg-emerald-950/50 border border-app-border/10"></div>
                  <div className="w-3.5 h-3.5 rounded bg-emerald-850/80 border border-app-border/10"></div>
                  <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-app-border/10"></div>
                  <div className="w-3.5 h-3.5 rounded bg-emerald-400 border border-app-border/10"></div>
                  <span>More</span>
                </div>
              </div>

              {/* Heatmap visualization container */}
              <div className="overflow-x-auto w-full scrollbar-none pb-1" id="heatmap-scroll-axis">
                <div className="min-w-[760px] py-1">
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <div className="grid grid-rows-7 text-[9px] text-app-zinc-text font-bold uppercase pr-1 select-none leading-[13px]">
                      <span>Sunday</span>
                      <span className="invisible">M</span>
                      <span>Tuesday</span>
                      <span className="invisible">W</span>
                      <span>Thursday</span>
                      <span className="invisible">F</span>
                      <span>Saturday</span>
                    </div>

                    {/* Renders columns */}
                    <div className="flex gap-[3.5px]">
                      {heatmapGrid.map((week, wkIdx) => (
                        <div key={wkIdx} className="flex flex-col gap-[3.5px]">
                          {week.map((day, dyIdx) => (
                            <div
                              key={dyIdx}
                              className={cn(
                                "w-[11.5px] h-[11.5px] rounded-[2px] transition-all relative group cursor-pointer border border-app-border/5",
                                day.count === 0 && "bg-zinc-800/40",
                                day.count > 0 && day.count <= 2 && "bg-emerald-950/60",
                                day.count > 2 && day.count <= 4 && "bg-emerald-800/70",
                                day.count > 4 && day.count <= 7 && "bg-emerald-600",
                                day.count > 7 && "bg-emerald-400"
                              )}
                            >
                              {/* Hover tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-black text-[9px] text-white font-mono font-black px-2 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 z-50 whitespace-nowrap transition-opacity shadow-lg">
                                {day.date}: {day.count} txs
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COMPONENT 4: HISTORIC SIGNALS LEDGER TABLE & RELATED WALLETS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Signals history ledger (Colspan-8) */}
              <div className="lg:col-span-8 bento-card p-5.5 flex flex-col justify-between bg-app-card/45" id="signal-history-card">
                <div className="border-b border-app-border pb-2.5 mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-app-zinc-text uppercase tracking-wider block mb-0.5">COMPLIANCE SIGNALS REPORT</span>
                    <h3 className="text-sm font-extrabold text-app-fg">Triggered Signals Chronicle</h3>
                  </div>
                  <span className="text-[10px] text-app-zinc-text font-mono bg-app-bg px-2 py-0.5 rounded border border-app-border">
                    {report.signals.length} Historical Swapping Indicators
                  </span>
                </div>

                <div className="flex-grow overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="signals-ledgers-table">
                    <thead>
                      <tr className="text-app-zinc-text font-bold uppercase border-b border-app-border/40 pb-2 text-[10px]">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Token Asset</th>
                        <th className="py-2.5 text-center">Direction</th>
                        <th className="py-2.5 text-center">Confidence</th>
                        <th className="py-2.5 text-right">Outcome Metric</th>
                        <th className="py-2.5 text-right">Mantle Explorer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border/20 text-[11px]">
                      {report.signals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-5 text-center text-app-zinc-text font-medium">
                            No swapping indicators triggered during this tracing period.
                          </td>
                        </tr>
                      ) : (
                        report.signals.map((sig, idx) => (
                          <tr key={idx} className="hover:bg-app-bg/30 transition-colors">
                            <td className="py-3 text-app-zinc-text font-mono font-medium">{sig.date}</td>
                            <td className="py-3 font-extrabold text-app-fg">
                              <span className="bg-app-bg px-2 py-0.5 border border-app-border rounded">
                                {sig.token}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9.5px] font-extrabold pb-1 uppercase",
                                sig.action === 'BUY' && "bg-app-emerald/15 text-app-emerald border border-app-emerald/10",
                                sig.action === 'SELL' && "bg-rose-500/15 text-rose-400 border border-rose-500/10",
                                sig.action.startsWith('LP') && "bg-purple-500/15 text-purple-400 border border-purple-500/10"
                              )}>
                                {sig.action}
                              </span>
                            </td>
                            <td className="py-3 text-center font-mono font-bold text-app-fg">{sig.confidence}%</td>
                            <td className="py-3 text-right">
                              {sig.isProfit === null ? (
                                <span className="text-app-zinc-text font-mono">No metric</span>
                              ) : (
                                <span className={cn(
                                  "font-mono font-bold",
                                  sig.isProfit ? "text-app-emerald" : "text-rose-500"
                                )}>
                                  {sig.outcome}
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-right">
                              <a 
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  alert(`Redirecting to Mantle Explorer transaction: ${sig.txHash}`);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] text-app-zinc-text hover:text-app-emerald font-semibold font-mono border-b border-dashed border-app-border transition-all"
                              >
                                {sig.txHash}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Related wallets panel (Colspan-4) */}
              <div className="lg:col-span-4 bento-card p-5.5 flex flex-col justify-between bg-app-card/45" id="related-wallets-panel">
                <div className="border-b border-app-border pb-2.5 mb-3">
                  <span className="text-[9px] font-bold text-app-zinc-text uppercase tracking-wider block mb-0.5">CO-MOVEMENT INDEX</span>
                  <h3 className="text-sm font-extrabold text-app-fg">Affiliated Smart Wallets</h3>
                </div>

                <div className="flex-grow flex flex-col gap-3 justify-center">
                  <p className="text-[10px] text-app-zinc-text font-medium leading-relaxed mb-1 leading-snug">
                    Addresses executing identical token actions inside the same block cycles on the Mantle Network.
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {report.relatedWallets.map((wallet, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-app-bg/50 border border-app-border hover:border-app-emerald/40 rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-app-fg font-mono">
                            {wallet.ens || `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`}
                          </span>
                          <span className="text-[9px] text-app-zinc-text font-medium font-mono leading-none mt-1">
                            {wallet.address.substring(0, 16)}...
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="text-xs font-black text-app-emerald font-mono">
                            {wallet.sharedTrades} Shared Trades
                          </span>
                          <span className="text-[9px] text-app-zinc-text font-bold uppercase mt-0.5">
                            {wallet.coMovements} co-actions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-app-border/40 text-[9px] text-app-zinc-text font-mono">
                  * Traced utilizing peer transaction flow filters
                </div>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
