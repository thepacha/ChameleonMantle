'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { cn } from '@/src/lib/utils';
import { MARKET_COMPARISON_DATA } from './mockData';

export function MarketComparison({ isDark }: { isDark: boolean }) {
  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={cn(
          "border p-4 text-xs font-mono shadow-md",
          isDark ? "bg-[#0c0c0c] border-[#1c1c1c] text-white" : "bg-white border-[#e5e7eb] text-slate-900"
        )}>
          <p className={cn(
            "font-bold border-b pb-1.5 mb-1.5 uppercase",
            isDark ? "border-[#1c1c1c] text-[#a0a0a0]" : "border-[#e5e7eb] text-slate-500"
          )}>
            {label}
          </p>
          <div className="space-y-1">
            <p className="flex justify-between gap-6">
              <span className={isDark ? "text-[#00ff88]" : "text-[#00aa5a]"}>Chameleon Alpha:</span>
              <span className="font-black">+{payload[0].value.toFixed(1)}%</span>
            </p>
            {payload[1] && (
              <p className="flex justify-between gap-6">
                <span className={isDark ? "text-[#a0a0a0]" : "text-slate-500"}>Mantle (MNT):</span>
                <span className="font-black">+{payload[1].value.toFixed(1)}%</span>
              </p>
            )}
            {payload[0] && payload[1] && (
              <p className={cn(
                "flex justify-between gap-6 mt-1.5 pt-1.5 border-t text-[#ff6b35]",
                isDark ? "border-[#1c1c1c]" : "border-[#e5e7eb]"
              )}>
                <span>Alpha Margin:</span>
                <span className="font-black">+{(payload[0].value - payload[1].value).toFixed(1)}%</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const mainColor = isDark ? "#00ff88" : "#00aa5a";
  const benchmarkColor = isDark ? "#666666" : "#71717a";
  const axisColor = isDark ? "#1c1c1c" : "#e5e7eb";
  const tickColor = isDark ? "#a0a0a0" : "#4b5563";
  const gridColor = isDark ? "#141414" : "#f3f4f6";

  return (
    <div className={cn(
      "p-8 border-b",
      isDark ? "border-[#1c1c1c] bg-[#0a0a0a]" : "border-[#e5e7eb] bg-white"
    )} id="performance-market-comparison">
      <div className="mb-6 flex flex-col md:flex-row md:items-baseline justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#666] font-mono block">
            Ecosystem benchmarking
          </span>
          <h2 className={cn("text-[14px] uppercase font-bold tracking-wider mt-1", isDark ? "text-white" : "text-slate-900")}>
            30-Day Cumulative Return Outperformance
          </h2>
          <p className={cn("text-[11px] font-mono mt-1", isDark ? "text-[#a0a0a0]" : "text-slate-500")}>
            Chameleon Signal Index performance tracked vs Mantle native asset benchmark (MNT).
          </p>
        </div>
        <div className="text-xs font-mono text-[#666]">
          Sample window: May 08 - Jun 06
        </div>
      </div>

      <div className="w-full h-[320px] min-h-[300px] mb-6" id="comparison-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={MARKET_COMPARISON_DATA}
            margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="chameleonAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mainColor} stopOpacity={0.08} />
                <stop offset="100%" stopColor={mainColor} stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} strokeOpacity={1} />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: axisColor }}
              tickLine={{ stroke: axisColor }}
              tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace' }}
            />
            <YAxis
              axisLine={{ stroke: axisColor }}
              tickLine={{ stroke: axisColor }}
              tickFormatter={(v) => `+${v}%`}
              tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace' }}
            />
            <Tooltip content={<CustomTooltipContent />} />
            
            <Legend
              verticalAlign="top"
              align="right"
              iconSize={8}
              iconType="square"
              wrapperStyle={{
                fontSize: '11px',
                fontFamily: 'monospace',
                paddingBottom: '16px',
              }}
            />

            <ReferenceLine
              x="May 15"
              stroke="#ff6b35"
              strokeDasharray="4 4"
              label={{
                value: '← SYSTEM ACTIVATION',
                position: 'top',
                fill: '#ff6b35',
                fontSize: 9,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                offset: 5,
              }}
            />

            {/* MNT market line */}
            <Area
              name="Mantle Baseline (MNT)"
              type="monotone"
              dataKey="mantle"
              stroke={benchmarkColor}
              strokeWidth={1.5}
              fill="none"
              dot={false}
              activeDot={{ r: 4, stroke: isDark ? '#000' : '#fff', strokeWidth: 1 }}
            />

            {/* Chameleon Signals Line */}
            <Area
              name="Chameleon Intelligence"
              type="monotone"
              dataKey="chameleon"
              stroke={mainColor}
              strokeWidth={2.5}
              fill="url(#chameleonAreaFill)"
              dot={false}
              activeDot={{ r: 5, stroke: isDark ? '#000' : '#fff', strokeWidth: 1.5, fill: mainColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Large callout summary block as specified */}
      <div className={cn(
        "border p-6 text-center",
        isDark ? "border-[#1c1c1c] bg-[#0c0c0c]" : "border-[#e5e7eb] bg-[#f9fafb]"
      )} id="outperformance-badge-callout">
        <p className={cn(
          "text-[14px] md:text-[18px] font-mono font-bold tracking-wide uppercase",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Chameleon signals returned <span className={cn("font-black underline underline-offset-4", isDark ? "text-[#00ff88] decoration-[#00ff88]" : "text-[#00aa5a] decoration-[#00aa5a]")}>+31.4%</span> vs MNT baseline of <span className="text-[#666] font-black">+12.1%</span> over 30 days
        </p>
      </div>

    </div>
  );
}
