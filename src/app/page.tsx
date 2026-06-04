"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  ArrowRight
} from 'lucide-react';
import { ChameleonLogo } from '@/src/components/ChameleonLogo';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);
  const [tickerLogs, setTickerLogs] = useState(ANOMALY_TICKERS);
  const [marketHealth, setMarketHealth] = useState(88);
  const [healthDelta, setHealthDelta] = useState(3.2);
  const [signalsFeed, setSignalsFeed] = useState(INITIAL_SIGNALS);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  // Synchronize system dark theme across elements
  useEffect(() => {
    setIsMounted(true);
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Suppress "ResizeObserver loop completed with undelivered notifications" and "ResizeObserver loop limit exceeded" errors.
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

  // Seed data definitions representing current status of the Mantle flow ecology
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

  // Interval simulating real-time activity in both Live Stream list and top widgets
  useEffect(() => {
    // Scroll active anomaly ticker
    const tickerInterval = setInterval(() => {
      setTickerLogs((prev) => {
        const nextId = `ticker_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        const types = ['Z-SCORE', 'WHALE_ALERT', 'DEX_PEEL', 'BRIDGE_FLOW', 'MEV_FRONT', 'LIQUIDITY'];
        const msgs = [
          `Z-score standard deviation spike: +${(3 + Math.random() * 3).toFixed(2)} SD in mETH pool`,
          `Coordinated block buy: ${4 + Math.round(Math.random() * 4)} wallets swapped stables to AGNI within 5s`,
          `High bridge block detect: ${(Math.random() * 3).toFixed(1)}M USDT inbound via Symbiosis`,
          `Frontrun execution detected: sandwich contract acquired MNT ahead of trade block`,
          `Gas premium surge: gas fee spikes to ${(Math.random() * 0.4 + 0.1).toFixed(2)} GWEI on concentrated LP sweep`,
          `Bridge outbound trigger: ${(200 + Math.random() * 800).toFixed(0)}k MNT bridged out to Mainnet`,
          `Strategic rebalance: wallet 0xdef reassigned ${(30 + Math.random() * 40).toFixed(0)}k LP limits on AGNI-V3`
        ];
        
        const index = Math.floor(Math.random() * msgs.length);
        const typeSelect = types[Math.floor(Math.random() * types.length)];
        const curTime = new Date().toLocaleTimeString([], { hour12: false });
        
        const newItem = { id: nextId, time: curTime, msg: msgs[index], type: typeSelect };
        return [newItem, ...prev.slice(0, 10)];
      });

      // Modulate health score slightly to represent real-time updates
      setMarketHealth(prev => {
        const step = Math.random() > 0.5 ? 1 : -1;
        const nextVal = prev + step;
        return nextVal > 95 ? 95 : nextVal < 70 ? 70 : nextVal;
      });

      // Update signal feed dynamically with simulated transactions
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

  // Set up the interactive D3 Simulation for the Capital Flow Map inside svgRef
  useEffect(() => {
    if (!isMounted || !svgRef.current || !containerRef.current) return;

    // Use ResizeObserver to determine container sizing dynamically
    const container = containerRef.current;
    let width = container.clientWidth || 800;
    let height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // clear prior elements

    const nodes: GraphNode[] = JSON.parse(JSON.stringify(nodesData));
    const links: GraphLink[] = JSON.parse(JSON.stringify(linksData));

    // Construct force coordinates
    const simulation = d3.forceSimulation<GraphNode, GraphLink>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links)
        .id((d: any) => d.id)
        .distance(115)
      )
      .force('charge', d3.forceManyBody().strength(-240))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.value * 2.8 + 12));

    simulationRef.current = simulation;

    // Set up responsive canvas bindings
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: newWidth } = entries[0].contentRect;
      
      // Wrap in requestAnimationFrame to decouple heavy state/DOM mutations from the ResizeObserver check, 
      // preventing "ResizeObserver loop completed with undelivered notifications" cycles.
      requestAnimationFrame(() => {
        width = newWidth;
        svg.attr('width', width).attr('height', height);
        simulation.force('center', d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();
      });
    });
    
    resizeObserver.observe(container);

    // Group for dragging and links
    const gLinks = svg.append('g').attr('class', 'links-group');
    const gNodes = svg.append('g').attr('class', 'nodes-group');

    // Create the links SVG paths representation
    const linkLines = gLinks.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', isDarkMode ? '#1e2521' : '#e2e7e4')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', (d) => d.value * 1.5)
      .attr('class', 'flow-cable') // Apply infinite CSS scroll dash keyframes
      .attr('stroke-dasharray', '5 5')
      .style('cursor', 'pointer')
      .attr('stroke', (d) => d.asset === 'MNT' ? '#00b074' : d.asset === 'USDC' ? '#3b82f6' : '#a855f7');

    // Create custom nodes representation g elements
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

    // Render node base glowing boundaries
    nodeContainers.append('circle')
      .attr('r', (d) => d.value * 2.2 + 8)
      .attr('fill', (d) => {
        if (d.type === 'protocol') return 'rgba(0, 176, 116, 0.08)';
        if (d.type === 'bridge') return 'rgba(168, 85, 247, 0.08)';
        return 'rgba(59, 130, 246, 0.08)';
      })
      .attr('stroke', (d) => {
        if (d.type === 'protocol') return '#00b074';
        if (d.type === 'bridge') return '#a855f7';
        return '#3b82f6';
      })
      .attr('stroke-width', 1.8);

    // Add visual identity symbols inside nodes
    nodeContainers.append('circle')
      .attr('r', 4)
      .attr('fill', (d) => d.type === 'protocol' ? '#00b074' : d.type === 'bridge' ? '#a855f7' : '#3b82f6');

    // Render nodes literal human text and identifiers
    nodeContainers.append('text')
      .attr('dy', (d) => d.value * 2.2 + 22)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('class', 'font-sans text-app-fg select-none fill-current')
      .attr('fill', isDarkMode ? '#f3f5f4' : '#0d120f')
      .text((d) => d.label);

    // Simulation tick coordinates mappings
    simulation.on('tick', () => {
      linkLines
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeContainers
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });

    // D3 Drag handlers
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
  }, [nodesData, linksData, isDarkMode, isMounted]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn(
      "min-h-screen bg-app-bg text-app-fg selection:bg-emerald-500/30 p-4 md:p-6 flex flex-col gap-6 transition-all duration-300",
      isDarkMode ? "dark" : "light"
    )}>
      {/* Styles for glowing moving fiber optic dashes inside the Capital Map */}
      <style>{`
        @keyframes d3-flow {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .flow-cable {
          animation: d3-flow 1s linear infinite;
        }
      `}</style>

      {/* Primary Terminal Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-app-border/60 pb-5">
        <div className="flex items-center space-x-3.5 group cursor-pointer">
          <div className="relative flex items-center justify-center p-2 bg-app-emerald/[0.08] dark:bg-app-emerald/10 border border-app-emerald/20 rounded-2xl transition-all duration-300 group-hover:bg-app-emerald/[0.12] group-hover:scale-[1.03]">
            <ChameleonLogo className="w-7 h-7 relative z-10 text-app-emerald" animated={true} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-app-fg font-sans">
                Chameleon
              </h1>
              <span className="text-app-emerald tracking-wide text-[10px] px-2 py-0.5 border border-app-emerald/25 bg-app-emerald/10 rounded-md font-bold uppercase select-none font-mono">
                COMMAND CENTER
              </span>
            </div>
            <p className="text-[10px] text-app-zinc-text font-semibold uppercase tracking-wider mt-0.5">Mantle Realtime Ecosystem deck</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button className="border border-app-emerald text-app-emerald bg-app-emerald/10 font-bold px-4.5 py-1.5 rounded-full text-xs transition-all duration-200">
              Home Command
            </button>
            <Link 
              href="/dashboard"
              className="border border-app-border text-app-zinc-text bg-app-card hover:bg-app-card-hover hover:text-app-fg px-4.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all"
            >
              Smart Money Terminal
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card border border-app-border hover:bg-app-card-hover text-app-fg transition-all active:scale-95 cursor-pointer shadow-sm"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            <div className="hidden sm:flex bg-app-card border border-app-emerald/25 px-3 py-1.5 rounded-full items-center space-x-2 shadow-sm">
              <div className="w-2 h-2 bg-app-emerald rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono text-app-emerald uppercase tracking-wider font-bold">Mantle Network OK</span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI TILE ROW (Top Level - Four Stat tiles side by side, clickable routing to terminal) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Mantle Health Score */}
        <Link 
          href="/dashboard"
          className="bg-app-card border border-app-border rounded-2xl p-5 hover:bg-app-card-hover hover:border-app-emerald/30 transition-all duration-300 shadow-sm flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-app-zinc-text tracking-wider">Mantle Health Score</span>
            <div className="p-1 px-2 rounded-md bg-app-emerald/10 text-app-emerald font-mono text-[10px] font-bold">
              SYS STATUS
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black tracking-tight text-app-fg font-mono">
              {marketHealth}%
            </span>
            <span className="text-xs text-app-emerald font-bold font-mono flex items-center">
              ▲ +{healthDelta}%
            </span>
          </div>
          <p className="text-[10px] text-app-zinc-text font-medium mt-3 group-hover:text-app-emerald transition-colors flex items-center gap-1">
            Analyze historical deviations <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* KPI 2: Top Active Signal */}
        <Link 
          href="/dashboard?search=0xabc"
          className="bg-app-card border border-app-border rounded-2xl p-5 hover:bg-app-card-hover hover:border-violet-500/30 transition-all duration-300 shadow-sm flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-app-zinc-text tracking-wider">Top Active Signal</span>
            <div className="p-1.5 rounded-full bg-violet-500/10 text-violet-500">
              <Zap className="w-3 h-3" />
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-base font-black text-app-fg tracking-tight">
              MNT (Whale Accumulate)
            </span>
            <span className="text-[10px] text-app-zinc-text uppercase tracking-widest font-mono font-bold mt-1">
              Active: 0xabc (Trend Sniper)
            </span>
          </div>
          <p className="text-[10px] text-app-zinc-text font-medium mt-3 group-hover:text-violet-500 transition-colors flex items-center gap-1">
            Trace address moves <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* KPI 3: Dominant Narrative */}
        <Link 
          href="/dashboard"
          className="bg-app-card border border-app-border rounded-2xl p-5 hover:bg-app-card-hover hover:border-amber-500/30 transition-all duration-300 shadow-sm flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-app-zinc-text tracking-wider">Dominant Narrative</span>
            <div className="p-1 px-2 rounded-md bg-amber-500/10 text-amber-600 font-mono text-[10px] font-bold">
              92% SCORE
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-xl font-extrabold text-app-fg tracking-tight">
              AI x GPU Cluster
            </span>
            <span className="text-xs text-amber-500 font-mono font-black flex items-center gap-0.5">
              ↗ HIGH MO
            </span>
          </div>
          <p className="text-[10px] text-app-zinc-text font-medium mt-3 group-hover:text-amber-500 transition-colors flex items-center gap-1">
            View narratives rank matrix <ArrowRight className="w-3 h-3" />
          </p>
        </Link>

        {/* KPI 4: Whale Alert Count (last 24h) */}
        <Link 
          href="/dashboard?filter=WHALES"
          className="bg-app-card border border-app-border rounded-2xl p-5 hover:bg-app-card-hover hover:border-blue-500/30 transition-all duration-300 shadow-sm flex flex-col justify-between group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase font-bold text-app-zinc-text tracking-wider">Whale Alerts (24h)</span>
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500">
              <Shield className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black tracking-tight text-app-fg font-mono">
              24 WHALES
            </span>
            <span className="text-xs text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10 font-mono">
              ACTIVE FLUX
            </span>
          </div>
          <p className="text-[10px] text-app-zinc-text font-medium mt-3 group-hover:text-blue-500 transition-colors flex items-center gap-1">
            Filter whale feed ledger <ArrowRight className="w-3 h-3" />
          </p>
        </Link>
      </section>

      {/* MIDDLE SECTION: Capital Flow Map & Anomaly Stream */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* PANEL: Capital Flow Map (Colspan-9) */}
        <div 
          ref={containerRef} 
          className="lg:col-span-9 bento-card p-6 flex flex-col justify-between relative min-h-[480px] overflow-hidden bg-app-card/30 backdrop-blur-sm"
        >
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-app-emerald" />
              <h2 className="text-xs font-bold text-app-fg uppercase tracking-wider">Mantle Capital Flow Map</h2>
            </div>
            <p className="text-[10px] text-app-zinc-text uppercase tracking-tight">Force-directed real-time ledger representation. Hover & drag to organize nodes.</p>
          </div>

          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <span className="text-[9px] bg-emerald-500/10 text-app-emerald border border-app-emerald/20 px-2.5 py-0.5 rounded-full font-bold uppercase animate-pulse">
              LIVE SIMULATOR
            </span>
          </div>

          {/* Svg container for D3 simulation */}
          <div className="flex-grow flex items-center justify-center py-6 w-full h-full min-h-[360px]">
            <svg ref={svgRef} className="w-full h-full text-app-fg overflow-visible" />
          </div>

          {/* Mini-Profile Details Drawer overlaying the bottom corner beautifully when any node is clicked */}
          <AnimatePresence>
            {activeNode && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-[320px] bg-app-card/95 backdrop-blur-md border border-app-border p-4.5 rounded-2xl shadow-xl z-20 flex flex-col gap-3 max-h-[300px] overflow-y-auto"
              >
                <div className="flex justify-between items-start border-b border-app-border pb-2.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-app-fg uppercase tracking-wide">
                      {activeNode.label}
                    </span>
                    <span className="text-[9px] font-mono bg-app-emerald/10 text-app-emerald border border-app-emerald/20 px-1.5 py-0.5 rounded uppercase mt-1 w-max font-bold">
                      {activeNode.type.toUpperCase()}
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveNode(null)}
                    className="p-1 hover:bg-app-bg rounded-lg text-app-zinc-text hover:text-app-fg transition-all text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 mt-1">
                  {activeNode.type === 'wallet' ? (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-app-bg border border-app-border p-2 rounded-xl">
                          <span className="block text-[9px] text-app-zinc-text font-bold uppercase">Win Rate</span>
                          <span className="font-mono text-sm font-black text-app-fg">{activeNode.winRate}</span>
                        </div>
                        <div className="bg-app-bg border border-app-border p-2 rounded-xl">
                          <span className="block text-[9px] text-app-zinc-text font-bold">Est PnL</span>
                          <span className="font-mono text-sm font-black text-app-emerald">{activeNode.pnl}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono mt-1 border border-app-border rounded-xl p-2 bg-app-bg/50">
                        <span className="text-xs font-medium text-app-fg">Node ID: {activeNode.id}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => activeNode.fullAddress && handleCopy(activeNode.fullAddress)}
                            className="p-1 hover:text-app-emerald transition-colors"
                            title="Copy Full Address"
                          >
                            {copied ? <Check className="w-3 h-3 text-app-emerald" /> : <Copy className="w-3 h-3 text-app-zinc-text" />}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-app-bg border border-app-border p-2 rounded-xl">
                          <span className="block text-[9px] text-app-zinc-text font-bold uppercase">Total TVL</span>
                          <span className="font-mono text-xs font-bold text-app-fg">{activeNode.tvl}</span>
                        </div>
                        <div className="bg-app-bg border border-app-border p-2 rounded-xl">
                          <span className="block text-[9px] text-app-zinc-text font-bold uppercase">Volume (24h)</span>
                          <span className="font-mono text-xs font-bold text-indigo-500">{activeNode.volume24h}</span>
                        </div>
                      </div>

                      <div className="bg-app-bg/50 border border-app-border rounded-xl p-2 text-[10px]">
                        <span className="block font-semibold text-app-zinc-text uppercase mb-1">Core Pair</span>
                        <span className="font-mono text-app-fg font-black">{activeNode.mainAsset}</span>
                      </div>
                    </>
                  )}

                  {/* Allocations Split indicator preview */}
                  {activeNode.allocations && (
                    <div className="mt-2.5">
                      <span className="block text-[9px] font-bold text-app-zinc-text uppercase tracking-wider mb-1.5">Asset Allocation</span>
                      <div className="flex h-1.5 rounded-full overflow-hidden w-full bg-app-bg">
                        {activeNode.allocations.map((alloc, idx) => (
                          <div 
                            key={idx} 
                            style={{ width: `${alloc.pct}%` }} 
                            className={cn(
                              "h-full", 
                              idx === 0 ? "bg-app-emerald" : idx === 1 ? "bg-blue-500" : "bg-purple-500"
                            )} 
                            title={`${alloc.asset}: ${alloc.pct}%`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Link 
                    href={activeNode.type === 'wallet' ? `/dashboard?search=${activeNode.id}` : `/dashboard`}
                    className="mt-3 block text-center bg-app-emerald text-white text-xs font-bold uppercase tracking-wider py-2 rounded-xl hover:opacity-90 active:scale-95 transition-all w-full shadow-inner"
                  >
                    Open Forensic Terminal →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PANEL: Live Anomaly Stream (Colspan-3 Ticker) */}
        <div className="lg:col-span-3 bento-card p-5 flex flex-col justify-between bg-app-card/45 backdrop-blur-sm relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-app-border/40">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></div>
              <h2 className="text-xs font-bold text-app-fg uppercase tracking-wider">Live Anomaly Stream</h2>
            </div>
            <span className="text-[9px] bg-rose-500/10 border border-rose-500/15 text-rose-500 font-bold px-2 py-0.5 rounded uppercase font-mono">
              Z-Score Tick
            </span>
          </div>

          {/* Scrolling ticker logs container */}
          <div className="flex-grow space-y-3 pr-1 overflow-y-auto max-h-[410px] scrollbar-none font-mono">
            <AnimatePresence initial={false}>
              {tickerLogs.map((log) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, y: -15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="bg-app-bg border border-app-border p-3 rounded-xl hover:bg-app-card-hover transition-colors flex flex-col gap-1 text-[11px] group cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-[8px] font-extrabold px-1.5 py-0.5 rounded border leading-none font-sans",
                      log.type === 'SPIKE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      log.type === 'COORDINATED' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                      log.type === 'BRIDGE' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    )}>
                      {log.type}
                    </span>
                    <span className="text-[10px] text-app-zinc-text font-black font-mono">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-app-fg font-semibold leading-relaxed group-hover:text-app-emerald transition-colors">
                    {log.msg}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 pt-3 border-t border-app-border/40 text-[9px] text-app-zinc-text font-semibold uppercase font-mono tracking-wider text-center select-none">
            Listening on network anomaly feeds v3.1
          </div>
        </div>
      </section>

      {/* BOTTOM ROW: Bento Grid of details chart, Alpha feed preview, and Smart Money Sparklines */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Panel 1: 14-day Eco Health Trend mini-chart */}
        <div className="bento-card p-6 flex flex-col justify-between relative min-h-[320px] bg-app-card/45 backdrop-blur-sm">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-app-zinc-text uppercase tracking-wider block mb-1">Ecosystem Health Matrix</span>
            <div className="flex justify-between items-baseline">
              <h3 className="text-lg font-black tracking-tight text-app-fg">14-Day Trend Index</h3>
              <span className="bg-app-emerald/10 text-app-emerald font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-app-emerald/10">
                Composite Score
              </span>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="flex-grow w-full h-[180px] min-h-[160px] flex items-center justify-center">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HEALTH_HISTORY_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <defs>
                    <linearGradient id="glowScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDarkMode ? "#00b074" : "#00875a"} stopOpacity={0.12}/>
                      <stop offset="95%" stopColor={isDarkMode ? "#00b074" : "#00875a"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 9, fontWeight: 500 }}
                    tickFormatter={(val) => val.split(' ')[1]} // simplify ticker labels
                  />
                  <YAxis 
                    domain={[60, 95]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDarkMode ? '#8fa396' : '#6b7280', fontSize: 9, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#121714' : '#ffffff', 
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
                    stroke={isDarkMode ? "#00b074" : "#00875a"} 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#glowScore)" 
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
            )}
          </div>

          <div className="mt-2 text-[10px] text-app-zinc-text font-medium leading-relaxed">
            Composite score measures TVL trends, staking growth, smart money buy weight, & on-chain network speeds over time.
          </div>
        </div>

        {/* Panel 2: Alpha Feed Preview */}
        <div className="bento-card p-6 flex flex-col justify-between relative min-h-[320px] bg-app-card/45 backdrop-blur-sm">
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="text-[10px] font-bold text-app-zinc-text uppercase tracking-wider block mb-1">Condensed Intelligence Feed</span>
              <h3 className="text-lg font-black tracking-tight text-app-fg">Alpha Feed Preview</h3>
            </div>
            
            <Link 
              href="/dashboard"
              className="text-xs font-bold text-app-emerald hover:underline font-mono flex items-center gap-0.5 uppercase"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-grow space-y-2.5 overflow-hidden">
            {signalsFeed.slice(0, 5).map((sig, idx) => (
              <Link 
                href={`/dashboard?search=${sig.wallet}`}
                key={idx} 
                className="p-2.5 rounded-xl border border-app-border/80 bg-app-bg/50 hover:bg-app-card-hover transition-all flex items-center justify-between text-xs cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center border",
                    sig.type.includes('BUY') ? "bg-emerald-500/10 text-app-emerald border-app-emerald/15" :
                    sig.type.includes('ALERT') ? "bg-blue-500/10 text-blue-500 border-blue-500/15" :
                    sig.type.includes('ARB') ? "bg-purple-500/10 text-purple-500 border-purple-500/15" :
                    "bg-amber-500/10 text-amber-500 border-amber-500/15"
                  )}>
                    {sig.type.includes('BUY') ? <Target className="w-3.5 h-3.5" /> :
                     sig.type.includes('ALERT') ? <Shield className="w-3.5 h-3.5" /> :
                     sig.type.includes('ARB') ? <Cpu className="w-3.5 h-3.5" /> :
                     <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-app-fg group-hover:text-app-emerald transition-colors">{sig.typeName}</span>
                    <span className="text-[9px] text-app-zinc-text font-mono font-semibold">{sig.addressSnippet}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black font-mono text-app-fg uppercase">{sig.token}</span>
                  <span className="text-[9px] bg-app-emerald/10 text-app-emerald font-bold font-mono px-1.5 py-0.2 rounded border border-app-emerald/15 mt-0.5">
                    {sig.conf}% conf
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Panel 3: Smart Money Mini-list with interactive SVG Sparklines */}
        <div className="bento-card p-6 flex flex-col justify-between relative min-h-[320px] bg-app-card/45 backdrop-blur-sm">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-app-zinc-text uppercase tracking-wider block mb-1">Top Wallets Win Index</span>
            <div className="flex justify-between items-baseline">
              <h3 className="text-lg font-black tracking-tight text-app-fg">Smart Money Mini-List</h3>
              <span className="text-[9px] text-app-zinc-text font-bold font-mono bg-app-bg border border-app-border px-2 py-0.5 rounded uppercase">
                Sorted by win rate
              </span>
            </div>
          </div>

          <div className="flex-grow space-y-2.5 overflow-hidden">
            {TOP_WALLETS.map((wal, idx) => {
              // Construct inline mini SVG path string representing sparklinepoints
              const pathString = wal.sparkPoints.reduce((acc, point, i) => {
                const x = (i * (100 / 8)).toFixed(0);
                const y = (32 - (point / 100) * 26).toFixed(0); // clamp inside view height
                return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
              }, '');

              return (
                <Link 
                  href={`/dashboard?search=${wal.id}`}
                  key={idx} 
                  className="flex items-center justify-between p-2 rounded-xl bg-app-bg/50 border border-transparent hover:border-app-border hover:bg-app-bg transition-all text-xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 w-1/3">
                    <span className="font-bold text-app-fg group-hover:text-app-emerald transition-colors font-mono">{wal.id}</span>
                    <span className="text-[9px] font-bold text-app-zinc-text uppercase block tracking-tight truncate leading-none md:max-w-24">
                      {wal.dna}
                    </span>
                  </div>

                  {/* High Quality Inline SVG sparkline representation */}
                  <div className="w-1/3 h-7 relative px-2 max-w-20 overflow-hidden" title="Balance moves history sparkline">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 32">
                      <path 
                        d={pathString} 
                        fill="none" 
                        stroke={wal.win >= '75%' ? 'var(--app-emerald)' : 'var(--app-zinc-text)'} 
                        strokeWidth="1.8" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="w-1/4 text-right flex flex-col">
                    <span className="text-xs font-black font-semibold text-app-fg font-mono leading-none">{wal.win} Win%</span>
                    <span className="text-[9px] text-app-emerald font-mono font-bold mt-1 uppercase tracking-wider">{wal.pnl} pnl</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-3 text-[10px] text-app-zinc-text font-semibold uppercase font-mono tracking-wider text-center">
            Tracking 5 high conviction segment nodes live.
          </div>
        </div>

      </section>

      {/* FOOTER BAR */}
      <footer className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-app-zinc-text font-semibold uppercase tracking-wider border-t border-app-border/60 pt-6 font-mono select-none">
        <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2">
          <span className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-app-emerald rounded-full opacity-60"></span>
            <span>INDEX ENGINE: CHAMELEON-V3.5</span>
          </span>
          <span>LATENCY COMPLIANCE: OK</span>
          <span>SYNC BLOCK: #2,491,314</span>
        </div>
        <div className="flex space-x-6">
          <span className="hover:text-app-fg transition-colors">Protocol: Mantle-v2.5</span>
          <span className="hover:text-app-fg transition-colors">Compliance: Audited</span>
          <span className="text-app-emerald/40 font-bold">©2026 Chameleon Labs</span>
        </div>
      </footer>
    </div>
  );
}
