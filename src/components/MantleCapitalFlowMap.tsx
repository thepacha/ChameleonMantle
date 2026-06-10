"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import * as d3 from 'd3';
import { cn } from '@/src/lib/utils';

export interface GraphNode extends d3.SimulationNodeDatum {
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

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number; // thickness multiplier
  asset: string;
  amount: string;
}

interface MantleCapitalFlowMapProps {
  nodesData: GraphNode[];
  linksData: GraphLink[];
  isDarkMode: boolean;
}

export function MantleCapitalFlowMap({ nodesData, linksData, isDarkMode }: MantleCapitalFlowMapProps) {
  const [copied, setCopied] = useState(false);
  const [activeNode, setActiveNode] = useState<GraphNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || 800;
    let height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Deep copy to prevent mutating incoming props in D3 simulation
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

    // Direct initialization of size attributes to ensure SVG is always sized even if observer is slow
    svg.attr('width', width).attr('height', height);

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
  }, [nodesData, linksData, isDarkMode]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
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
                <span className="text-[9px] font-mono bg-emerald-500/10 text-[#10B981] border border-[#10B981]/20 px-1.5 py-0.5 rounded uppercase mt-1 w-max font-bold font-sans">
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
  );
}
