"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search,
  Wallet,
  Activity,
  Zap,
  BrainCircuit,
  Clock,
  Shield,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Sun,
  Moon,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Percent,
  Copy,
  Check,
  ExternalLink,
  Info,
  RefreshCw,
  Filter,
  Layers,
  Sliders,
  Sparkles,
  Gauge,
  Cpu,
  Target
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ChameleonLogo } from '@/src/components/ChameleonLogo';
import Link from 'next/link';

interface Transaction {
  type: 'BUY' | 'SELL' | 'LP_ADD' | 'LP_REMOVE';
  token: string;
  amount: string;
  valUSD: string;
  time: string;
  hash: string;
}

interface WalletData {
  id: string;
  dna: string;
  win: string;
  pnl: string;
  pnlUSD: string;
  full: string;
  gasSpent: string;
  activeDays: number;
  allocations: { asset: string; pct: number }[];
  aiInsight: string;
  explanation: string;
  txs: Transaction[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    }
  })
};

// Rich active mock database of smart wallets
const WALLETS_DB: Record<string, WalletData> = {
  '0xabc': {
    id: '0xabc',
    dna: 'Trend Sniper',
    win: '81%',
    pnl: '+240%',
    pnlUSD: '+$240,430',
    full: '0xabc14298cf085b42d76a5b78f4ea492eb9c24942',
    gasSpent: '1.24 ETH',
    activeDays: 142,
    allocations: [
      { asset: 'MNT', pct: 65 },
      { asset: 'ETH', pct: 20 },
      { asset: 'USDC', pct: 10 },
      { asset: 'AGNI', pct: 5 }
    ],
    aiInsight: 'High concentration in MNT ecosystem pools with ultra-fast buy executions under 3 blocks after pool creation.',
    explanation: 'Utilizes customized high-frequency sniper contracts to acquire newly paired tokens. Holds maximum 48 hours for explosive moves then rotates back to L1 stables.',
    txs: [
      { type: 'BUY', token: 'MNT', amount: '82,400', valUSD: '$43,200', time: '14 mins ago', hash: '0x32f1...a42' },
      { type: 'BUY', token: 'AGNI', amount: '124,000', valUSD: '$8,450', time: '2 hours ago', hash: '0x992b...e11' },
      { type: 'SELL', token: 'USDC', amount: '50,000', valUSD: '$50,000', time: '6 hours ago', hash: '0xbc1e...88f' },
      { type: 'LP_ADD', token: 'MNT/ETH', amount: '10,000 LP', valUSD: '$24,000', time: '1 day ago', hash: '0xf41a...d99' }
    ]
  },
  '0xdef': {
    id: '0xdef',
    dna: 'LP Farmer',
    win: '76%',
    pnl: '+140%',
    pnlUSD: '+$140,510',
    full: '0xdef8432ce9dca838bdf8811eef24177dd31c111a',
    gasSpent: '3.82 ETH',
    activeDays: 289,
    allocations: [
      { asset: 'ETH', pct: 45 },
      { asset: 'MNT', pct: 35 },
      { asset: 'USDC', pct: 15 },
      { asset: 'WBTC', pct: 5 }
    ],
    aiInsight: 'Yield optimizer across concentrated liquidity hubs (Uniswap V3, Agni Finance). Captures fee volatility with tight tick range limits.',
    explanation: 'Manages automated rebalancing ranges. Extremely profitable during high social narrative cycles when trade frequency drives high volume pools.',
    txs: [
      { type: 'LP_ADD', token: 'MNT/USDC', amount: '45,000 LP', valUSD: '$90,000', time: '34 mins ago', hash: '0x44fa...7b1' },
      { type: 'SELL', token: 'ETH', amount: '12.5', valUSD: '$38,200', time: '4 hours ago', hash: '0xc112...0fa' },
      { type: 'LP_REMOVE', token: 'ETH/WBTC', amount: '8,000 LP', valUSD: '$52,000', time: '12 hours ago', hash: '0xbb2a...9cc' }
    ]
  },
  '0x44f': {
    id: '0x44f',
    dna: 'Whale Accumulator',
    win: '68%',
    pnl: '+98%',
    pnlUSD: '+$720,110',
    full: '0x44f9cf2e21bbda7c2901977cf923984ca903bccc',
    gasSpent: '0.88 ETH',
    activeDays: 98,
    allocations: [
      { asset: 'ETH', pct: 70 },
      { asset: 'USDC', pct: 25 },
      { asset: 'MNT', pct: 5 }
    ],
    aiInsight: 'Patience-driven whale identity. Limits interactions to institutional vaults and over-the-counter liquidity pools, with almost zero sell history over 6 months.',
    explanation: 'Accumulates heavily during standard deviations below the 30-day moving average. Never buys local tops; prefers deep limit order fills.',
    txs: [
      { type: 'BUY', token: 'ETH', amount: '150.0', valUSD: '$460,000', time: '12 hours ago', hash: '0x88f2...9fb' },
      { type: 'BUY', token: 'MNT', amount: '220,000', valUSD: '$110,000', time: '3 days ago', hash: '0x31da...112' }
    ]
  },
  '0x19a': {
    id: '0x19a',
    dna: 'Arb Bot',
    win: '94%',
    pnl: '+72%',
    pnlUSD: '+$31,250',
    full: '0x19adfa43bb1cc20e9871fcceaa77b94109ca37b1',
    gasSpent: '12.4 ETH',
    activeDays: 450,
    allocations: [
      { asset: 'USDC', pct: 85 },
      { asset: 'ETH', pct: 10 },
      { asset: 'MNT', pct: 5 }
    ],
    aiInsight: 'Flash loan contract executing sandwich and arbitrage transactions across multiple domestic pools synchronously.',
    explanation: 'High gas spent, low risk profile. Exploits micro pool discrepancies under 10 seconds. Keeps 85% assets in stablecoins to secure constant buying power.',
    txs: [
      { type: 'BUY', token: 'MNT', amount: '12,000', valUSD: '$6,200', time: '1 min ago', hash: '0xaba8...1cf' },
      { type: 'SELL', token: 'MNT', amount: '12,050', valUSD: '$6,231', time: '1 min ago', hash: '0xfcf1...3e9' }
    ]
  },
  '0xaa2': {
    id: '0xaa2',
    dna: 'Ape Fund',
    win: '42%',
    pnl: '+65%',
    pnlUSD: '+$84,100',
    full: '0xaa201bbbcca11e7a00ecfa2a912bcf4c0587a009',
    gasSpent: '2.1 ETH',
    activeDays: 61,
    allocations: [
      { asset: 'MNT', pct: 80 },
      { asset: 'MEME', pct: 20 }
    ],
    aiInsight: 'Extremely aggressive risk profile. Targets early-stage launchpad assets and high social media beta-coin pairs.',
    explanation: 'Uses manual high-slippage market buy scripts immediately following token contract deployments. Highly volatile win-rate offset by 10x hits.',
    txs: [
      { type: 'BUY', token: 'MEME', amount: '5,000,000', valUSD: '$12,500', time: '40m ago', hash: '0x12c4...e18' }
    ]
  }
};

const DEFAULT_WALLETS = [
  { id: '0xabc', dna: 'Trend Sniper', win: '81%', pnl: '+240%', full: '0xabc...942' },
  { id: '0xdef', dna: 'LP Farmer', win: '76%', pnl: '+140%', full: '0xdef...11a' },
  { id: '0x44f', dna: 'Whale Accumulator', win: '68%', pnl: '+98%', full: '0x44f...ccc' },
  { id: '0x19a', dna: 'Arb Bot', win: '94%', pnl: '+72%', full: '0x19a...7b1' },
  { id: '0xaa2', dna: 'Ape Fund', win: '42%', pnl: '+65%', full: '0xaa2...009' }
];

export default function Dashboard() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Interactive selected wallet state
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [walletSearchText, setWalletSearchText] = useState('');
  const [tokenSearchText, setTokenSearchText] = useState('');
  const [copied, setCopied] = useState(false);

  // New highly interactive terminal states
  const [alphaFilter, setAlphaFilter] = useState<'ALL' | 'WHALES' | 'ARB'>('ALL');
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');
  const [activeMetricId, setActiveMetricId] = useState<string>('HEALTH');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh feed trigger effect
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Load theme preference on mount
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

  // Triggers search when user hits Enter on Search bars
  const handleWalletSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletSearchText.trim()) return;
    
    const formattedQuery = walletSearchText.toLowerCase().trim();
    const key = Object.keys(WALLETS_DB).find(k => k.toLowerCase() === formattedQuery || k === formattedQuery.slice(0, 5));
    if (key) {
      setSelectedWalletId(key);
    } else {
      // Dynamic on-the-fly generated wallet address for user engagement!
      const userWalletId = formattedQuery.startsWith('0x') ? formattedQuery.slice(0, 5) : `0x${formattedQuery.slice(0, 3)}`;
      WALLETS_DB[userWalletId] = {
        id: userWalletId,
        dna: 'Aggressive Swift Scalper',
        win: '78%',
        pnl: '+192%',
        pnlUSD: '+$64,200',
        full: formattedQuery.startsWith('0x') ? formattedQuery : `0x${formattedQuery}ee84ccaa913bdefa7ac33a109fe2c0`,
        gasSpent: '0.45 ETH',
        activeDays: 45,
        allocations: [
          { asset: 'MNT', pct: 50 },
          { asset: 'ETH', pct: 30 },
          { asset: 'USDC', pct: 20 }
        ],
        aiInsight: 'Custom searched wallet displaying high velocity interaction with leading smart contracts and consistent scalp margins.',
        explanation: 'Maintains extreme latency compliance. Primarily exits positions into stables when daily target exceeds +15%.',
        txs: [
          { type: 'BUY', token: 'MNT', amount: '12,500', valUSD: '$6,800', time: 'Just now', hash: '0xfa11...32d' },
          { type: 'SELL', token: 'ETH', amount: '1.24', valUSD: '$3,800', time: '1 hour ago', hash: '0x99dc...10a' }
        ]
      };
      setSelectedWalletId(userWalletId);
    }
  };

  // Dynamic timeframe-based wallet calculations
  const calculatedWallets = useMemo(() => {
    const scale = timeframe === '24H' ? 1 : timeframe === '7D' ? 3.5 : 11.2;
    return DEFAULT_WALLETS.map(w => {
      // Parse current PNL numeric string
      const num = parseInt(w.pnl.replace(/[^0-9-]/g, ''));
      const adjustedPnl = Math.round(num * scale);
      return {
        ...w,
        pnl: adjustedPnl >= 0 ? `+${adjustedPnl}%` : `${adjustedPnl}%`
      };
    });
  }, [timeframe]);

  // Ecosystem health values mapping dynamically based on active clicked card
  const ecosystemMetrics = [
    { id: 'HEALTH', label: 'Network Health', score: 84, grade: 'Excellent', color: '#00875a', secondaryColor: 'bg-[#00875a]' },
    { id: 'LIQUIDITY', label: 'Liquidity Pools', score: 92, grade: 'Deep Pool Cap', color: '#3b82f6', secondaryColor: 'bg-blue-500' },
    { id: 'GROWTH', label: 'User Growth', score: 86, grade: 'Parabolic', color: '#8b5cf6', secondaryColor: 'bg-indigo-500' },
    { id: 'CONFIDENCE', label: 'Whale Confidence', score: 74, grade: 'Highly Bullish', color: '#f59e0b', secondaryColor: 'bg-amber-500' },
    { id: 'RISK', label: 'Ecosystem Risk', score: 18, grade: 'Ultra Low Risk', color: '#ef4444', secondaryColor: 'bg-rose-500' },
  ];

  const activeEcosystemObj = useMemo(() => {
    return ecosystemMetrics.find(m => m.id === activeMetricId) || ecosystemMetrics[0];
  }, [activeMetricId]);

  // Live alerts array
  const alertsData = [
    { type: 'Whale Accumulation', conf: 91, wallet: '0xabc', token: 'MNT', time: 'Just now', msg: '3 profitable wallets accumulated 250k MNT in the last 15 mins.', category: 'WHALES' },
    { type: 'Smart Money Outflow', conf: 84, wallet: '0xdef', token: 'USDC', time: '2m ago', msg: 'High win-rate trader swapped 500k MNT to USDC.', category: 'WHALES' },
    { type: 'DEX Arb Opportunity', conf: 96, wallet: 'System', token: 'AGNI', time: '4m ago', msg: 'Price discrepancy > 1.2% detected across pools.', category: 'ARB' },
    { type: 'New Trend Sniper', conf: 78, wallet: '0xaa2', token: 'MEME', time: '12m ago', msg: 'Wallet with 80% recent win rate bought new pair.', category: 'ARB' },
    { type: 'Liquidity Injection', conf: 88, wallet: '0x44f', token: 'ETH', time: '15m ago', msg: 'Massive $2.4M liquidity added to MNT/ETH pool.', category: 'WHALES' }
  ];

  // Dynamic filter for alerts feed based on Category + Token Search Input match
  const filteredAlerts = useMemo(() => {
    return alertsData.filter(alert => {
      // Filter by click category Tab
      if (alphaFilter !== 'ALL' && alert.category !== alphaFilter) {
        return false;
      }
      // Filter by typing a Token ticker (match case-insensitive)
      if (tokenSearchText.trim()) {
        const query = tokenSearchText.toUpperCase().trim();
        return alert.token.toUpperCase().includes(query) || alert.type.toUpperCase().includes(query) || alert.wallet.toUpperCase().includes(query);
      }
      return true;
    });
  }, [alphaFilter, tokenSearchText]);

  const currentWalletObj = selectedWalletId ? WALLETS_DB[selectedWalletId] : null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "min-h-screen bg-app-bg text-app-fg font-sans p-4 md:p-6 flex flex-col gap-6 transition-colors duration-500",
      isDarkMode ? "dark" : "light"
    )}>
      {/* Top Bar Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between bg-app-card border border-app-border rounded-[12px] p-2.5 lg:py-2 lg:px-5 shadow-[var(--app-shadow)] gap-4"
      >
        {/* Brand/Logo Area */}
        <div className="flex items-center justify-between lg:justify-start gap-4">
          <Link href="/" className="flex items-center gap-3.5 group outline-none rounded-xl">
            <div className="p-1.5 bg-app-emerald/[0.08] dark:bg-app-emerald/15 border border-app-emerald/20 rounded-lg transition-all duration-300 shadow-inner group-hover:scale-105">
              <ChameleonLogo className="w-6 h-6 text-app-emerald relative z-10" animated={false} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-app-fg tracking-tight text-sm group-hover:text-app-emerald transition-colors">Chameleon</h1>
                <span className="text-[9px] bg-app-emerald/10 text-app-emerald border border-app-emerald/15 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">PRO v2.4</span>
              </div>
              <p className="text-[9px] text-app-zinc-text font-medium leading-none mt-0.5">Institutional Web3 Stream Deck</p>
            </div>
          </Link>
          
          <div className="h-8 w-[1px] bg-app-border/60 hidden lg:block" />
        </div>

        {/* Global Action Engine Search Filters */}
        <div className="flex-1 max-w-2xl flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleWalletSearchSubmit} className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-zinc-text group-focus-within:text-app-emerald transition-colors" />
            <input 
              type="text" 
              placeholder="Search Wallet Address... (Press Enter)" 
              value={walletSearchText}
              onChange={(e) => setWalletSearchText(e.target.value)}
              className="w-full bg-app-bg border border-app-border/90 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-app-emerald focus:ring-1 focus:ring-app-emerald/23 transition-all font-mono placeholder:text-app-zinc-text text-app-fg shadow-sm"
            />
            {walletSearchText && (
              <button 
                type="button" 
                onClick={() => setWalletSearchText('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-app-zinc-text hover:text-app-fg"
              >
                Clear
              </button>
            )}
          </form>

          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-zinc-text focus-within:text-app-emerald transition-colors" />
            <input 
              type="text" 
              placeholder="Filter Alerts By Token Ticker (e.g. MNT)" 
              value={tokenSearchText}
              onChange={(e) => setTokenSearchText(e.target.value)}
              className="w-full bg-app-bg border border-app-border/90 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-app-emerald focus:ring-1 focus:ring-app-emerald/23 transition-all font-mono uppercase tracking-wider placeholder:text-app-zinc-text text-app-fg shadow-sm"
            />
            {tokenSearchText && (
              <button 
                type="button" 
                onClick={() => setTokenSearchText('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-app-zinc-text hover:text-app-fg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* System Diagnostics & Utilities */}
        <div className="flex items-center justify-between sm:justify-end gap-3 overflow-x-auto">
          {/* Static Latency Feed */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-app-bg border border-app-border/70 rounded-lg text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-app-fg/80 font-semibold">NODE: CHAMELEON-02</span>
            <span className="text-app-zinc-text border-l border-app-border/60 pl-2">LATENCY: 5ms</span>
          </div>

          {/* Theme Switcher Widget */}
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-bg border border-app-border hover:bg-app-card-hover text-app-fg hover:border-app-emerald/30 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ y: -6, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 6, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.12 }}
                className="flex items-center justify-center"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Quick Manual Stream Refresh */}
          <button
            onClick={handleManualRefresh}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg bg-app-bg border border-app-border hover:bg-app-card-hover text-app-fg hover:border-app-emerald/30 transition-all duration-300 shadow-sm active:scale-95 cursor-pointer",
              isRefreshing && "text-app-emerald"
            )}
            title="Force refresh data node"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          </button>

          {/* Wallet Action Component */}
          <button 
            onClick={() => {
              setWalletConnected(!walletConnected);
              if (!walletConnected) {
                alert("Simulating MetaMask/WalletConnect webhook authorization. Your address is successfully synchronized client-side.");
              }
            }}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95 cursor-pointer",
              walletConnected 
                ? "bg-app-card-hover text-app-fg border border-app-border hover:bg-app-bg hover:border-app-zinc-text/35" 
                : "bg-app-emerald text-white hover:bg-[#00704a] hover:shadow-md border border-transparent"
            )}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>{walletConnected ? '0x82c8...A41B' : 'Connect'}</span>
          </button>
        </div>
      </motion.header>

      {/* Main 4-Column Terminal Bounding Box (Set to 2x2 Grid with 16px gap) */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow overflow-hidden">
        
        {/* Widget 1: Live Alpha Stream (Filtered Column) */}
        <motion.div 
          custom={0} 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible" 
          className="bento-card p-0 flex flex-col h-[580px] overflow-hidden"
        >
          {/* Header & Live Pulse */}
          <div className="flex justify-between items-center py-3 px-4 border-b border-app-border">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-semibold text-app-fg uppercase tracking-widest">Live Alpha Stream</h2>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-app-zinc-text font-medium font-mono">LIVE: {filteredAlerts.length}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-app-emerald animate-pulse" />
            </div>
          </div>

          {/* Interactive Stream Filters Level 2 */}
          <div className="p-3 pb-2">
            <div className="flex gap-1 p-0.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg border border-black/[0.05] dark:border-white/[0.05]">
              {(['ALL', 'WHALES', 'ARB'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAlphaFilter(cat)}
                  className={cn(
                    "flex-1 text-[10px] font-medium uppercase tracking-wider py-1 rounded-md transition-all duration-200 cursor-pointer",
                    alphaFilter === cat 
                      ? "bg-app-bg dark:bg-app-card-hover text-app-emerald shadow-sm font-semibold border border-app-border" 
                      : "text-app-zinc-text hover:text-app-fg"
                  )}
                >
                  {cat === 'ALL' ? 'All Alerts' : cat === 'WHALES' ? 'Whales' : 'Arb / Sniper'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Live Alerts Stream List Container - full width items */}
          <div className="flex-grow overflow-y-auto pr-0 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-app-zinc-text py-12">
                <Shield className="w-8 h-8 opacity-40 mb-2.5" />
                <p className="text-xs font-semibold">No alerts matching filter options.</p>
                <button onClick={() => {setAlphaFilter('ALL'); setTokenSearchText('');}} className="text-xs text-app-emerald font-bold uppercase mt-2 hover:underline">Reset Filters</button>
              </div>
            ) : (
              filteredAlerts.map((alert, i) => {
                const isSearchedMatch = tokenSearchText && alert.token.toUpperCase().includes(tokenSearchText.toUpperCase());
                return (
                  <motion.div 
                    layoutId={`alert-${alert.type}-${i}`}
                    key={i} 
                    onClick={() => {
                      if (alert.wallet !== 'System') {
                        setSelectedWalletId(alert.wallet);
                      }
                    }}
                    className={cn(
                      "group w-full border-b border-app-border p-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all duration-300 cursor-pointer flex flex-col",
                      isSearchedMatch 
                        ? "border-amber-500/40 bg-amber-500/[0.02]" 
                        : "border-app-border"
                    )}
                  >
                    {/* Badge / Category & Time */}
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider border",
                        alert.conf >= 90 ? "bg-app-emerald/10 text-app-emerald border-app-emerald/15" : 
                        alert.conf >= 80 ? "bg-amber-500/10 text-amber-500 border-amber-500/15" : "bg-blue-500/10 text-blue-400 border-blue-500/15"
                      )}>
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-app-zinc-text font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-app-zinc-text" /> {alert.time}
                      </span>
                    </div>
                    
                    {/* Wallet id / Token ID */}
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="text-[13px] font-medium text-app-zinc-text">
                        Trader: <span className="text-app-fg font-semibold group-hover:text-app-emerald transition-colors">{alert.wallet}</span>
                      </div>
                      <div className="font-mono text-[13px] font-semibold text-app-fg text-right">
                        {alert.token}
                      </div>
                    </div>
                    
                    {/* Artificial Intelligence DNA Deep Dive Container */}
                    <div className="relative overflow-hidden bg-app-emerald/[0.03] border-l-2 border-app-emerald p-2.5 rounded-r">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-app-emerald/15 text-app-emerald text-[9px] font-semibold tracking-wide">
                          AI INSIGHT
                        </div>
                      </div>
                      
                      {/* Confidence score progress bar under the badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-grow bg-black/[0.08] dark:bg-white/[0.08] h-1 rounded-full overflow-hidden">
                          <div className="bg-app-emerald h-full rounded-full transition-all duration-500" style={{ width: `${alert.conf}%` }} />
                        </div>
                        <span className="text-[9px] font-mono font-medium text-app-emerald">{alert.conf}% CONF</span>
                      </div>
                      
                      <p className="text-[13px] text-app-fg font-medium leading-relaxed">{alert.msg}</p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Widget 2: Ecosystem Health (Interactive Controller Gauges) */}
        <motion.div 
          custom={1} 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible" 
          className="bento-card p-0 flex flex-col h-[580px] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center py-3 px-4 border-b border-app-border mb-3">
            <h2 className="text-[11px] font-semibold text-app-fg uppercase tracking-widest">Ecosystem Analyser</h2>
            
            {/* Click explanation indicator - Outlined Style */}
            <span className="text-[9px] font-semibold uppercase tracking-widest border border-blue-500/50 text-blue-400 bg-transparent px-2 py-0.5 rounded-full select-none">
              TAP METRICS
            </span>
          </div>
          
          {/* Gauge Widget */}
          <div className="flex-grow flex flex-col items-center justify-between px-4 pb-4">
            <div className="flex flex-col items-center text-center mt-2">
              <span className="text-[11px] uppercase tracking-[0.08em] text-app-zinc-text font-semibold">
                {activeEcosystemObj.label}
              </span>
            </div>
            
            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="64" stroke="var(--app-border)" strokeWidth="12" fill="none" className="opacity-70" />
                <motion.circle 
                  cx="75" 
                  cy="75" 
                  r="64" 
                  stroke={activeEcosystemObj.id === 'RISK' ? '#EF4444' : activeEcosystemObj.id === 'CONFIDENCE' ? '#D97706' : 'var(--app-emerald)'}
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="402.12" 
                  animate={{ strokeDashoffset: 402.12 - (402.12 * activeEcosystemObj.score) / 100 }}
                  transition={{ type: "spring", stiffness: 60, damping: 12 }}
                  strokeLinecap="round"
                  className="origin-center"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[30px] font-bold font-mono text-app-fg tracking-tight leading-none">
                  {activeEcosystemObj.score}%
                </span>
                <span className={cn(
                  "text-[9px] border font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mt-2 select-none whitespace-nowrap",
                  activeMetricId === 'RISK' 
                    ? "text-red-500 border-red-500/20 bg-red-500/10" 
                    : "text-app-emerald border-app-emerald/20 bg-app-emerald/10"
                )}>
                  {activeEcosystemObj.grade}
                </span>
              </div>
            </div>

            {/* Clickable Controller Rows - Dynamically changes the gauge above */}
            <div className="w-full space-y-1.5">
              {ecosystemMetrics.map((m) => {
                const isActive = activeMetricId === m.id;
                return (
                  <button 
                    key={m.id} 
                    onClick={() => setActiveMetricId(m.id)}
                    className={cn(
                      "w-full text-left flex flex-col gap-1 p-2 rounded-lg border transition-all duration-300 group cursor-pointer",
                      isActive 
                        ? "bg-app-bg dark:bg-app-card-hover border-app-emerald/45 shadow-sm scale-[1.01]" 
                        : "bg-transparent border-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className={cn(
                        "text-[13px] font-medium transition-colors duration-200",
                        isActive ? "text-app-fg" : "text-app-zinc-text group-hover:text-app-fg"
                      )}>
                        {m.label}
                      </span>
                      <span className={cn(
                        "font-mono text-[13px] font-semibold transition-colors duration-200",
                        isActive ? "text-app-emerald" : "text-app-zinc-text"
                      )}>
                        {m.score}/100
                      </span>
                    </div>
                    
                    <div className="h-[4px] w-full bg-black/[0.08] dark:bg-white/[0.08] rounded-full overflow-hidden mt-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          m.id === 'RISK' ? "bg-red-500" : m.id === 'CONFIDENCE' ? "bg-amber-500" : "bg-app-emerald"
                        )} 
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Widget 3: Active Narratives (Synthesis Graph Blocks) */}
        <motion.div 
          custom={2} 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible" 
          className="bento-card p-0 flex flex-col h-[580px] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center py-3 px-4 border-b border-app-border mb-3">
            <h2 className="text-[11px] font-semibold text-app-fg uppercase tracking-widest">Active Narratives</h2>
            <span className="text-[10px] text-app-zinc-text font-medium font-mono">24H WEIGHT</span>
          </div>

          {/* Social Narrative List */}
          <div className="flex-grow flex flex-col justify-center space-y-2 px-4 pb-2">
            {[
              { name: 'AI x Crypto', pct: 92, color: 'bg-app-emerald', text: 'text-app-emerald', desc: 'Focusing on high GPU cluster projects & DePIN hubs' },
              { name: 'Restaking Network', pct: 74, color: 'bg-amber-500', text: 'text-amber-500 dark:text-amber-400', desc: 'Active accumulation across EigenLayer liquid stables' },
              { name: 'Gaming / Beta Asset', pct: 61, color: 'bg-red-500', text: 'text-red-500 dark:text-red-400', desc: 'High trade volatility driven by retail game launchpads' },
              { name: 'RWA Vaults', pct: 40, color: 'bg-amber-500', text: 'text-amber-500 dark:text-amber-400', desc: 'Steady institutional capital inflows into yield Treasuries' },
              { name: 'DePIN Systems', pct: 28, color: 'bg-red-500', text: 'text-red-500 dark:text-red-400', desc: 'Decentralized bandwidth exchanges showing node expansion' },
              { name: 'L2 Rollups', pct: 15, color: 'bg-app-zinc-text', text: 'text-app-zinc-text', desc: 'Standard low-level smart contracts processing transfers' }
            ].map((nar, idx) => (
              <div key={idx} className="group cursor-pointer p-2.5 rounded-lg transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[13px] font-medium text-app-fg uppercase tracking-wider group-hover:text-app-emerald transition-colors">{nar.name}</span>
                  <span className={cn("text-[11px] font-mono font-medium", nar.text)}>{nar.pct}%</span>
                </div>
                
                {/* Thin 4px solid progress bar with the % in small text after as processed above */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[4px] bg-black/[0.08] dark:bg-white/[0.08] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${nar.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn("h-full rounded-full", nar.color)} 
                    />
                  </div>
                </div>
                
                <p className="text-[11px] text-app-zinc-text mt-1.5 hidden group-hover:block transition-all duration-200">
                  {nar.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-auto mx-4 mb-4 bg-black/[0.01] dark:bg-white/[0.01] p-3 rounded-lg border border-app-border text-[11px] text-app-zinc-text font-medium leading-relaxed text-center">
            Narratives configured from aggregated social volume, liquidity spikes, & smart whale transfers over 24h metrics.
          </div>
        </motion.div>

        {/* Widget 4: Top Smart Wallets OR Wallet Profile Detail View */}
        <motion.div 
          custom={3} 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible" 
          className="bento-card p-0 flex flex-col h-[580px] overflow-hidden font-sans"
        >
          <AnimatePresence mode="wait">
            {!selectedWalletId ? (
              // DEFAULT VIEW: LIST OF TOP SMART WALLETS
              <motion.div
                key="list"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Header Widget */}
                <div className="flex justify-between items-center py-3 px-4 border-b border-app-border mb-3">
                  <h2 className="text-[11px] font-semibold text-app-fg uppercase tracking-widest">Top Whales</h2>
                  
                  {/* Timeframe Selectors */}
                  <div className="flex p-0.5 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg border border-black/[0.05] dark:border-white/[0.05]">
                    {(['24H', '7D', '30D'] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={cn(
                          "text-[9px] font-semibold uppercase py-1 px-2 rounded-md transition-all cursor-pointer",
                          timeframe === tf 
                            ? "bg-app-bg dark:bg-app-card-hover text-app-emerald border border-app-border shadow-sm font-bold" 
                            : "text-app-zinc-text hover:text-app-fg"
                        )}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Header Row */}
                <div className="flex text-[10px] uppercase tracking-widest font-semibold text-app-zinc-text pb-2 border-b border-app-border/40 px-4 mb-2">
                  <div className="w-[8%] text-left">Rank</div>
                  <div className="w-[32%] text-left">Wallet</div>
                  <div className="w-[30%] text-left">DNA Segment</div>
                  <div className="w-[15%] text-right mr-1.5">Win%</div>
                  <div className="w-[15%] text-right">Est PnL</div>
                </div>

                {/* Custom list of calculated wallets */}
                <div className="flex-grow overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent pr-1 px-2">
                  {calculatedWallets.map((w, i) => {
                    const winVal = parseFloat(w.win);
                    const winColorCls = winVal >= 70 ? "text-app-emerald" : winVal >= 50 ? "text-amber-500" : "text-red-500";
                    const pnlColorCls = w.pnl.startsWith('+') ? "text-app-emerald" : w.pnl.startsWith('-') ? "text-red-500" : "text-amber-500";

                    // Determine pill colors and classes for DNA
                    let dnaBadgeCls = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                    if (w.dna.toLowerCase().includes('lp')) {
                      dnaBadgeCls = "bg-app-emerald/10 text-app-emerald border-app-emerald/20";
                    } else if (w.dna.toLowerCase().includes('whale')) {
                      dnaBadgeCls = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                    } else if (w.dna.toLowerCase().includes('arb')) {
                      dnaBadgeCls = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
                    } else if (w.dna.toLowerCase().includes('ape')) {
                      dnaBadgeCls = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
                    }

                    return (
                      <div 
                        key={i} 
                        onClick={() => setSelectedWalletId(w.id)}
                        className="flex items-center text-xs bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border border-transparent hover:border-app-border/40 p-2.5 rounded-lg transition-all cursor-pointer group"
                      >
                        {/* Subtle Rank Column */}
                        <div className="w-[8%] text-left font-mono text-[11px] font-semibold text-app-zinc-text">
                          #{i + 1}
                        </div>

                        {/* Wallet / Address ID */}
                        <div className="w-[32%] flex items-center font-mono font-semibold text-app-fg group-hover:text-app-emerald transition-colors truncate">
                          <span>{w.id}</span>
                        </div>
                        
                        {/* DNA Segment badge - pill shape, opacity-15 */}
                        <div className="w-[30%] flex items-center">
                          <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", dnaBadgeCls)}>
                            {w.dna}
                          </span>
                        </div>

                        {/* Win% Column with dynamic coloring */}
                        <div className={cn("w-[15%] text-right font-mono font-semibold mr-1.5 transition-colors", winColorCls)}>
                          {w.win}
                        </div>

                        {/* PnL Column with dynamic coloring */}
                        <div className={cn("w-[15%] text-right font-mono font-semibold transition-colors", pnlColorCls)}>
                          {w.pnl}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Synced portfolio CTA block */}
                <div className="mt-auto mx-4 mb-4 bg-black/[0.01] dark:bg-white/[0.01] border border-app-border p-3 rounded-lg flex justify-between items-center cursor-pointer hover:border-app-emerald/50 hover:bg-transparent transition-all group">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-app-emerald uppercase tracking-wider">Your Personal Trade Book</span>
                    <span className="text-xs text-app-zinc-text font-medium mt-0.5">Sync wallet to track trades</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-app-emerald/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Wallet className="w-3.5 h-3.5 text-app-emerald" />
                  </div>
                </div>
              </motion.div>
            ) : (
              // ACTIVE WALLET PROFILE DETAILS SCREEN
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Profile Header */}
                <div className="flex items-center justify-between py-3 px-4 border-b border-app-border mb-3">
                  <button 
                    onClick={() => setSelectedWalletId(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-app-zinc-text hover:text-app-fg transition-colors group cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Whales</span>
                  </button>
                  <span className="text-[10px] bg-app-emerald/10 text-app-emerald border border-app-emerald/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    TRACKED LIVE
                  </span>
                </div>

                <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-app-border scrollbar-track-transparent">
                  {/* Address Card */}
                  <div className="bg-app-bg dark:bg-app-card-hover border border-app-border rounded-lg p-3 mx-4 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-app-zinc-text">Wallet Profile</span>
                      <span className="text-[10px] font-mono bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                        {currentWalletObj?.dna}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 font-mono text-xs font-bold text-app-fg">
                      <span className="text-sm tracking-wider">{currentWalletObj?.id}</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => currentWalletObj && handleCopy(currentWalletObj.full)}
                          className="p-1.5 bg-black/[0.02] dark:bg-white/[0.02] hover:text-app-emerald border border-app-border hover:border-app-emerald rounded-lg transition-all cursor-pointer pointer-events-auto"
                          title="Copy address"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-app-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a 
                          href={`https://etherscan.io/address/${currentWalletObj?.full}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-black/[0.02] dark:bg-white/[0.02] hover:text-app-emerald border border-app-border hover:border-app-emerald rounded-lg transition-all cursor-pointer"
                          title="View on Explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                    <p className="text-[10px] text-app-zinc-text font-mono truncate mt-1.5 opacity-85">{currentWalletObj?.full}</p>
                  </div>

                  {/* Profit Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mx-4">
                    <div className="bg-transparent border border-app-border rounded-lg p-3 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-app-zinc-text">Win Rate</span>
                        <Percent className="w-3.5 h-3.5 text-app-zinc-text" />
                      </div>
                      <span className={cn(
                        "text-lg font-bold font-mono mt-1",
                        parseFloat(currentWalletObj?.win || "0") >= 70 ? "text-app-emerald" : parseFloat(currentWalletObj?.win || "0") >= 50 ? "text-amber-500" : "text-red-500"
                      )}>
                        {currentWalletObj?.win}
                      </span>
                    </div>
                    
                    <div className="bg-transparent border border-app-border rounded-lg p-3 flex flex-col">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-app-zinc-text">Est. PnL</span>
                        <TrendingUp className="w-3.5 h-3.5 text-app-emerald" />
                      </div>
                      <span className={cn(
                        "text-lg font-bold font-mono mt-1",
                        currentWalletObj?.pnl.startsWith('+') ? "text-app-emerald" : currentWalletObj?.pnl.startsWith('-') ? "text-red-500" : "text-amber-500"
                      )}>
                        {currentWalletObj?.pnl}
                      </span>
                      <span className="text-[10px] font-mono text-app-zinc-text font-medium mt-0.5">
                        {currentWalletObj?.pnlUSD}
                      </span>
                    </div>
                  </div>

                  {/* Portfolio Weighting Allocations */}
                  <div className="px-4">
                    <h3 className="text-[11px] font-semibold text-app-fg uppercase tracking-widest mb-2.5">Asset Allocation</h3>
                    <div className="space-y-2">
                      {currentWalletObj?.allocations.map((alloc, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-app-fg font-medium">{alloc.asset}</span>
                            <span className="text-app-zinc-text">{alloc.pct}%</span>
                          </div>
                          <div className="h-[4px] w-full bg-black/[0.08] dark:bg-white/[0.08] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-app-emerald rounded-full" 
                              style={{ width: `${alloc.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Strategist Deep-dive */}
                  <div className="bg-app-emerald/[0.02] border border-app-emerald/20 rounded-lg p-3.5 mx-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BrainCircuit className="w-4 h-4 text-app-emerald" />
                      <span className="text-[10px] font-bold text-app-emerald uppercase tracking-widest font-mono">AI STRAW DNA ANALYSIS</span>
                    </div>
                    <p className="text-[13px] text-app-fg font-medium leading-relaxed mb-2">
                      {currentWalletObj?.aiInsight}
                    </p>
                    <p className="text-[11px] text-app-zinc-text leading-relaxed">
                      {currentWalletObj?.explanation}
                    </p>
                  </div>

                  {/* Historic Trades Ledger */}
                  <div className="px-4">
                    <h3 className="text-[11px] font-semibold text-app-fg uppercase tracking-widest mb-3">Recent Trade Ledger</h3>
                    <div className="space-y-1.5">
                      {currentWalletObj?.txs.map((tx, idx) => (
                        <div key={idx} className="bg-transparent border border-app-border hover:bg-black/[0.02] dark:hover:bg-white/[0.02] p-2.5 rounded-lg flex items-center justify-between text-xs transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase",
                              tx.type === 'BUY' ? "bg-app-emerald/10 text-app-emerald border-app-emerald/20" :
                              tx.type === 'SELL' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                            )}>
                              {tx.type}
                            </span>
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-app-fg">{tx.amount} {tx.token}</span>
                              <span className="text-[10px] text-app-zinc-text font-medium">{tx.time}</span>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-app-fg">{tx.valUSD}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => alert(`Webhook link generated! The Chameleon AI terminal will automatically mirror copy-trading actions of system address ${selectedWalletId} straight into your connected wallet.`)}
                  className="mt-auto mx-4 mb-4 bg-app-emerald hover:brightness-95 text-white font-bold uppercase tracking-wider text-center text-xs py-3 rounded-lg hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-[0.98]"
                >
                  Setup Automated Mirror Trade Link
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </main>
    </div>
  );
}
