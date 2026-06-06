"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Flame, 
  Layers, 
  TrendingUp, 
  Zap, 
  Shield, 
  Cpu, 
  Database, 
  Sun, 
  Moon, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw,
  Sparkles,
  Search,
  Check,
  Copy,
  Clock,
  ArrowRight,
  Network,
  Share2,
  AlertTriangle,
  FileText,
  TrendingDown,
  Coins,
  Globe,
  ArrowBigUp
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
import { cn } from '../../lib/utils';
import { ChameleonLogo } from '../../components/ChameleonLogo';
import Link from 'next/link';

interface TokenFlow {
  symbol: string;
  price: string;
  volume24h: string;
  flow24h: string;
  isPositive: boolean;
}

interface WalletPushing {
  id: string;
  name: string;
  flow: string;
  winRate: string;
}

interface BridgeActivity {
  sourceChain: string;
  targetAsset: string;
  amount: string;
  txCount: number;
}

interface Narrative {
  id: string;
  label: string;
  confidence: number;
  inflow24h: string;
  intensity: number; // 0.1 to 1.0 (Capital Momentum)
  description: string;
  tokens: TokenFlow[];
  wallets: WalletPushing[];
  bridgeActivity: BridgeActivity[];
  chartData: { day: string; inflow: number }[];
  socialOnChainMentionVolume: string;
  mentionDelta24h: string;
}

interface UnusualBridgeFlow {
  sourceChain: string;
  amount: string;
  narrativeCategory: string;
  asset: string;
  txHash: string;
  timeAgo: string;
  severity: 'critical' | 'high' | 'normal';
}

const NARRATIVES_DATABASE: Narrative[] = [
  {
    id: 'ai-coins',
    label: 'AI Coins',
    confidence: 96,
    inflow24h: '+$14.2M',
    intensity: 0.95,
    description: 'Decentralized compute frameworks and autonomous AI agents stacking liquidity into cooperative mETH-paired DEX pools.',
    socialOnChainMentionVolume: '18.2K Mentions',
    mentionDelta24h: '+34.2%',
    tokens: [
      { symbol: 'MNT-AI', price: '$1.42', volume24h: '$3.84M', flow24h: '+$2.11M', isPositive: true },
      { symbol: 'AGNI-GPT', price: '$0.84', volume24h: '$4.11M', flow24h: '+$1.94M', isPositive: true },
      { symbol: 'SPECTRA', price: '$2.11', volume24h: '$1.98M', flow24h: '+$940K', isPositive: true },
      { symbol: 'COGNITIVE', price: '$0.045', volume24h: '$840K', flow24h: '+$420K', isPositive: true },
      { symbol: 'LCGPU', price: '$12.40', volume24h: '$240K', flow24h: '-$30K', isPositive: false }
    ],
    wallets: [
      { id: '0x3Af...c1E9', name: 'Alpha Sniper', flow: '+$840K', winRate: '81%' },
      { id: '0x88D...33f1', name: 'Agent Accumulator', flow: '+$520K', winRate: '92%' },
      { id: '0xe21...7cA0', name: 'DEX Arb Bot', flow: '+$310K', winRate: '78%' }
    ],
    bridgeActivity: [
      { sourceChain: 'Ethereum Mainnet', targetAsset: 'USDC', amount: '$4,200,000', txCount: 142 },
      { sourceChain: 'Arbitrum', targetAsset: 'MNT-AI', amount: '$1,850,000', txCount: 89 },
      { sourceChain: 'BSC Mainnet', targetAsset: 'AGNI-GPT', amount: '$940,000', txCount: 41 }
    ],
    chartData: [
      { day: 'Day 1', inflow: 4.2 }, { day: 'Day 2', inflow: 4.8 }, { day: 'Day 3', inflow: 3.9 },
      { day: 'Day 4', inflow: 5.4 }, { day: 'Day 5', inflow: 6.8 }, { day: 'Day 6', inflow: 7.2 },
      { day: 'Day 7', inflow: 8.4 }, { day: 'Day 8', inflow: 8.0 }, { day: 'Day 9', inflow: 9.6 },
      { day: 'Day 10', inflow: 11.2 }, { day: 'Day 11', inflow: 10.8 }, { day: 'Day 12', inflow: 12.4 },
      { day: 'Day 13', inflow: 13.9 }, { day: 'Day 14', inflow: 14.2 }
    ]
  },
  {
    id: 'restaking',
    label: 'Restaking',
    confidence: 89,
    inflow24h: '+$12.8M',
    intensity: 0.88,
    description: 'Liquid staking derivatives backing multi-chain validation subnets, heavily locking stETH and mETH (Mantle LSP).',
    socialOnChainMentionVolume: '14.9K Mentions',
    mentionDelta24h: '+21.5%',
    tokens: [
      { symbol: 'mETH', price: '$3,480.00', volume24h: '$12.8M', flow24h: '+$4.21M', isPositive: true },
      { symbol: 'stETH', price: '$3,475.00', volume24h: '$9.44M', flow24h: '+$3.82M', isPositive: true },
      { symbol: 'LST-MNT', price: '$1.05', volume24h: '$4.20M', flow24h: '+$1.12M', isPositive: true },
      { symbol: 'VAL-SHIELD', price: '$0.52', volume24h: '$1.92M', flow24h: '+$840K', isPositive: true },
      { symbol: 'EIGEN-MNT', price: '$3.55', volume24h: '$3.10M', flow24h: '+$210K', isPositive: true }
    ],
    wallets: [
      { id: '0x44F...eA12', name: 'Staking Whale', flow: '+$1,450K', winRate: '75%' },
      { id: '0xe21...7cA0', name: 'DEX Arb Bot', flow: '+$920K', winRate: '78%' },
      { id: '0xVC9...218d', name: 'VC Smart Treasury', flow: '+$640K', winRate: '86%' }
    ],
    bridgeActivity: [
      { sourceChain: 'Ethereum Mainnet', targetAsset: 'stETH', amount: '$6,500,000', txCount: 210 },
      { sourceChain: 'BSC Mainnet', targetAsset: 'mETH', amount: '$1,200,000', txCount: 54 },
      { sourceChain: 'Arbitrum One', targetAsset: 'stETH', amount: '$850,000', txCount: 39 }
    ],
    chartData: [
      { day: 'Day 1', inflow: 3.1 }, { day: 'Day 2', inflow: 3.5 }, { day: 'Day 3', inflow: 4.2 },
      { day: 'Day 4', inflow: 5.1 }, { day: 'Day 5', inflow: 4.8 }, { day: 'Day 6', inflow: 6.2 },
      { day: 'Day 7', inflow: 6.9 }, { day: 'Day 8', inflow: 7.4 }, { day: 'Day 9', inflow: 8.5 },
      { day: 'Day 10', inflow: 9.1 }, { day: 'Day 11', inflow: 10.4 }, { day: 'Day 12', inflow: 11.2 },
      { day: 'Day 13', inflow: 12.1 }, { day: 'Day 14', inflow: 12.8 }
    ]
  },
  {
    id: 'stablecoins',
    label: 'Stablecoins',
    confidence: 91,
    inflow24h: '+$18.4M',
    intensity: 0.92,
    description: 'Yield-bearing fiat structures, baseline pool currencies, and USDY (Ondo) expanding smart on-chain treasury rates.',
    socialOnChainMentionVolume: '24.1K Mentions',
    mentionDelta24h: '+8.4%',
    tokens: [
      { symbol: 'USDY', price: '$1.04', volume24h: '$8.20M', flow24h: '+$2.45M', isPositive: true },
      { symbol: 'USDC', price: '$1.00', volume24h: '$24.2M', flow24h: '+$8.40M', isPositive: true },
      { symbol: 'USDT', price: '$1.00', volume24h: '$19.5M', flow24h: '+$6.11M', isPositive: true },
      { symbol: 'mUSD', price: '$1.00', volume24h: '$1.40M', flow24h: '+$1.12M', isPositive: true },
      { symbol: 'fUSD', price: '$0.99', volume24h: '$420K', flow24h: '+$320K', isPositive: true }
    ],
    wallets: [
      { id: '0xVC9...218d', name: 'VC Smart Treasury', flow: '+$3,400K', winRate: '86%' },
      { id: '0xe21...7cA0', name: 'DEX Arb Bot', flow: '+$2,800K', winRate: '78%' },
      { id: '0x79B...91F2', name: 'USD Stable Farmer', flow: '+$1,450K', winRate: '94%' }
    ],
    bridgeActivity: [
      { sourceChain: 'Ethereum Mainnet', targetAsset: 'USDC', amount: '$11,200,000', txCount: 421 },
      { sourceChain: 'Arbitrum One', targetAsset: 'USDT', amount: '$4,100,000', txCount: 154 },
      { sourceChain: 'BSC Mainnet', targetAsset: 'USDY', amount: '$3,100,000', txCount: 94 }
    ],
    chartData: [
      { day: 'Day 1', inflow: 11.2 }, { day: 'Day 2', inflow: 11.9 }, { day: 'Day 3', inflow: 12.4 },
      { day: 'Day 4', inflow: 13.1 }, { day: 'Day 5', inflow: 14.5 }, { day: 'Day 6', inflow: 15.2 },
      { day: 'Day 7', inflow: 14.8 }, { day: 'Day 8', inflow: 15.9 }, { day: 'Day 9', inflow: 16.4 },
      { day: 'Day 10', inflow: 17.1 }, { day: 'Day 11', inflow: 18.0 }, { day: 'Day 12', inflow: 17.5 },
      { day: 'Day 13', inflow: 18.1 }, { day: 'Day 14', inflow: 18.4 }
    ]
  },
  {
    id: 'rwa',
    label: 'RWA',
    confidence: 85,
    inflow24h: '+$8.1M',
    intensity: 0.78,
    description: 'Tokenized sovereign debt notes, physical grain structures, and tokenized US treasury bills (USDY, M-TBILL) on-chain.',
    socialOnChainMentionVolume: '11.2K Mentions',
    mentionDelta24h: '+45.8%',
    tokens: [
      { symbol: 'USDY', price: '$1.04', volume24h: '$8.20M', flow24h: '+$2.45M', isPositive: true },
      { symbol: 'M-TBILL', price: '$100.52', volume24h: '$5.40M', flow24h: '+$3.82M', isPositive: true },
      { symbol: 'GOLDToken', price: '$72.10', volume24h: '$1.92M', flow24h: '+$1.12M', isPositive: true },
      { symbol: 'REAL-MNT', price: '$24.50', volume24h: '$410K', flow24h: '+$42K', isPositive: true },
      { symbol: 'PROP-X', price: '$0.88', volume24h: '$180K', flow24h: '-$5K', isPositive: false }
    ],
    wallets: [
      { id: '0xVC9...218d', name: 'VC Smart Treasury', flow: '+$1,850K', winRate: '86%' },
      { id: '0x44F...eA12', name: 'Staking Whale', flow: '+$1,100K', winRate: '75%' }
    ],
    bridgeActivity: [
      { sourceChain: 'Ethereum Mainnet', targetAsset: 'M-TBILL', amount: '$4,100,000', txCount: 42 },
      { sourceChain: 'BSC Mainnet', targetAsset: 'USDY', amount: '$2,100,000', txCount: 31 },
      { sourceChain: 'Ondo Finance Routing', targetAsset: 'USDY', amount: '$1,900,000', txCount: 22 }
    ],
    chartData: [
      { day: 'Day 1', inflow: 1.5 }, { day: 'Day 2', inflow: 1.8 }, { day: 'Day 3', inflow: 2.1 },
      { day: 'Day 4', inflow: 2.8 }, { day: 'Day 5', inflow: 3.5 }, { day: 'Day 6', inflow: 4.2 },
      { day: 'Day 7', inflow: 4.8 }, { day: 'Day 8', inflow: 5.1 }, { day: 'Day 9', inflow: 5.9 },
      { day: 'Day 10', inflow: 6.4 }, { day: 'Day 11', inflow: 6.8 }, { day: 'Day 12', inflow: 7.2 },
      { day: 'Day 13', inflow: 7.8 }, { day: 'Day 14', inflow: 8.1 }
    ]
  },
  {
    id: 'defi',
    label: 'DeFi Hubs',
    confidence: 76,
    inflow24h: '+$6.2M',
    intensity: 0.64,
    description: 'Concentrated liquidity optimization DEX platforms, automated vault strategies, and high-velocity credit systems on Mantle.',
    socialOnChainMentionVolume: '9.6K Mentions',
    mentionDelta24h: '+12.4%',
    tokens: [
      { symbol: 'MOE', price: '$0.15', volume24h: '$2.41M', flow24h: '+$840K', isPositive: true },
      { symbol: 'AGNI', price: '$0.082', volume24h: '$1.90M', flow24h: '+$450K', isPositive: true },
      { symbol: 'INIT', price: '$0.34', volume24h: '$1.10M', flow24h: '+$210K', isPositive: true },
      { symbol: 'MOE-LP', price: '$1.04', volume24h: '$840K', flow24h: '+$140K', isPositive: true },
      { symbol: 'LEND-MNT', price: '$0.55', volume24h: '$450K', flow24h: '-$32K', isPositive: false }
    ],
    wallets: [
      { id: '0xe21...7cA0', name: 'DEX Arb Bot', flow: '+$750K', winRate: '78%' },
      { id: '0x3Af...c1E9', name: 'Alpha Sniper', flow: '+$410K', winRate: '81%' },
      { id: '0x79B...91F2', name: 'USD Stable Farmer', flow: '+$280K', winRate: '94%' }
    ],
    bridgeActivity: [
      { sourceChain: 'Arbitrum One', targetAsset: 'INIT', amount: '$1,100,000', txCount: 45 },
      { sourceChain: 'Optimism', targetAsset: 'MOE', amount: '$540,000', txCount: 24 }
    ],
    chartData: [
      { day: 'Day 1', inflow: 2.4 }, { day: 'Day 2', inflow: 2.8 }, { day: 'Day 3', inflow: 3.1 },
      { day: 'Day 4', inflow: 3.4 }, { day: 'Day 5', inflow: 3.8 }, { day: 'Day 6', inflow: 4.1 },
      { day: 'Day 7', inflow: 4.4 }, { day: 'Day 8', inflow: 4.8 }, { day: 'Day 9', inflow: 4.9 },
      { day: 'Day 10', inflow: 5.2 }, { day: 'Day 11', inflow: 5.5 }, { day: 'Day 12', inflow: 5.8 },
      { day: 'Day 13', inflow: 6.0 }, { day: 'Day 14', inflow: 6.2 }
    ]
  },
  {
    id: 'gaming',
    label: 'Gaming/GameFi',
    confidence: 58,
    inflow24h: '+$3.5M',
    intensity: 0.40,
    description: 'Web3 game engines, modular micro-transaction loops, and dedicated game portals relying on Mantle\'s sub-cent network gas fees.',
    socialOnChainMentionVolume: '4.8K Mentions',
    mentionDelta24h: '-4.2%',
    tokens: [
      { symbol: 'MNT-GAME', price: '$0.34', volume24h: '$1.20M', flow24h: '+$450K', isPositive: true },
      { symbol: 'MoeArcade', price: '$0.12', volume24h: '$840K', flow24h: '+$180K', isPositive: true },
      { symbol: 'GIGAGAME', price: '$0.024', volume24h: '$490K', flow24h: '+$95K', isPositive: true },
      { symbol: 'MOE-GAMER', price: '$0.065', volume24h: '$320K', flow24h: '+$14K', isPositive: true },
      { symbol: 'RECON', price: '$2.10', volume24h: '$140K', flow24h: '-$12K', isPositive: false }
    ],
    wallets: [
      { id: '0xAA9...bce3', name: 'Degen Guild Master', flow: '+$180K', winRate: '42%' },
      { id: '0x3Af...c1E9', name: 'Alpha Sniper', flow: '+$95K', winRate: '81%' }
    ],
    bridgeActivity: [
      { sourceChain: 'Optimism', targetAsset: 'mETH', amount: '$310,000', txCount: 18 },
      { sourceChain: 'Arbitrum One', targetAsset: 'USDC', amount: '$140,000', txCount: 12 }
    ],
    chartData: [
      { day: 'Day 1', inflow: 2.1 }, { day: 'Day 2', inflow: 2.3 }, { day: 'Day 3', inflow: 2.0 },
      { day: 'Day 4', inflow: 1.8 }, { day: 'Day 5', inflow: 2.5 }, { day: 'Day 6', inflow: 2.9 },
      { day: 'Day 7', inflow: 3.1 }, { day: 'Day 8', inflow: 3.0 }, { day: 'Day 9', inflow: 3.4 },
      { day: 'Day 10', inflow: 3.6 }, { day: 'Day 11', inflow: 3.2 }, { day: 'Day 12', inflow: 3.4 },
      { day: 'Day 13', inflow: 3.3 }, { day: 'Day 14', inflow: 3.5 }
    ]
  },
  {
    id: 'l2s',
    label: 'L2 Routing',
    confidence: 60,
    inflow24h: '+$2.1M',
    intensity: 0.28,
    description: 'Cross-chain bridging routers, interoperability layers, and Zero-Knowledge proofs scaling high-performance networks.',
    socialOnChainMentionVolume: '3.1K Mentions',
    mentionDelta24h: '+1.5%',
    tokens: [
      { symbol: 'MNT-L2', price: '$0.52', volume24h: '$840K', flow24h: '+$310K', isPositive: true },
      { symbol: 'BRIDGE-MNT', price: '$1.01', volume24h: '$410K', flow24h: '+$95K', isPositive: true },
      { symbol: 'M-SCALE', price: '$0.12', volume24h: '$150K', flow24h: '+$14K', isPositive: true },
      { symbol: 'SYMB-L2', price: '$0.45', volume24h: '$110K', flow24h: '+$11K', isPositive: true },
      { symbol: 'ROUTE-X', price: '$2.11', volume24h: '$240K', flow24h: '-$34K', isPositive: false }
    ],
    wallets: [
      { id: '0x79B...91F2', name: 'USD Stable Farmer', flow: '+$140K', winRate: '94%' },
      { id: '0xe21...7cA0', name: 'DEX Arb Bot', flow: '+$95K', winRate: '78%' }
    ],
    bridgeActivity: [
      { sourceChain: 'Polygon POS', targetAsset: 'USDT', amount: '$310,000', txCount: 14 },
      { sourceChain: 'Optimism', targetAsset: 'USDC', amount: '$180,000', txCount: 8 }
    ],
    chartData: [
      { day: 'Day 1', inflow: 1.1 }, { day: 'Day 2', inflow: 1.2 }, { day: 'Day 3', inflow: 1.0 },
      { day: 'Day 4', inflow: 1.4 }, { day: 'Day 5', inflow: 1.3 }, { day: 'Day 6', inflow: 1.5 },
      { day: 'Day 7', inflow: 1.6 }, { day: 'Day 8', inflow: 1.5 }, { day: 'Day 9', inflow: 1.8 },
      { day: 'Day 10', inflow: 1.9 }, { day: 'Day 11', inflow: 1.7 }, { day: 'Day 12', inflow: 1.8 },
      { day: 'Day 13', inflow: 2.0 }, { day: 'Day 14', inflow: 2.1 }
    ]
  }
];

// 30-day timeline rotated capital movement history between categories (Stacked Area)
const ROTATION_30D_DATA = [
  { day: 'Day 1', AI: 120, Restaking: 80, Gaming: 45, Stablecoins: 190, RWA: 40, DeFi: 110, L2s: 30 },
  { day: 'Day 4', AI: 130, Restaking: 85, Gaming: 50, Stablecoins: 200, RWA: 42, DeFi: 105, L2s: 32 },
  { day: 'Day 7', AI: 115, Restaking: 90, Gaming: 48, Stablecoins: 210, RWA: 45, DeFi: 100, L2s: 35 },
  { day: 'Day 10', AI: 150, Restaking: 95, Gaming: 46, Stablecoins: 200, RWA: 55, DeFi: 95, L2s: 40 },
  { day: 'Day 13', AI: 175, Restaking: 110, Gaming: 42, Stablecoins: 195, RWA: 62, DeFi: 98, L2s: 38 },
  { day: 'Day 16', AI: 190, Restaking: 125, Gaming: 40, Stablecoins: 180, RWA: 68, DeFi: 92, L2s: 37 },
  { day: 'Day 19', AI: 185, Restaking: 140, Gaming: 38, Stablecoins: 175, RWA: 75, DeFi: 90, L2s: 36 },
  { day: 'Day 22', AI: 220, Restaking: 135, Gaming: 35, Stablecoins: 185, RWA: 80, DeFi: 88, L2s: 35 },
  { day: 'Day 25', AI: 240, Restaking: 160, Gaming: 34, Stablecoins: 190, RWA: 82, DeFi: 85, L2s: 38 },
  { day: 'Day 28', AI: 285, Restaking: 210, Gaming: 25, Stablecoins: 165, RWA: 110, DeFi: 81, L2s: 30 },
  { day: 'Day 30', AI: 390, Restaking: 280, Gaming: 22, Stablecoins: 150, RWA: 138, DeFi: 85, L2s: 31 }, // Active Day
];

const UNUSUAL_BRIDGE_FLOWS: UnusualBridgeFlow[] = [
  { sourceChain: 'Ethereum Mainnet', amount: '+$5.42M', narrativeCategory: 'Stablecoins', asset: 'USDY', txHash: '0x7eB...12FA', timeAgo: '4 mins ago', severity: 'critical' },
  { sourceChain: 'Arbitrum One', amount: '+$3.85M', narrativeCategory: 'AI Coins', asset: 'SPECTRA', txHash: '0x992...FFa1', timeAgo: '17 mins ago', severity: 'high' },
  { sourceChain: 'Ethereum Mainnet', amount: '+$4.20M', narrativeCategory: 'Restaking', asset: 'mETH', txHash: '0xAC1...88ab', timeAgo: '32 mins ago', severity: 'high' },
  { sourceChain: 'BSC Mainnet', amount: '+$1.94M', narrativeCategory: 'AI Coins', asset: 'MNT-AI', txHash: '0xdE1...C321', timeAgo: '1 hr ago', severity: 'normal' },
  { sourceChain: 'Polygon POS', amount: '+$1.12M', narrativeCategory: 'RWA', asset: 'GOLDToken', txHash: '0xf01...BB4e', timeAgo: '3 hrs ago', severity: 'normal' },
];

export default function NarrativeDetector() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedNarrativeId, setSelectedNarrativeId] = useState<string>('ai-coins');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Intelligence AI generation loader
  const [generatingAiSummary, setGeneratingAiSummary] = useState<boolean>(false);
  const [aiSummaryCache, setAiSummaryCache] = useState<Record<string, string>>({});

  // Real-time ticking indicators
  const [tickerFlows, setTickerFlows] = useState<UnusualBridgeFlow[]>(UNUSUAL_BRIDGE_FLOWS);

  // Sync theme
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Dynamic stream builder for real-time unusual bridge flows simulation
    const streamInterval = setInterval(() => {
      const routes = ['Ethereum Mainnet', 'Arbitrum One', 'Optimism', 'BSC Mainnet', 'Base'];
      const narratives = ['AI Coins', 'Restaking', 'Stablecoins', 'RWA', 'DeFi Hubs'];
      const assets = ['USDC', 'mETH', 'stETH', 'USDY', 'SPECTRA', 'MNT-AI'];
      const amounts = ['+$1.22M', '+$2.85M', '+$940K', '+$4.10M', '+$840K'];
      const severities: ('critical' | 'high' | 'normal')[] = ['critical', 'high', 'normal'];

      const newFlow: UnusualBridgeFlow = {
        sourceChain: routes[Math.floor(Math.random() * routes.length)],
        amount: amounts[Math.floor(Math.random() * amounts.length)],
        narrativeCategory: narratives[Math.floor(Math.random() * narratives.length)],
        asset: assets[Math.floor(Math.random() * assets.length)],
        txHash: '0x' + Math.random().toString(16).substr(2, 6).toUpperCase() + '...' + Math.random().toString(16).substr(2, 4).toUpperCase(),
        timeAgo: 'Just now',
        severity: severities[Math.floor(Math.random() * severities.length)]
      };

      setTickerFlows(prev => [newFlow, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(streamInterval);
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

  const activeNarrative = useMemo(() => {
    return NARRATIVES_DATABASE.find(n => n.id === selectedNarrativeId) || NARRATIVES_DATABASE[0];
  }, [selectedNarrativeId]);

  // Request on-demand summary from our server-side API route
  const handleGenerateSummary = async (narrative: Narrative, force: boolean = false) => {
    if (!force && aiSummaryCache[narrative.id]) return;
    
    setGeneratingAiSummary(true);
    try {
      const response = await fetch('/api/narratives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          narrativeName: narrative.label,
          inflow: narrative.inflow24h,
          confidence: narrative.confidence,
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.summary) {
          setAiSummaryCache(prev => ({ ...prev, [narrative.id]: data.summary }));
          return;
        }
      }
      throw new Error('API down or returning empty keys');
    } catch (err) {
      console.warn('Utilizing aesthetic forecast intelligence mock because of server parameters', err);
      // Fallback matching specific narrative details if key missing / failed
      setTimeout(() => {
        let text = '';
        if (narrative.id === 'ai-coins') {
          text = 'AI momentum is gathering major velocity: 12 VC-linked wallet addresses loaded liquidity positions into SPECTRA/mETH pools within the last 6 block intervals. Coordinated accumulation remains intensive.';
        } else if (narrative.id === 'restaking') {
          text = 'Liquid staking rotation is accelerating perfectly: stETH and native mETH capital locking is climbing at concentrated pools. 4 multi-signers relocated resources into validation nodes.';
        } else if (narrative.id === 'stablecoins') {
          text = 'High liquidity baseline metrics: Stablecoin deposits via Ethereum Mainnet bridge are establishing a deep floor, raising Ondo\'s USDY yield-bearing contracts capacity by 14%.';
        } else if (narrative.id === 'rwa') {
          text = 'Tokenized treasuries and bond yields represent steady safe-havens: Smart wallets are substituting volatile components with yield-bearing M-TBILL contracts, yielding persistent real yield on-chain.';
        } else {
          text = `Ecosystem interest in "${narrative.label}" is growing systematically. The 24-hour smart flow index peaked at robust ${narrative.inflow24h} net inflows, locking valuable developer trust.`;
        }
        setAiSummaryCache(prev => ({ ...prev, [narrative.id]: text }));
      }, 350);
    } finally {
      setGeneratingAiSummary(false);
    }
  };

  // Automatically fetch intelligence summary whenever the selected card changes
  useEffect(() => {
    handleGenerateSummary(activeNarrative);
  }, [selectedNarrativeId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className={cn(
      "min-h-screen bg-app-bg text-app-fg p-4 md:p-6 flex flex-col gap-6 transition-all duration-300",
      isDarkMode ? "dark" : "light"
    )}>
      {/* Primary Header Command Base Navigation */}
      <header className="flex flex-col items-center md:flex-row md:items-center justify-between gap-4 border-b border-app-border/60 pb-5 md:pb-0 h-auto md:h-[65px]" id="narratives-primary-header">
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto h-full py-0">
          <Link href="/" className="outline-none">
            <ChameleonLogo className="w-40 h-[42px] sm:w-[190px] sm:h-[48px] relative z-10 transition-transform duration-300 hover:scale-[1.01]" animated={true} />
          </Link>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <nav className="flex items-center gap-2">
            <Link 
              href="/"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Home Command
            </Link>
            <Link 
              href="/health"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Ecosystem Health
            </Link>
            <Link 
              href="/dashboard"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Smart Money Terminal
            </Link>
            <Link 
              href="/tracker"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Smart Wallet Tracker
            </Link>
            <button className="border border-app-emerald text-app-emerald bg-app-emerald/10 font-bold px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-default" disabled>
              Narrative Detector
            </button>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-app-card border border-app-border hover:bg-app-card-hover text-app-fg transition-all active:scale-95 cursor-pointer shadow-sm"
              title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> : <Moon className="w-3.5 h-3.5 text-blue-600" />}
            </button>

            <div className="hidden sm:flex bg-app-card border border-app-emerald/25 px-2.5 py-1 rounded-full items-center space-x-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 bg-app-emerald rounded-full animate-pulse"></div>
              <span className="text-[9px] font-mono text-app-emerald uppercase tracking-wider font-bold">Forensic Link OK</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container of Narrative Detector */}
      <main className="w-full max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Cover Hero visual banner */}
        <section className="bg-app-card border border-app-border rounded-2xl p-6 relative overflow-hidden shadow-sm" id="banner-section">
          <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 bg-app-emerald/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-app-emerald animate-spin-slow" />
                <h1 className="text-xl font-black tracking-tight text-app-fg uppercase font-sans">
                  Page 4 — Narrative Detector
                </h1>
              </div>
              <p className="text-app-fg font-medium text-sm">Where the market&apos;s story is told before retail sees it.</p>
              <p className="text-xs text-app-zinc-text max-w-3xl leading-relaxed">
                By tracking token capital flow indices, on-chain social volume metrics, bridge ingress, and smart money accumulation vectors, we isolate which narratives are capturing genuine traction across the Mantle ecosystem.
              </p>
            </div>

            <div className="bg-app-bg border border-app-border px-4 py-3 rounded-xl flex items-center gap-3 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-app-emerald animate-pulse" />
              <div className="font-mono text-xs text-app-fg/90">
                <span className="text-app-zinc-text block text-[9px] uppercase font-bold tracking-widest leading-none">Dominancy State</span>
                <span className="font-extrabold uppercase text-[11px]">Stablecoins & AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Live Social Signal Scrolling Strip */}
        <section className="bg-app-card border border-app-border p-4 rounded-2xl shadow-sm flex flex-col gap-3 relative" id="social-strip-main">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-app-fg">
                Social Signal Strip — On-chain Mention Volumes & Governance Memos
              </h3>
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px] text-app-zinc-text uppercase font-bold">
              <Clock className="w-3 h-3 text-app-zinc-text" /> 24h Update interval
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
            {NARRATIVES_DATABASE.map((nar) => (
              <button 
                key={nar.id}
                onClick={() => setSelectedNarrativeId(nar.id)}
                className={cn(
                  "flex items-center gap-2 border px-3.5 py-2 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer active:scale-95",
                  selectedNarrativeId === nar.id 
                    ? "bg-app-bg border-app-emerald text-app-emerald font-black scale-[1.01] shadow-sm" 
                    : "bg-app-bg hover:bg-app-card-hover border-app-border"
                )}
              >
                <span className="font-black text-app-fg">{nar.label}</span>
                <span className="h-3 w-[1px] bg-app-border" />
                <span className="text-[11px] text-app-zinc-text font-semibold">{nar.socialOnChainMentionVolume}</span>
                <span className="text-[10px] text-app-emerald font-black flex items-center gap-0.5">
                  <ArrowBigUp className="w-2.5 h-2.5" /> {nar.mentionDelta24h}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 1. Active Narratives heatmap Grid */}
        <section className="flex flex-col gap-3" id="narratives-heatmap-grid-main">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-app-fg uppercase tracking-wider">
                Active Capital Heatmap Grid (Tile Opacity = Heat Intensity)
              </span>
            </div>
            <span className="text-[9px] uppercase font-mono font-bold text-app-zinc-text bg-app-card border border-app-border px-2.5 py-0.5 rounded">
              Interactions Enabled
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {NARRATIVES_DATABASE.map((nar) => {
              const works = selectedNarrativeId === nar.id;
              
              // Map intensity value (0 to 1.0) to custom styles/shading
              return (
                <button
                  key={nar.id}
                  onClick={() => setSelectedNarrativeId(nar.id)}
                  className={cn(
                    "bento-card p-4 text-left transition-all duration-300 relative overflow-hidden group min-h-[140px] flex flex-col justify-between cursor-pointer",
                    works 
                      ? "border-app-emerald bg-app-card ring-1 ring-app-emerald/40 scale-[1.02] shadow-sm" 
                      : "hover:border-app-emerald/30 border-app-border bg-app-card/60"
                  )}
                  style={{
                    boxShadow: works ? '0 0 15px rgba(16, 185, 129, 0.08)' : 'none'
                  }}
                >
                  {/* Heat gradient indicator based on capital intensity */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{
                      background: `radial-gradient(circle at top right, rgba(16, 185, 129, ${nar.intensity * 0.28}) 0%, transparent 75%)`
                    }}
                  />

                  <div className="flex justify-between items-start relative z-10 w-full mb-2">
                    <span className="text-xs font-black tracking-tight text-app-fg uppercase font-sans">
                      {nar.label}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      <span 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          nar.intensity > 0.85 
                            ? "bg-rose-500 animate-ping" 
                            : nar.intensity > 0.60 
                              ? "bg-amber-500" 
                              : "bg-blue-500"
                        )}
                        style={{ animationDuration: '2.5s' }}
                      />
                      <span className="font-mono text-[8px] uppercase font-bold text-app-zinc-text">
                        Momentum
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 my-1 py-1.5 flex flex-col">
                    <span className="text-xl font-black font-mono tracking-tight text-app-fg leading-none">
                      {nar.inflow24h}
                    </span>
                    <span className="text-[8px] font-bold text-app-zinc-text tracking-widest uppercase mt-1 leading-none font-mono">
                      24h Net Inflow
                    </span>
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="bg-app-bg border border-app-border/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-app-zinc-text font-bold">
                      CONF: <span className="text-app-fg font-black">{nar.confidence}%</span>
                    </div>
                    <span className="text-[9px] font-sans text-app-emerald group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                      View <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* MIDDLE GRID LAYOUT */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* 2. Detailed Narrative Analysis Expander Card (Colspan-7) */}
          <section className="lg:col-span-7 bento-card p-6 bg-app-card flex flex-col gap-5 relative border border-app-border" id="narratives-details">
            <div className="absolute top-6 right-6 font-mono text-[9px] font-bold text-app-zinc-text bg-app-bg border border-app-border px-2 py-0.5 rounded uppercase font-black">
              Detail Tracker
            </div>

            <div className="flex flex-col gap-2 pb-4 border-b border-app-border/60">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-app-emerald" />
                <h2 className="text-base font-black uppercase text-app-fg font-sans tracking-tight">
                  {activeNarrative.label} Forensic Analysis
                </h2>
              </div>
              <p className="text-xs text-app-zinc-text leading-relaxed">
                {activeNarrative.description}
              </p>
            </div>

            {/* AIgenerated intelligence box (with refresh endpoint invocation option) */}
            <div className="bg-app-bg border border-app-border rounded-xl p-4 flex flex-col gap-3 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-app-emerald animate-pulse" />
                  <span className="text-[9px] uppercase font-black tracking-widest text-app-zinc-text font-mono">
                    CHAMELEON AI INTENT PARSER (GEMINI API)
                  </span>
                </div>
                
                <button 
                  onClick={() => handleGenerateSummary(activeNarrative, true)}
                  disabled={generatingAiSummary}
                  className="text-[10px] text-app-emerald hover:underline flex items-center gap-1.5 font-bold uppercase font-mono cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-3 h-3", generatingAiSummary && "animate-spin")} />
                  Refresh
                </button>
              </div>

              {generatingAiSummary ? (
                <div className="py-2.5 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-app-emerald border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-mono text-app-zinc-text uppercase tracking-wider font-semibold">
                    Re-compiling on-chain vectors via Gemini 3.5...
                  </span>
                </div>
              ) : (
                <p className="text-xs sm:text-sm font-semibold italic text-app-fg leading-relaxed">
                  &ldquo;{aiSummaryCache[activeNarrative.id] || "Interrogating consensus rules and on-chain deposits..."}&rdquo;
                </p>
              )}
            </div>

            {/* Tokens list and Wallets list in responsive split */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Top 5 Tokens inside selected narrative (Colspan-7) */}
              <div className="md:col-span-7 flex flex-col gap-3 p-4 bg-app-bg/50 border border-app-border/80 rounded-xl">
                <div className="flex justify-between items-center pb-2 border-b border-app-border/40">
                  <span className="text-[10px] font-black uppercase text-app-fg block">
                    Top Tokens in {activeNarrative.label}
                  </span>
                  <span className="text-[8px] font-mono uppercase text-app-zinc-text font-bold">24h Flows</span>
                </div>

                <div className="space-y-2 font-mono">
                  {activeNarrative.tokens.map((tok, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between text-[11px] p-2 rounded-lg border border-app-border bg-app-card hover:bg-app-card-hover transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[10px] text-app-zinc-text w-3">{idx + 1}</span>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-app-fg group-hover:text-app-emerald transition-colors">{tok.symbol}</span>
                          <span className="text-[9px] text-app-zinc-text">{tok.price}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col text-[10px]">
                          <span className="text-app-fg font-semibold">{tok.volume24h}</span>
                          <span className="text-[8px] text-app-zinc-text leading-none mt-0.5">Vol 24h</span>
                        </div>

                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-black font-mono",
                          tok.isPositive 
                            ? "bg-app-emerald/15 text-app-emerald" 
                            : "bg-rose-500/10 text-rose-500"
                        )}>
                          {tok.flow24h}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Wallets Accumulating selected narrative (Colspan-5) */}
              <div className="md:col-span-5 flex flex-col gap-3 p-4 bg-app-bg/50 border border-app-border/80 rounded-xl">
                <div className="flex justify-between items-center pb-2 border-b border-app-border/40">
                  <span className="text-[10px] font-black uppercase text-app-fg block">
                    Leading Wallets
                  </span>
                  <span className="text-[8px] font-mono uppercase text-app-zinc-text font-bold">Flow Accum</span>
                </div>

                <div className="space-y-2 font-mono">
                  {activeNarrative.wallets.map((wal, index) => (
                    <div 
                      key={index}
                      className="p-2 border border-app-border rounded-lg bg-app-card flex flex-col text-[10px] gap-1 hover:border-app-emerald/30 group transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-app-fg group-hover:text-app-emerald transition-colors">
                          {wal.id}
                        </span>
                        <span className="text-[9px] text-app-zinc-text font-medium">{wal.name}</span>
                      </div>

                      <div className="flex justify-between items-center text-[9px] border-t border-app-border/30 pt-1 mt-0.5">
                        <span className="text-app-zinc-text uppercase font-bold">Smart Flow</span>
                        <span className="text-app-emerald font-black">{wal.flow}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link 
                    href="/dashboard" 
                    className="w-full text-center py-1.5 border border-dashed border-app-border hover:border-app-emerald hover:text-app-emerald block text-[9px] text-app-zinc-text transition-all rounded-lg uppercase font-bold"
                  >
                    Load Smart Wallet terminal
                  </Link>
                </div>
              </div>

            </div>

            {/* Custom 14-day Inflow Area Chart & Bridge Activity */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch mt-1">
              
              {/* 14 days chart (Colspan-7) */}
              <div className="md:col-span-7 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-app-fg tracking-tight font-sans">
                    {activeNarrative.label} 14h Capital Flow Index
                  </h4>
                  <span className="text-[9px] font-mono text-app-zinc-text uppercase block">
                    Relative momentum trend indicators
                  </span>
                </div>

                <div className="w-full h-[140px] pr-2 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeNarrative.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id={`${activeNarrative.id}-grad`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isDarkMode ? "#10b981" : "#00875a"} stopOpacity={0.15}/>
                          <stop offset="95%" stopColor={isDarkMode ? "#10b981" : "#00875a"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: isDarkMode ? '#8b949e' : '#6b7280', fontSize: 9, fontWeight: 500 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fill: isDarkMode ? '#8b949e' : '#6b7280', fontSize: 9, fontWeight: 500 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDarkMode ? '#161b22' : '#ffffff', 
                          borderRadius: '12px', 
                          border: '1px solid var(--app-border)',
                          fontSize: '11px',
                          color: 'var(--app-fg)'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="inflow" 
                        stroke={isDarkMode ? "#10b981" : "#00875a"} 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill={`url(#${activeNarrative.id}-grad)`} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Related bridge paths (Colspan-5) */}
              <div className="md:col-span-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-app-fg tracking-tight font-sans">
                    Active Bridge Routing Activity
                  </h4>
                  <span className="text-[9px] font-mono text-app-zinc-text uppercase block">
                    Connected cross-chain liquidity nodes
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[10px] mt-2 flex-grow">
                  {activeNarrative.bridgeActivity.map((bridge, index) => (
                    <div 
                      key={index} 
                      className="p-2 border border-app-border rounded-lg bg-app-bg flex justify-between items-center text-app-fg"
                    >
                      <div className="flex flex-col">
                        <span className="font-extrabold uppercase text-[8px] text-app-zinc-text leading-none">{bridge.sourceChain}</span>
                        <span className="font-bold mt-1 text-[11px]">📥 {bridge.targetAsset} Pool</span>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-black text-app-emerald">{bridge.amount}</span>
                        <span className="block text-[8px] text-app-zinc-text font-bold mt-0.5">{bridge.txCount} depositors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* RIGHT SIDEBAR PANEL */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 3. Narrative Timeline chart: Stacked area over 30 days */}
            <div className="bento-card p-6 bg-app-card border border-app-border flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-app-emerald" />
                  <h3 className="text-xs font-bold text-app-fg uppercase tracking-wider">
                    Capital Rotation Timeline Map (30 Days Stacked)
                  </h3>
                </div>
                <p className="text-[10px] text-app-zinc-text leading-relaxed uppercase font-mono">
                  Visual stacked area indicating rotation velocities between prime categories.
                </p>
              </div>

              <div className="w-full h-[180px] min-h-[160px] pr-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ROTATION_30D_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: isDarkMode ? '#8b949e' : '#6b7280', fontSize: 8, fontWeight: 500 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: isDarkMode ? '#8b949e' : '#6b7280', fontSize: 8, fontWeight: 500 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#161b22' : '#ffffff', 
                        borderRadius: '12px', 
                        border: '1px solid var(--app-border)',
                        fontSize: '11px',
                        color: 'var(--app-fg)'
                      }} 
                    />
                    {/* Unique color bands for each narrative category */}
                    <Area type="monotone" dataKey="AI" stackId="capital" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="Restaking" stackId="capital" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="Stablecoins" stackId="capital" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="RWA" stackId="capital" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="DeFi" stackId="capital" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 border-t border-app-border/40 pt-3 text-[9px] font-mono uppercase font-bold justify-center">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500 block" /> AI Coins</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500 block" /> Restaking</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500 block" /> Stablecoins</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500 block" /> RWA</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500 block" /> DeFi</span>
              </div>
            </div>

            {/* 4. Bridge Flow Panel: unusual crosschain ingress into Mantle */}
            <div className="bento-card p-6 bg-app-card border border-app-border flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Network className="w-4 h-4 text-app-emerald animate-pulse" />
                  <h3 className="text-xs font-bold text-app-fg uppercase tracking-wider">
                    Unusual Bridge Flow Detector (Mantle Ingress)
                  </h3>
                </div>
                <p className="text-[10px] text-app-zinc-text leading-relaxed uppercase font-mono">
                  Real-time alerts tracking anomalous asset locks matching trending classifications.
                </p>
              </div>

              <div className="space-y-3 font-mono">
                <AnimatePresence initial={false}>
                  {tickerFlows.map((flow, index) => (
                    <motion.div
                      key={flow.txHash + index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={cn(
                        "p-3 rounded-lg border text-xs flex flex-col gap-2 transition-all",
                        flow.severity === 'critical' 
                          ? "bg-rose-500/10 border-rose-500/20" 
                          : flow.severity === 'high' 
                            ? "bg-amber-500/10 border-amber-500/20" 
                            : "bg-app-bg border-app-border/80"
                      )}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold uppercase text-app-zinc-text leading-none">
                          From: <span className="text-app-fg">{flow.sourceChain}</span>
                        </span>
                        
                        <span className={cn(
                          "px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase text-white tracking-widest",
                          flow.severity === 'critical' 
                            ? "bg-rose-600" 
                            : flow.severity === 'high' 
                              ? "bg-amber-600" 
                              : "bg-indigo-600"
                        )}>
                          {flow.severity}
                        </span>
                      </div>

                      <div className="flex justify-between items-center my-0.5">
                        <div>
                          <span className="text-[13px] font-black text-app-fg">{flow.amount}</span>
                          <span className="text-app-zinc-text text-[9px] block">Inbound asset: {flow.asset}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-app-emerald font-black block text-[10px] uppercase">
                            🗂️ {flow.narrativeCategory}
                          </span>
                          <span className="text-[9px] text-app-zinc-text font-medium">{flow.timeAgo}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-app-border/20 pt-2 text-[9px] text-app-zinc-text">
                        <span>TX: {flow.txHash}</span>
                        <button 
                          onClick={() => handleCopy(flow.txHash)} 
                          className="hover:text-app-emerald transition-colors font-bold uppercase cursor-pointer"
                        >
                          {copiedText === flow.txHash ? "Copied!" : "Copy hash"}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </section>

        </section>

      </main>

      {/* Footer copyright */}
      <footer className="mt-8 border-t border-app-border/40 py-6 text-center text-xs text-app-zinc-text font-mono uppercase" id="footer-main">
        <span>© 2026 Chameleon Terminal Protocol. Real yield flow forecasting dashboard node.</span>
      </footer>
    </div>
  );
}
