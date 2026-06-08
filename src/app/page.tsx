"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Zap, 
  Flame, 
  Shield, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Sun, 
  Moon, 
  Sparkles, 
  Cpu, 
  Target, 
  ExternalLink, 
  Copy, 
  Check, 
  TrendingUp, 
  Compass, 
  Network, 
  RefreshCcw,
  Bell,
  AlertTriangle,
  Layers,
  ArrowRight,
  LayoutGrid,
  Info
} from 'lucide-react';
import { Header } from '@/src/components/Header';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/src/lib/utils';
import Link from 'next/link';
import * as d3 from 'd3';

// Define typed interfaces for the D3 nodes and links
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'wallet' | 'protocol' | 'bridge';
  value: number; // radius weight multiplier
  winRate?: string;
  pnl?: string;
  tvl?: string;
  volume24h?: string;
  activeTxCount?: number;
  mainAsset?: string;
  pnlUSD?: string;
  fullAddress?: string;
  allocations?: { asset: string; pct: number }[];
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number; // thickness multiplier
  asset: string;
  amount: string;
}

// 14-day composite health score data
const HEALTH_HISTORY_DATA = [
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
  { day: 'Day 14', score: 88 }, // Today
];

// Seed databases for Smart money and feeds to look highly realistic and integrated
const TOP_WALLETS = [
  { id: '0x19a', dna: 'Arb Bot', win: '94%', pnl: '+72%', pnlUSD: '+$31,250', sparkPoints: [30, 45, 35, 60, 50, 75, 85, 80, 94] },
  { id: '0xabc', dna: 'Trend Sniper', win: '81%', pnl: '+240%', pnlUSD: '+$240,430', sparkPoints: [10, 20, 15, 45, 35, 55, 75, 65, 81] },
  { id: '0xdef', dna: 'LP Farmer', win: '76%', pnl: '+140%', pnlUSD: '+$140,510', sparkPoints: [20, 30, 28, 48, 42, 60, 68, 70, 76] },
  { id: '0x44f', dna: 'Whale Accumulator', win: '68%', pnl: '+98%', pnlUSD: '+$720,110', sparkPoints: [40, 38, 45, 50, 48, 55, 62, 60, 68] },
  { id: '0xaa2', dna: 'Ape Fund', win: '42%', pnl: '+65%', pnlUSD: '+$84,100', sparkPoints: [80, 50, 65, 35, 40, 25, 50, 38, 42] }
];

const INITIAL_SIGNALS = [
  { type: 'SNIPER_BUY', typeName: 'Sniper Core Buy', token: 'MNT', wallet: '0xabc', conf: 96, time: '2m ago', addressSnippet: '0xabc...942' },
  { type: 'WHALE_ALERT', typeName: 'Whale Accumulate', token: 'ETH', wallet: '0x44f', conf: 91, time: '7m ago', addressSnippet: '0x44f...ccc' },
  { type: 'SWAP_OUTFLOW', typeName: 'Smart Swapper', token: 'USDC', wallet: '0xdef', conf: 84, time: '14m ago', addressSnippet: '0xdef...11a' },
  { type: 'ARB_SANDWICH', typeName: 'Arb Frontrun', token: 'AGNI', wallet: '0x19a', conf: 94, time: '21m ago', addressSnippet: '0x19a...7b1' },
  { type: 'AEP_LAUNCH', typeName: 'Ape Launch Limit', token: 'MEME', wallet: '0xaa2', conf: 78, time: '34m ago', addressSnippet: '0xaa2...009' }
];

const ANOMALY_TICKERS = [
  { id: 'a1', time: '14:04:12', msg: 'Z-score volume spike inside Agni Finance pair: +4.62 SD', type: 'SPIKE' },
  { id: 'a2', time: '14:03:55', msg: 'Coordinated buyout: 5 snipers acquired MEME in under 3.5s', type: 'COORDINATED' },
  { id: 'a3', time: '14:02:40', msg: 'Heavy bridge influx detected: $1.2M USDT inbound from Mainnet', type: 'BRIDGE' },
  { id: 'a4', time: '14:02:11', msg: '0x19a (Arb Bot) triggered flash loan sandwich block for $2k', type: 'MEV' },
  { id: 'a5', time: '14:01:03', msg: 'Unusual dex pool slippage (>4%) on Merchant Moe liquidity', type: 'SLIPPAGE' },
  { id: 'a6', time: '13:59:45', msg: 'Sustained buy wall: $450k MNT limit fills at order book level', type: 'SUPPORT' },
  { id: 'a7', time: '13:58:22', msg: 'Rapid token pairing: new liqudity seed deployed in block #241', type: 'SEED' }
];

export default function HomeDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [tickerLogs, setTickerLogs] = useState(ANOMALY_TICKERS);
  const [marketHealth, setMarketHealth] = useState(88);
  const [healthDelta, setHealthDelta] = useState(3.2);
  const [signalsFeed, setSignalsFeed] = useState(INITIAL_SIGNALS);
  const [activeTab, setActiveTab] = useState<'grid' | 'flow'>('grid');

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Synchronize system theme
  useEffect(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Suppress specific ResizeObserver warnings
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

  const nodesData: GraphNode[] = useMemo(() => [
    { 
      id: 'agni', 
      label: 'Agni DEX', 
      type: 'protocol', 
      value: 12, 
      tvl: '$112.5M', 
      volume24h: '$14.2M', 
      mainAsset: 'MNT/ETH',
      allocations: [
        { asset: 'MNT', pct: 45 },
        { asset: 'USDC', pct: 30 },
        { asset: 'ETH', pct: 25 }
      ]
    },
    { 
      id: 'moe', 
      label: 'Merchant Moe', 
      type: 'protocol', 
      value: 10, 
      tvl: '$84.1M', 
      volume24h: '$9.4M', 
      mainAsset: 'MNT/MOE',
      allocations: [
        { asset: 'MNT', pct: 55 },
        { asset: 'MOE', pct: 35 },
        { asset: 'USDC', pct: 10 }
      ]
    },
    { 
      id: 'symbiosis', 
      label: 'Symbiosis Bridge', 
      type: 'bridge', 
      value: 11, 
      tvl: 'N/A', 
      volume24h: '$25.4M Inflow', 
      mainAsset: 'USDT/USDC',
      allocations: [
        { asset: 'USDC', pct: 60 },
        { asset: 'USDT', pct: 40 }
      ]
    },
    { 
      id: 'mantle_treasury', 
      label: 'Mantle Treasury', 
      type: 'protocol', 
      value: 13, 
      tvl: '$310.8M', 
      volume24h: 'N/A', 
      mainAsset: 'MNT',
      allocations: [
        { asset: 'MNT', pct: 85 },
        { asset: 'ETH', pct: 10 },
        { asset: 'USDT', pct: 5 }
      ]
    },
    { 
      id: 'init_capital', 
      label: 'Init Lending', 
      type: 'protocol', 
      value: 9, 
      tvl: '$64.2M', 
      volume24h: '$5.1M', 
      mainAsset: 'mETH',
      allocations: [
        { asset: 'ETH', pct: 50 },
        { asset: 'MNT', pct: 40 },
        { asset: 'USDC', pct: 10 }
      ]
    },
    { 
      id: '0xabc', 
      label: '0xabc', 
      type: 'wallet', 
      value: 7, 
      winRate: '81%', 
      pnl: '+240%', 
      pnlUSD: '+$240,430', 
      activeTxCount: 142, 
      mainAsset: 'MNT', 
      fullAddress: '0xabc14298cf085b42d76a5b78f4ea492eb9c24942',
      allocations: [
        { asset: 'MNT', pct: 65 },
        { asset: 'ETH', pct: 20 },
        { asset: 'USDC', pct: 10 },
        { asset: 'AGNI', pct: 5 }
      ]
    },
    { 
      id: '0xdef', 
      label: '0xdef', 
      type: 'wallet', 
      value: 7, 
      winRate: '76%', 
      pnl: '+140%', 
      pnlUSD: '+$140,510', 
      activeTxCount: 289, 
      mainAsset: 'ETH', 
      fullAddress: '0xdef8432ce9dca838bdf8811eef24177dd31c111a',
      allocations: [
        { asset: 'ETH', pct: 45 },
        { asset: 'MNT', pct: 35 },
        { asset: 'USDC', pct: 15 },
        { asset: 'WBTC', pct: 5 }
      ]
    },
    { 
      id: '0x44f', 
      label: '0x44f', 
      type: 'wallet', 
      value: 8, 
      winRate: '68%', 
      pnl: '+98%', 
      pnlUSD: '+$720,110', 
      activeTxCount: 98, 
      mainAsset: 'ETH', 
      fullAddress: '0x44f9cf2e21bbda7c2901977cf923984ca903bccc',
      allocations: [
        { asset: 'ETH', pct: 70 },
        { asset: 'USDC', pct: 25 },
        { asset: 'MNT', pct: 5 }
      ]
    },
    { 
      id: '0x19a', 
      label: '0x19a', 
      type: 'wallet', 
      value: 6, 
      winRate: '94%', 
      pnl: '+72%', 
      pnlUSD: '+$31,250', 
      activeTxCount: 450, 
      mainAsset: 'USDC', 
      fullAddress: '0x19adfa43bb1cc20e9871fcceaa77b94109ca37b1',
      allocations: [
        { asset: 'USDC', pct: 85 },
        { asset: 'ETH', pct: 10 },
        { asset: 'MNT', pct: 5 }
      ]
    },
    { 
      id: '0xaa2', 
      label: '0xaa2', 
      type: 'wallet', 
      value: 6, 
      winRate: '42%', 
      pnl: '+65%', 
      pnlUSD: '+$84,100', 
      activeTxCount: 61, 
      mainAsset: 'MEME', 
      fullAddress: '0xaa201bbbcca11e7a00ecfa2a912bcf4c0587a009',
      allocations: [
        { asset: 'MNT', pct: 80 },
        { asset: 'MEME', pct: 20 }
      ]
    }
  ], []);

  const linksData: GraphLink[] = useMemo(() => [
    { source: 'symbiosis', target: 'mantle_treasury', value: 5, asset: 'USDT', amount: '$4.2M' },
    { source: 'mantle_treasury', target: 'agni', value: 4, asset: 'MNT', amount: '$2.5M' },
    { source: '0x44f', target: 'agni', value: 3.5, asset: 'ETH', amount: '$1.4M' },
    { source: 'agni', target: '0xabc', value: 2.5, asset: 'MNT', amount: '$450k' },
    { source: 'agni', target: '0xdef', value: 2, asset: 'MNT/USDC', amount: '$310k' },
    { source: '0x19a', target: 'agni', value: 1.5, asset: 'USDC', amount: '$120k' },
    { source: 'agni', target: 'moe', value: 3, asset: 'MNT', amount: '$1.8M' },
    { source: '0xaa2', target: 'moe', value: 2, asset: 'MEME', amount: '$95k' },
    { source: 'moe', target: '0xabc', value: 1.8, asset: 'MNT', amount: '$180k' },
    { source: '0xdef', target: 'init_capital', value: 2.5, asset: 'ETH', amount: '$540k' },
    { source: 'init_capital', target: '0xabc', value: 1.5, asset: 'USDC', amount: '$85k' }
  ], []);

  // Interval simulating real-time activity
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerLogs((prev) => {
        const nextId = `ticker_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        const types = ['SPIKE', 'COORDINATED', 'BRIDGE', 'MEV'];
        const msgs = [
          `Z-score standard deviation spike: +${(3 + Math.random() * 3).toFixed(2)} SD inside mETH pool`,
          `Coordinated block buy: ${4 + Math.round(Math.random() * 4)} wallets swapped stables to AGNI within 5s`,
          `High bridge block detect: ${(Math.random() * 3).toFixed(1)}M USDT inbound via Symbiosis`,
          `Frontrun execution detected: sandwich contract acquired MNT ahead of trade block`,
          `Gas premium surge: gas fee spikes to ${(Math.random() * 0.4 + 0.1).toFixed(2)} GWEI on concentrated LP sweep`,
          `Strategic rebalance: wallet 0xdef reassigned ${(30 + Math.random() * 40).toFixed(0)}k LP limits on AGNI-V3`
        ];
        
        const index = Math.floor(Math.random() * msgs.length);
        const typeSelect = types[Math.floor(Math.random() * types.length)];
        const curTime = new Date().toLocaleTimeString([], { hour12: false });
        
        const newItem = { id: nextId, time: curTime, msg: msgs[index], type: typeSelect };
        return [newItem, ...prev.slice(0, 10)];
      });

      setMarketHealth(prev => {
        const step = Math.random() > 0.5 ? 1 : -1;
        const nextVal = prev + step;
        return nextVal > 95 ? 95 : nextVal < 70 ? 70 : nextVal;
      });

      if (Math.random() > 0.4) {
        setSignalsFeed(prev => {
          const tokens = ['MNT', 'AGNI', 'mETH', 'USDC', 'WBTC', 'MEME'];
          const randToken = tokens[Math.floor(Math.random() * tokens.length)];
          const randWallet = TOP_WALLETS[Math.floor(Math.random() * TOP_WALLETS.length)];
          
          const types = ['SNIPER_BUY', 'WHALE_ALERT', 'SWAP_OUTFLOW', 'ARB_SANDWICH', 'AEP_LAUNCH'];
          const names = ['Sniper Cluster', 'Whale Inflow', 'Smart Liquidate', 'Instant Arbitrage', 'Apex Momentum'];
          const rngIndex = Math.floor(Math.random() * types.length);
          
          const newSig = {
            type: types[rngIndex],
            typeName: names[rngIndex],
            token: randToken,
            wallet: randWallet.id,
            conf: 70 + Math.floor(Math.random() * 28),
            time: 'Just now',
            addressSnippet: `${randWallet.id}...${Math.random() > 0.5 ? '802' : '942'}`
          };
          return [newSig, ...prev.slice(0, 4)];
        });
      }

    }, 3900);

    return () => clearInterval(tickerInterval);
  }, []);

  // Set up the interactive D3 Simulation
  useEffect(() => {
    if (activeTab !== 'flow' || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || 800;
    let height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const nodes: GraphNode[] = JSON.parse(JSON.stringify(nodesData));
    const links: GraphLink[] = JSON.parse(JSON.stringify(linksData));

    const simulation = d3.forceSimulation<GraphNode, GraphLink>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id((d: any) => d.id)
        .distance(115)
      )
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.value * 2.8 + 12));

    simulationRef.current = simulation;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth } = entries[0].contentRect;
      
      requestAnimationFrame(() => {
        width = newWidth;
        svg.attr('width', width).attr('height', height);
        simulation.force('center', d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();
      });
    });
    
    resizeObserver.observe(container);

    const gLinks = svg.append('g').attr('class', 'links-group');
    const gNodes = svg.append('g').attr('class', 'nodes-group');

    const linkLines = gLinks.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', isDarkMode ? '#1e2521' : '#e2e7e4')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', (d) => d.value * 1.5)
      .attr('class', 'flow-cable')
      .attr('stroke-dasharray', '5 5')
      .style('cursor', 'pointer')
      .attr('stroke', (d) => d.asset === 'MNT' ? '#10b981' : d.asset === 'USDC' ? '#3b82f6' : '#8b5cf6');

    const nodeContainers = gNodes.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setActiveNode(d);
      })
      .call(
        d3.drag<any, any>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    nodeContainers.append('circle')
      .attr('r', (d) => d.value * 2.2 + 8)
      .attr('fill', (d) => {
        if (d.type === 'protocol') return 'rgba(16, 185, 129, 0.08)';
        if (d.type === 'bridge') return 'rgba(139, 92, 246, 0.08)';
        return 'rgba(59, 130, 246, 0.08)';
      })
      .attr('stroke', (d) => {
        if (d.type === 'protocol') return '#10b981';
        if (d.type === 'bridge') return '#8b5cf6';
        return '#3b82f6';
      })
      .attr('stroke-width', 1.8);

    nodeContainers.append('circle')
      .attr('r', 4)
      .attr('fill', (d) => d.type === 'protocol' ? '#10b981' : d.type === 'bridge' ? '#8b5cf6' : '#3b82f6');

    nodeContainers.append('text')
      .attr('dy', (d) => d.value * 2.2 + 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('class', 'font-sans text-app-fg select-none fill-current')
      .attr('fill', isDarkMode ? '#FFFFFF' : '#0D0D0D')
      .text((d) => d.label);

    simulation.on('tick', () => {
      linkLines
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeContainers
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.2).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      resizeObserver.disconnect();
      simulation.stop();
    };
  }, [nodesData, linksData, isDarkMode, activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Redesign Chart Data Mappings based on health_history
  const healthChartData = useMemo(() => {
    return HEALTH_HISTORY_DATA.map((item, idx) => ({
      day: item.day,
      Health: item.score,
      Benchmark: Math.round(70 + (idx * 1.4) + Math.sin(idx) * 2)
    }));
  }, []);

  const signalChartData = useMemo(() => {
    return [
      { label: "00:00", signals: 14, baseline: 10 },
      { label: "02:00", signals: 18, baseline: 11 },
      { label: "04:00", signals: 15, baseline: 12 },
      { label: "06:00", signals: 22, baseline: 14 },
      { label: "08:00", signals: 19, baseline: 11 },
      { label: "10:00", signals: 26, baseline: 15 },
      { label: "12:00", signals: 24, baseline: 13 },
      { label: "14:00", signals: 32, baseline: 16 },
    ];
  }, []);

  const ecosystemSegments = useMemo(() => {
    return [
      { name: "Liquidity TVL", value: 48, color: "#10B981" },
      { name: "Smart Money Velocity", value: 32, color: "#8B5CF6" },
      { name: "Bridge Inbound Flux", value: 13, color: "#EF4444" },
      { name: "Protocol Contract Activity", value: 7, color: "#F59E0B" }
    ];
  }, []);

  return (
    <div className={cn(
      "min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-all duration-150 flex flex-col font-sans",
      isDarkMode ? "dark" : ""
    )}>
      {/* Scroll animation keyframes in interactive flow map */}
      <style>{`
        @keyframes d3-flow {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .flow-cable {
          animation: d3-flow 1.2s linear infinite;
        }
      `}</style>

      {/* Shared Nav Header */}
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} dateRangeText="01 Apr, 2026 - 12 Apr, 2026" />

      {/* Main Container */}
      <main className="flex-grow p-4 md:p-7 max-w-7xl mx-auto w-full flex flex-col gap-5">
        
        {/* Page title & subtitle & Tab switcher row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-5 mb-2">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)]">
              Dashboard
            </h1>
            <p className="text-xs text-[var(--app-muted)] mt-1 font-medium max-w-md uppercase tracking-wider">
              On-chain anomaly radar & high resolution smart capital flow terminal for Mantle.
            </p>
          </div>

          {/* Premium Selector Switch */}
          <div className="flex bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1 shadow-sm self-start md:self-center h-11">
            <button
              onClick={() => setActiveTab('grid')}
              className={cn(
                "flex items-center gap-2 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all h-full cursor-pointer",
                activeTab === 'grid' 
                  ? "bg-emerald-500/15 text-[#10B981]" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Command Grid</span>
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={cn(
                "flex items-center gap-2 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all h-full cursor-pointer",
                activeTab === 'flow' 
                  ? "bg-emerald-500/15 text-[#10B981]" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Capital Flow Map</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Switcher Render */}
        <AnimatePresence mode="wait">
          {activeTab === 'grid' ? (
            <motion.div
              key="command-grid-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* ROW 1: 3 equal cards (Mantle Health Score, Alpha Signal Stream, Ecosystem Summary) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* CARD 1: Mantle Health Score (Maps to Revenue Line Chart) */}
                <div className="bento-card flex flex-col justify-between min-h-[340px] relative hover:-translate-y-0.5" id="card-mantle-health-score">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">
                        MANTLE HEALTH SCORE
                      </h2>
                      <p className="text-xs uppercase tracking-wider text-[var(--app-muted)] mt-1 font-semibold">
                        Live network data
                      </p>
                    </div>
                    <Link href="/health">
                      <button className="bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150 cursor-pointer">
                        View Report
                      </button>
                    </Link>
                  </div>

                  {/* Line Chart */}
                  <div className="flex-grow w-full h-[180px] min-h-[160px] my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={healthChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="grid-health-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="grid-benchmark-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 10, fontWeight: 500 }}
                          tickFormatter={(val) => val.split(' ')[1]}
                        />
                        <YAxis 
                          domain={[60, 95]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 10, fontWeight: 500 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--bg-card)', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border)',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Health" 
                          stroke="#10B981" 
                          strokeWidth={2.5}
                          fill="url(#grid-health-gradient)"
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Benchmark" 
                          stroke="#8B5CF6" 
                          strokeWidth={1.5}
                          strokeDasharray="3 3"
                          fill="url(#grid-benchmark-gradient)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend Row */}
                  <div className="flex items-center gap-4 text-xs font-semibold mt-3 text-[var(--text-secondary)] border-t border-[var(--border)] pt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                      <span>Health</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] border border-dashed border-[#8B5CF6]" />
                      <span>Benchmark</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Alpha Signal Stream (Maps to Daily Expenses Bar Chart) */}
                <div className="bento-card flex flex-col justify-between min-h-[340px] relative hover:-translate-y-0.5" id="card-alpha-signal-stream">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">
                        ALPHA SIGNAL STREAM
                      </h2>
                      <p className="text-xs uppercase tracking-wider text-[var(--app-muted)] mt-1 font-semibold">
                        Live signal data
                      </p>
                    </div>
                    <Link href="/dashboard">
                      <button className="bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150 cursor-pointer">
                        View Report
                      </button>
                    </Link>
                  </div>

                  {/* Bar Chart */}
                  <div className="flex-grow w-full h-[180px] min-h-[160px] my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={signalChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 10, fontWeight: 500 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 10, fontWeight: 500 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--bg-card)', 
                            borderRadius: '8px', 
                            border: '1px solid var(--border)',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }} 
                        />
                        <Bar 
                          dataKey="signals" 
                          fill="#8B5CF6" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={18}
                        />
                        <Bar 
                          dataKey="baseline" 
                          fill={isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"} 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={18}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend Row */}
                  <div className="flex items-center gap-4 text-xs font-semibold mt-3 text-[var(--text-secondary)] border-t border-[var(--border)] pt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-[#8B5CF6]" />
                      <span>Signals</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded bg-neutral-300 dark:bg-neutral-700" />
                      <span>Compare to last period</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Ecosystem Summary (Maps to Summary Donut segment) */}
                <div className="bento-card flex flex-col justify-between min-h-[340px] relative hover:-translate-y-0.5" id="card-ecosystem-summary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">
                        ECOSYSTEM SUMMARY
                      </h2>
                      <p className="text-xs uppercase tracking-wider text-[var(--app-muted)] mt-1 font-semibold">
                        Metrics balance map
                      </p>
                    </div>
                    <Link href="/stats">
                      <button className="bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150 cursor-pointer">
                        View Report
                      </button>
                    </Link>
                  </div>

                  {/* Pie / Donut Chart Frame */}
                  <div className="flex items-center justify-between gap-3 h-[180px] my-2">
                    {/* Donut visuals with absolute layout text inside */}
                    <div className="w-[140px] h-[140px] relative flex items-center justify-center shrink-0">
                      <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
                        <span className="text-2xl font-black text-[var(--text-primary)] font-mono tabular-nums">
                          {marketHealth}%
                        </span>
                        <span className="text-[10px] text-[#10B981] font-bold font-mono">
                          ▲ {healthDelta}%
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ecosystemSegments}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={62}
                            paddingAngle={2}
                            dataKey="value"
                            strokeWidth={1}
                            stroke={isDarkMode ? "rgba(30, 30, 30, 0.4)" : "#ffffff"}
                          >
                            {ecosystemSegments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Highly polished condensed legend key right side */}
                    <div className="flex flex-col gap-2 flex-grow overflow-hidden font-sans">
                      {ecosystemSegments.map((segment, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-semibold leading-tight">
                          <div className="flex items-center gap-1.5 truncate max-w-[130px]" title={segment.name}>
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                            <span className="text-[11px] text-[var(--text-secondary)] truncate">{segment.name}</span>
                          </div>
                          <span className="font-mono text-[var(--text-primary)] pl-1 shrink-0">{segment.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3 text-[10px] text-[var(--app-muted)] text-center tracking-wide font-semibold mt-1">
                    INDEX SYNC INTERVALS COMPLIANT WITH BLOCKS
                  </div>
                </div>

              </div>

              {/* ROW 2: 2 Columnsplit (Anomaly table [2cols] | Network Health score slider & Promo [1col]) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Left card Large: Live Anomaly Stream list */}
                <div className="lg:col-span-2 bento-card flex flex-col justify-between min-h-[460px]" id="card-live-anomaly-stream">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)]">
                        LIVE ANOMALY STREAM
                      </h2>
                      <p className="text-xs uppercase tracking-wider text-[var(--app-muted)] mt-1 font-semibold">
                        Real-time system transaction events
                      </p>
                    </div>
                    <Link href="/replay-v2">
                      <button className="bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150 cursor-pointer">
                        View Report
                      </button>
                    </Link>
                  </div>

                  {/* Table area */}
                  <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          <th className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-muted)]">Description</th>
                          <th className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-muted)] text-center hidden sm:table-cell">Time</th>
                          <th className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-muted)] text-center">Type</th>
                          <th className="py-2.5 text-[11px] font-bold uppercase tracking-wider text-[var(--app-muted)] text-right">Signal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence initial={false}>
                          {tickerLogs.slice(0, 6).map((log) => {
                            const firstChar = log.type ? log.type.charAt(0) : "A";
                            const colorClass = 
                              log.type === 'SPIKE' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                              log.type === 'COORDINATED' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20' :
                              log.type === 'BRIDGE' ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' :
                              'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';

                            return (
                              <motion.tr
                                key={log.id}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                className="border-b border-[var(--border)]/50 h-[52px] hover:bg-[var(--bg-hover)] transition-colors duration-150 group cursor-pointer"
                              >
                                {/* Description with visual circle */}
                                <td className="py-2">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none",
                                      log.type === 'SPIKE' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/10' :
                                      log.type === 'COORDINATED' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/10' :
                                      log.type === 'BRIDGE' ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/10' :
                                      'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/10'
                                    )}>
                                      {firstChar}
                                    </div>
                                    <span className="text-xs font-semibold text-[var(--text-primary)] max-w-[280px] sm:max-w-md truncate block group-hover:text-[#10B981] transition-colors leading-snug">
                                      {log.msg}
                                    </span>
                                  </div>
                                </td>

                                {/* Time (hidden sm) */}
                                <td className="py-2 text-xs font-mono text-[var(--text-secondary)] text-center hidden sm:table-cell">
                                  {log.time}
                                </td>

                                {/* Type Badge */}
                                <td className="py-2 text-center">
                                  <span className={cn(
                                    "px-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans border tracking-wide uppercase leading-none inline-block",
                                    colorClass
                                  )}>
                                    {log.type}
                                  </span>
                                </td>

                                {/* Signal / Delta */}
                                <td className="py-2 text-right">
                                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                                    {log.type === 'SPIKE' ? '+4.62 SD' :
                                     log.type === 'COORDINATED' ? '+5 Snipers' :
                                     log.type === 'BRIDGE' ? '+$1.2M' :
                                     '+$2,410 LP'}
                                  </span>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[10px] font-semibold font-mono text-[var(--app-muted)] text-center pt-3 border-t border-[var(--border)] tracking-wider">
                    DECONGESTION LATENCY MONITOR: NORMAL (540MS)
                  </div>
                </div>

                {/* Right col: Stack of Network Health and Promo Card */}
                <div className="flex flex-col gap-5 justify-between">
                  
                  {/* Network Health Slider (Maps to Saving Goal) */}
                  <div className="bento-card flex flex-col justify-between p-6 bg-[var(--bg-card)] rounded-2xl flex-grow border border-[var(--border)] hover:-translate-y-0.5" id="card-network-health">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-[18px] font-bold tracking-tight text-[var(--text-primary)] uppercase">
                          NETWORK HEALTH
                        </h2>
                        <p className="text-xs uppercase tracking-wider text-[var(--app-muted)] mt-1 font-semibold">
                          Optimal threshold status
                        </p>
                      </div>
                      <Link href="/health">
                        <button className="bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg px-3.5 py-1.5 text-xs transition-all duration-150 cursor-pointer">
                          View Report
                        </button>
                      </Link>
                    </div>

                    <div className="my-5 flex flex-col">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-[36px] font-black tracking-tight text-[var(--text-primary)] font-mono tabular-nums">
                          {marketHealth}/100
                        </span>
                        <span className="text-xs text-[var(--app-muted)] font-semibold font-mono">
                          of 100
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-semibold mb-3">
                        75% to optimal operating compliance
                      </p>

                      {/* HTML Progress bar with custom draggable indicator dot design */}
                      <div className="relative w-full py-4">
                        {/* Track Background */}
                        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative border border-[var(--border)]">
                          {/* Green Fill */}
                          <div 
                            style={{ width: `${marketHealth}%` }}
                            className="h-full bg-[#10B981] rounded-full transition-all duration-500 ease-out"
                          />
                        </div>
                        {/* Styled Draggable Bullet Indicator */}
                        <div 
                          style={{ left: `calc(${marketHealth}% - 8px)` }}
                          className="absolute top-1/2 -mt-2 w-4 h-4 rounded-full bg-white transition-all duration-500 ease-out z-10 hover:scale-110 shadow-[0_0_0_3px_#10B981] border border-neutral-300 pointer-events-none"
                        />
                      </div>
                    </div>

                    <span className="text-[9px] font-bold text-[var(--app-muted)] uppercase font-mono tracking-wider text-center block">
                      UPTIME INDEX AT 99.98% OVER LAST 180 BLOCKS
                    </span>
                  </div>

                  {/* Smart money hub Promo Card (Maps to Visit Blog) */}
                  <div className="bento-card relative flex items-center justify-between p-6 bg-gradient-to-br from-[#1E1E1E] to-[#121A15] p-6 hover:-translate-y-0.5 border border-[#10B981]/15" id="card-alpha-hub-blog">
                    {/* Glowing subtle green ring behind */}
                    <div className="absolute inset-x-0 inset-y-0 rounded-2xl bg-[#10B981]/[0.015] pointer-events-none" />

                    <div className="flex flex-col gap-3 max-w-[170px] z-10 relative">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">
                        Visit our Alpha Hub blog
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                        We have many articles related to decentralized finance data that will help you monitor assets.
                      </p>
                      <button className="self-start bg-transparent border border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981]/10 hover:border-[#10B981] rounded-lg px-3.5 py-1.5 text-[11px] font-black uppercase transition-all duration-150 cursor-pointer">
                        Visit Blog
                      </button>
                    </div>

                    {/* Highly responsive SVG illustration of character with scroll */}
                    <div className="w-[100px] h-[110px] sm:w-[110px] sm:h-[120px] relative z-10 flex items-center justify-center pointer-events-none self-end shrink-0">
                      <svg viewBox="0 0 110 120" className="w-full h-full overflow-visible">
                        {/* Blue-purple creature body */}
                        <g id="creature">
                          <path 
                            d="M 25,60 C 25,25 75,25 75,60 C 75,85 75,95 65,100 C 55,105 45,105 35,100 C 25,95 25,85 25,60 Z" 
                            fill="#3b82f6" 
                            stroke="#1d4ed8" 
                            strokeWidth="2" 
                          />
                          {/* Textures (micro scales/dots representing Chameleon) */}
                          <circle cx="35" cy="45" r="2.5" fill="#60a5fa" />
                          <circle cx="45" cy="50" r="2" fill="#60a5fa" />
                          <circle cx="65" cy="48" r="2.5" fill="#60a5fa" />
                          <circle cx="60" cy="40" r="1.5" fill="#60a5fa" />
                          <circle cx="55" cy="80" r="2" fill="#60a5fa" />
                          <circle cx="40" cy="85" r="2.5" fill="#60a5fa" />
                          
                          {/* Big alert eyes with pupils looking down onto scroll */}
                          <circle cx="42" cy="56" r="8" fill="white" stroke="#1d4ed8" strokeWidth="1.5" />
                          <circle cx="44" cy="58" r="3.5" fill="#0f172a" />
                          <circle cx="58" cy="56" r="8" fill="white" stroke="#1d4ed8" strokeWidth="1.5" />
                          <circle cx="56" cy="58" r="3.5" fill="#0f172a" />
                          
                          {/* Face details (Cheeks, small nervous smirk) */}
                          <path d="M 48,68 Q 50,71 52,68" stroke="#000" strokeWidth="1.5" fill="none" />
                        </g>
                        
                        {/* Cute creature legs */}
                        <path d="M 38,102 L 34,115" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 34,115 C 31,115 31,117 34,117" stroke="#1d4ed8" strokeWidth="2" />
                        <path d="M 62,102 L 66,115" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 66,115 C 69,115 69,117 66,117" stroke="#1d4ed8" strokeWidth="2" />

                        {/* Creature arms holding scroll */}
                        <path d="M 22,76 Q 12,74 25,78" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
                        <path d="M 74,74 Q 85,76 72,78" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />

                        {/* Paper Scroll scroll wrap visuals */}
                        <g id="scroll">
                          {/* Spilled scroll parchment backing */}
                          <path 
                            d="M 68,78 C 84,78 92,85 86,98 C 80,108 94,114 90,118 C 86,120 75,110 70,102 C 65,95 65,84 68,78 Z" 
                            fill="#f1f5f9" 
                            stroke="#64748b" 
                            strokeWidth="1.5" 
                            strokeLinejoin="round" 
                          />
                          {/* Main paper scroll body */}
                          <rect x="18" y="76" width="56" height="24" rx="4" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
                          <circle cx="18" cy="88" r="4.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
                          <circle cx="74" cy="88" r="4.5" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
                          
                          {/* Small technical code indicators inside paper */}
                          <line x1="28" y1="82" x2="48" y2="82" stroke="#cbd5e1" strokeWidth="1.5" />
                          <line x1="28" y1="87" x2="62" y2="87" stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1="28" y1="92" x2="54" y2="92" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
                        </g>
                      </svg>
                    </div>

                  </div>

                </div>

              </div>

            </motion.div>
          ) : (
            <motion.div
              key="flow-map-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* ORIGINAL STAT ROW */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stat 1 */}
                <div className="bento-card hover:border-[#10B981]/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Mantle Health Score</span>
                    <div className="p-1 px-2 rounded bg-[#10B981]/10 text-[#10B981] font-mono text-[10px] font-bold uppercase">
                      SYS STATUS
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-black tracking-tight text-[var(--text-primary)] font-mono">
                      {marketHealth}%
                    </span>
                    <span className="text-xs text-[#10B981] font-bold font-mono">
                      ▲ +{healthDelta}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-3 group-hover:text-[#10B981] transition-colors flex items-center gap-1">
                    Analyze historical deviations <ArrowRight className="w-3 h-3" />
                  </p>
                </div>

                {/* Stat 2 */}
                <div className="bento-card hover:border-violet-500/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Top Active Signal</span>
                    <div className="p-1.5 rounded-full bg-violet-500/10 text-violet-500">
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex flex-col mt-1">
                    <span className="text-base font-black text-[var(--text-primary)] tracking-tight">
                      MNT (Whale Accumulate)
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-mono font-bold mt-1">
                      Active: 0xabc (Trend Sniper)
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-3 group-hover:text-violet-500 transition-colors flex items-center gap-1">
                    Trace address moves <ArrowRight className="w-3 h-3" />
                  </p>
                </div>

                {/* Stat 3 */}
                <div className="bento-card hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Dominant Narrative</span>
                    <div className="p-1 px-2 rounded bg-amber-500/10 text-amber-500 font-mono text-[10px] font-bold">
                      92% SCORE
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
                      AI x GPU Cluster
                    </span>
                    <span className="text-xs text-amber-500 font-mono font-black">
                      ↗ HIGH MO
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-3 group-hover:text-amber-500 transition-colors flex items-center gap-1">
                    View narratives rank matrix <ArrowRight className="w-3 h-3" />
                  </p>
                </div>

                {/* Stat 4 */}
                <div className="bento-card hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group cursor-pointer p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Whale Alerts (24h)</span>
                    <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500">
                      <Shield className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-3xl font-black tracking-tight text-[var(--text-primary)] font-mono">
                      24 WHALES
                    </span>
                    <span className="text-xs text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10 font-mono">
                      ACTIVE FLUX
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-3 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                    Filter whale feed ledger <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </section>

              {/* D3 CAPITAL FLOW MAP PANEL & ANOMALY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Capital Flow Map Simulation representation */}
                <div 
                  ref={containerRef} 
                  className="lg:col-span-9 bento-card p-6 flex flex-col justify-between relative min-h-[480px] overflow-hidden bg-[var(--bg-card)]"
                >
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-[#10B981]" />
                      <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Mantle Capital Flow Map</h2>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] tracking-tight">
                      Force-directed real-time ledger representation. Hover & drag to organize nodes.
                    </p>
                  </div>

                  <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
                    <span className="text-[9px] bg-emerald-500/10 border border-[#10B981]/20 text-[#10B981] font-bold px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                      LIVE SIMULATOR
                    </span>
                  </div>

                  {/* Svg container */}
                  <div className="flex-grow flex items-center justify-center py-6 w-full h-full min-h-[360px]">
                    <svg ref={svgRef} className="w-full h-full text-[var(--text-primary)] overflow-visible" />
                  </div>

                  {/* Mini-Profile Details Drawer overlay */}
                  <AnimatePresence>
                    {activeNode && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-[320px] bg-[var(--bg-card)] border border-[var(--border)] p-4.5 rounded-2xl shadow-xl z-20 flex flex-col gap-3 max-h-[300px] overflow-y-auto"
                      >
                        <div className="flex justify-between items-start border-b border-[var(--border)] pb-2.5">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wide">
                              {activeNode.label}
                            </span>
                            <span className="text-[9px] font-mono bg-emerald-500/10 text-[#10B981] border border-[#10B981]/20 px-1.5 py-0.5 rounded uppercase mt-1 w-max font-bold">
                              {activeNode.type.toUpperCase()}
                            </span>
                          </div>
                          <button 
                            onClick={() => setActiveNode(null)}
                            className="p-1 hover:bg-[var(--bg-hover)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all text-sm font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-2 mt-1">
                          {activeNode.type === 'wallet' ? (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-[var(--bg-base)] border border-[var(--border)] p-2 rounded-xl">
                                  <span className="block text-[9px] text-[var(--text-secondary)] font-bold uppercase">Win Rate</span>
                                  <span className="font-mono text-sm font-black text-[var(--text-primary)]">{activeNode.winRate}</span>
                                </div>
                                <div className="bg-[var(--bg-base)] border border-[var(--border)] p-2 rounded-xl">
                                  <span className="block text-[9px] text-[var(--text-secondary)] font-bold">Est PnL</span>
                                  <span className="font-mono text-sm font-black text-[#10B981]">{activeNode.pnl}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[11px] font-mono mt-1 border border-[var(--border)] rounded-xl p-2 bg-[var(--bg-base)]/50">
                                <span className="text-xs font-medium text-[var(--text-primary)]">Node ID: {activeNode.id}</span>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => activeNode.fullAddress && handleCopy(activeNode.fullAddress)}
                                    className="p-1 hover:text-[#10B981] transition-colors"
                                    title="Copy Full Address"
                                  >
                                    {copied ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3 text-[var(--text-secondary)]" />}
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-[var(--bg-base)] border border-[var(--border)] p-2 rounded-xl">
                                  <span className="block text-[9px] text-[var(--text-secondary)] font-bold uppercase">Total TVL</span>
                                  <span className="font-mono text-xs font-bold text-[var(--text-primary)]">{activeNode.tvl}</span>
                                </div>
                                <div className="bg-[var(--bg-base)] border border-[var(--border)] p-2 rounded-xl">
                                  <span className="block text-[9px] text-[var(--text-secondary)] font-bold uppercase">Volume (24h)</span>
                                  <span className="font-mono text-xs font-bold text-indigo-500">{activeNode.volume24h}</span>
                                </div>
                              </div>

                              <div className="bg-[var(--bg-base)]/50 border border-[var(--border)] rounded-xl p-2 text-[10px]">
                                <span className="block font-semibold text-[var(--text-secondary)] uppercase mb-1">Core Pair</span>
                                <span className="font-mono text-[var(--text-primary)] font-black">{activeNode.mainAsset}</span>
                              </div>
                            </>
                          )}

                          {activeNode.allocations && (
                            <div className="mt-2.5">
                              <span className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Asset Allocation</span>
                              <div className="flex h-1.5 rounded-full overflow-hidden w-full bg-[var(--bg-base)]">
                                {activeNode.allocations.map((alloc, idx) => (
                                  <div 
                                    key={idx} 
                                    style={{ width: `${alloc.pct}%` }} 
                                    className={cn(
                                      "h-full", 
                                      idx === 0 ? "bg-[#10B981]" : idx === 1 ? "bg-blue-500" : "bg-purple-500"
                                    )} 
                                    title={`${alloc.asset}: ${alloc.pct}%`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <Link 
                            href={activeNode.type === 'wallet' ? `/dashboard?search=${activeNode.id}` : `/dashboard`}
                            className="mt-3 block text-center bg-[#10B981] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all w-full shadow-inner"
                          >
                            Open Forensic Terminal →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right col ticker logs */}
                <div className="lg:col-span-3 bento-card p-5 flex flex-col justify-between bg-[var(--bg-card)]">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
                      <h2 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-sans">Live Anomaly Stream</h2>
                    </div>
                    <span className="text-[9px] bg-rose-500/10 border border-rose-500/15 text-rose-500 font-bold px-2 py-0.5 rounded uppercase font-mono">
                      Z-Score Tick
                    </span>
                  </div>

                  <div className="flex-grow space-y-3 pr-1 overflow-y-auto max-h-[410px] scrollbar-none font-mono">
                    <AnimatePresence initial={false}>
                      {tickerLogs.map((log) => (
                        <motion.div 
                          key={log.id}
                          initial={{ opacity: 0, y: -15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.98 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="bg-[var(--bg-base)] border border-[var(--border)] p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors flex flex-col gap-1 text-[11px] group cursor-pointer"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn(
                              "text-[8px] font-extrabold px-1.5 py-0.5 rounded border leading-none font-sans",
                              log.type === 'SPIKE' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' :
                              log.type === 'COORDINATED' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20' :
                              log.type === 'BRIDGE' ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' :
                              'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20'
                            )}>
                              {log.type}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-black font-mono">
                              {log.time}
                            </span>
                          </div>
                          <p className="text-[var(--text-primary)] font-semibold leading-relaxed group-hover:text-[#10B981] transition-colors font-sans">
                            {log.msg}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border)] text-[9px] text-[var(--app-muted)] font-semibold uppercase font-mono tracking-wider text-center select-none">
                    Listening on network anomaly feeds v3.1
                  </div>
                </div>

              </div>

              {/* ORIGINAL THREE LOWER TILES (Health matrix, alpha stream, top wins list) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 14-day Eco Health Trend mini-chart */}
                <div className="bento-card p-6 flex flex-col justify-between relative min-h-[320px] bg-[var(--bg-card)]">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Ecosystem Health Matrix</span>
                    <div className="flex justify-between items-baseline animate-fade-in">
                      <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)]">14-Day Trend Index</h3>
                      <span className="bg-[#10B981]/10 text-[#10B981] font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-[#10B981]/10">
                        Composite Score
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow w-full h-[180px] min-h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={HEALTH_HISTORY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="glowScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.12}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 9, fontWeight: 500 }}
                          tickFormatter={(val) => val.split(' ')[1]}
                        />
                        <YAxis 
                          domain={[60, 95]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 9, fontWeight: 500 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--bg-card)', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            color: 'var(--text-primary)'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#10B981" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#glowScore)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-2 text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed font-sans">
                    Composite score measures TVL trends, staking growth, smart money buy weight, & on-chain network speeds over time.
                  </div>
                </div>

                {/* Alpha Feed Preview */}
                <div className="bento-card p-6 flex flex-col justify-between relative min-h-[320px] bg-[var(--bg-card)]">
                  <div className="flex justify-between items-baseline mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Condensed Intelligence Feed</span>
                      <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Alpha Feed Preview</h3>
                    </div>
                    <Link 
                      href="/dashboard"
                      className="text-xs font-bold text-[#10B981] hover:underline font-mono flex items-center gap-0.5 uppercase"
                    >
                      View All <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="flex-grow space-y-2.5 overflow-hidden">
                    {signalsFeed.slice(0, 5).map((sig, idx) => (
                      <div 
                        key={idx} 
                        className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/50 hover:bg-[var(--bg-hover)] transition-all flex flex-col gap-2.5 text-xs group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center border",
                              sig.type.includes('BUY') ? "bg-emerald-500/10 text-[#10B981] border-emerald-500/15" :
                              sig.type.includes('ALERT') ? "bg-blue-500/10 text-blue-500 border-blue-500/15" :
                              sig.type.includes('ARB') ? "bg-purple-500/10 text-[#8b5cf6] border-[#8b5cf6]/15" :
                              "bg-amber-500/10 text-[#F59E0B] border-[#F59E0B]/15"
                            )}>
                              {sig.type.includes('BUY') ? <Target className="w-3.5 h-3.5" /> :
                               sig.type.includes('ALERT') ? <Shield className="w-3.5 h-3.5" /> :
                               sig.type.includes('ARB') ? <Cpu className="w-3.5 h-3.5" /> :
                               <Sparkles className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-[var(--text-primary)] group-hover:text-[#10B981] transition-colors">{sig.typeName}</span>
                              <span className="text-[9px] text-[var(--text-secondary)] font-mono font-semibold">{sig.addressSnippet}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-[11px] font-black font-mono text-[var(--text-primary)] uppercase">{sig.token}</span>
                            <span className="text-[9px] bg-emerald-500/10 text-[#10B981] font-bold font-mono px-1.5 py-0.2 rounded border border-[#10B981]/15 mt-0.5">
                              {sig.conf}% conf
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/replay-v2?id=sig-${sig.token.toLowerCase()}-001`}
                            className="text-[9px] font-black uppercase text-[#10B981] bg-emerald-500/10 border border-[#10B981]/20 px-2.5 py-1 rounded transition-all hover:bg-emerald-500/20 font-mono"
                          >
                            ⚡ Replay Signal
                          </Link>
                          <Link 
                            href={`/dashboard?search=${sig.wallet}`}
                            className="text-[9px] font-black uppercase text-[var(--text-secondary)] bg-[var(--bg-base)] border border-[var(--border)] px-2.5 py-1 rounded transition-all hover:bg-[var(--bg-hover)]"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Money Win Index List */}
                <div className="bento-card p-6 flex flex-col justify-between relative min-h-[320px] bg-[var(--bg-card)]">
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">Top Wallets Win Index</span>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-lg font-black tracking-tight text-[var(--text-primary)] font-sans">Smart Money Mini-List</h3>
                      <span className="text-[9px] text-[var(--text-secondary)] font-bold font-mono bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded uppercase">
                        Sorted by win rate
                      </span>
                    </div>
                  </div>

                  <div className="flex-grow space-y-2.5 overflow-hidden">
                    {TOP_WALLETS.map((wal, idx) => {
                      const pathString = wal.sparkPoints.reduce((acc, point, i) => {
                        const x = (i * (100 / 8)).toFixed(0);
                        const y = (32 - (point / 100) * 26).toFixed(0);
                        return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
                      }, '');

                      return (
                        <Link 
                          href={`/dashboard?search=${wal.id}`}
                          key={idx} 
                          className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-base)]/50 border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-base)] transition-all text-xs group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 w-1/3">
                            <span className="font-bold text-[var(--text-primary)] group-hover:text-[#10B981] transition-colors font-mono">{wal.id}</span>
                            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block tracking-tight truncate leading-none md:max-w-24 font-sans">
                              {wal.dna}
                            </span>
                          </div>

                          <div className="w-1/3 h-7 relative px-2 max-w-20 overflow-hidden" title="Balance moves history sparkline">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 32">
                              <path 
                                d={pathString} 
                                fill="none" 
                                stroke={wal.win >= '75%' ? 'var(--app-emerald)' : 'var(--text-secondary)'} 
                                strokeWidth="1.8" 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <div className="w-1/4 text-right flex flex-col font-sans">
                            <span className="text-xs font-semibold text-[var(--text-primary)] font-mono leading-none">{wal.win} Win%</span>
                            <span className="text-[9px] text-[#10B981] font-mono font-bold mt-1 uppercase tracking-wider">{wal.pnl} pnl</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-3 text-[10px] text-[var(--text-secondary)] font-semibold uppercase font-mono tracking-wider text-center">
                    Tracking 5 high conviction segment nodes live.
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* FOOTER BAR */}
      <footer className="mt-8 shrink-0 bg-[var(--bg-base)] border-t border-[var(--border)] py-6 px-4 md:px-8 z-40 relative select-none font-mono text-[10px] text-[var(--app-muted)] font-semibold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2">
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-[#10B981] rounded-full opacity-60"></span>
              <span>INDEX ENGINE: CHAMELEON-V3.5</span>
            </span>
            <span>LATENCY COMPLIANCE: OK</span>
            <span>SYNC BLOCK: #2,491,314</span>
          </div>
          <div className="flex space-x-6">
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Protocol: Mantle-v2.5</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Compliance: Audited</span>
            <span className="text-[#10B981]/40 font-bold">©2026 Chameleon Labs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
