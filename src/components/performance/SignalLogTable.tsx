'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Copy, Check, ExternalLink, Filter, HelpCircle, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { generateMockSignals, SignalItem, MANTLESCAN_TX_PREFIX } from './mockData';

// Mini Price Sparkline Renderer
function Sparkline({ data, isPositive, isDark }: { data: number[]; isPositive: boolean; isDark: boolean }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 140;
  const height = 30;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isPositive ? (isDark ? '#00ff88' : '#00aa5a') : '#ff6b35';

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 border",
      isDark ? "bg-[#060606] border-[#161616]" : "bg-white border-[#e5e7eb]"
    )}>
      <svg width={width} height={height} className="overflow-visible">
        <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" points={points} />
      </svg>
    </div>
  );
}

export function SignalLogTable({ isDark }: { isDark: boolean }) {
  // Generate stable mock signals on component mount
  const allSignals = useMemo(() => generateMockSignals(), []);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState('ALL');

  // Interactive copy confirmation helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Expanded Rows State
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Reset page when filter changes
  const resetPagination = () => setCurrentPage(1);

  // Apply search and filter criteria
  const filteredSignals = useMemo(() => {
    return allSignals.filter((signal) => {
      // 1. Search Query
      const searchLower = search.toLowerCase();
      const matchesSearch =
        signal.wallet.toLowerCase().includes(searchLower) ||
        signal.token.toLowerCase().includes(searchLower) ||
        signal.type.toLowerCase().includes(searchLower);

      // 2. Type Filter
      const matchesType = selectedType === 'ALL' || signal.type === selectedType;

      // 3. Status Filter
      const matchesStatus = selectedStatus === 'ALL' || signal.status === selectedStatus;

      // 4. Confidence Filter
      let matchesConfidence = true;
      if (selectedConfidence === 'HIGH') {
        matchesConfidence = signal.confidence >= 75;
      } else if (selectedConfidence === 'MID') {
        matchesConfidence = signal.confidence >= 50 && signal.confidence < 75;
      } else if (selectedConfidence === 'LOW') {
        matchesConfidence = signal.confidence < 50;
      }

      return matchesSearch && matchesType && matchesStatus && matchesConfidence;
    });
  }, [allSignals, search, selectedType, selectedStatus, selectedConfidence]);

  // Paginated Results
  const totalItems = filteredSignals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedSignals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSignals.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSignals, currentPage]);

  return (
    <div className={cn(
      "p-8 border-b",
      isDark ? "border-[#1c1c1c] bg-[#0a0a0a]" : "border-[#e5e7eb] bg-white"
    )} id="performance-signal-ledger-section">
      <div className="mb-6">
        <h2 className={cn(
          "text-[14px] uppercase font-bold tracking-widest",
          isDark ? "text-white" : "text-slate-900"
        )}>
          Signals Log Ledger
        </h2>
        <p className={cn(
          "text-[11px] font-mono mt-1",
          isDark ? "text-[#a0a0a0]" : "text-slate-600"
        )}>
          Historical record of all signals fired. Filter, expand, and examine cryptographic proof points. This dataset contains 4,812 historic validations.
        </p>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-6" id="ledger-filters-bar">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666]">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            className={cn(
              "w-full border pl-9 pr-4 py-2.5 text-xs font-mono placeholder-[#666] focus:outline-none focus:border-[#00ff88]",
              isDark 
                ? "bg-[#0d0d0d] border-[#1c1c1c] text-white" 
                : "bg-[#f9fafb] border-[#e5e7eb] text-slate-900 placeholder-slate-400 focus:border-[#00aa5a]"
            )}
            placeholder="Search wallet address or token..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPagination();
            }}
          />
        </div>

        {/* Signal Type Filter */}
        <div className="md:col-span-3">
          <select
            className={cn(
              "w-full border px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00ff88]",
              isDark 
                ? "bg-[#0d0d0d] border-[#1c1c1c] text-[#a0a0a0]" 
                : "bg-[#f9fafb] border-[#e5e7eb] text-slate-800 focus:border-[#00aa5a]"
            )}
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              resetPagination();
            }}
          >
            <option value="ALL">ALL SIGNAL TYPES </option>
            <option value="Whale Accumulation">Whale Accumulation</option>
            <option value="Bridge Inflow">Bridge Inflow</option>
            <option value="LP Entry Detection">LP Entry Detection</option>
            <option value="Narrative Detection">Narrative Detection</option>
            <option value="Anomaly Alert">Anomaly Alert</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-2.5">
          <select
            className={cn(
              "w-full border px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00ff88]",
              isDark 
                ? "bg-[#0d0d0d] border-[#1c1c1c] text-[#a0a0a0]" 
                : "bg-[#f9fafb] border-[#e5e7eb] text-slate-800 focus:border-[#00aa5a]"
            )}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              resetPagination();
            }}
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="Hit">Hit</option>
            <option value="Miss">Miss</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Confidence Filter */}
        <div className="md:col-span-2.5">
          <select
            className={cn(
              "w-full border px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-[#00ff88]",
              isDark 
                ? "bg-[#0d0d0d] border-[#1c1c1c] text-[#a0a0a0]" 
                : "bg-[#f9fafb] border-[#e5e7eb] text-slate-800 focus:border-[#00aa5a]"
            )}
            value={selectedConfidence}
            onChange={(e) => {
              setSelectedConfidence(e.target.value);
              resetPagination();
            }}
          >
            <option value="ALL">ALL CONFIDENCES</option>
            <option value="HIGH">High ( &gt; 75%)</option>
            <option value="MID">Medium (50% - 75%)</option>
            <option value="LOW">Low ( &lt; 50%)</option>
          </select>
        </div>
      </div>

      {/* DENSE DATA TABLE */}
      <div className={cn(
        "border overflow-x-auto",
        isDark ? "border-[#1c1c1c] bg-[#0c0c0c]" : "border-[#e5e7eb] bg-white shadow-xs"
      )} id="ledger-table-container">
        <table className="w-full min-w-[1000px] text-left border-collapse font-mono" id="ledger-data-table">
          <thead>
            <tr className={cn(
              "border-b text-[10px] uppercase font-bold tracking-tight select-none",
              isDark ? "border-[#1c1c1c] bg-[#0d0d0d] text-[#666]" : "border-[#e5e7eb] bg-[#f9fafb] text-slate-500"
            )}>
              <th className="py-3 px-4 w-[5%]">ID</th>
              <th className="py-3 px-4 w-[10%]">Time</th>
              <th className="py-3 px-4 w-[18%]">Type</th>
              <th className="py-3 px-4 w-[15%]">Wallet Address</th>
              <th className="py-3 px-4 w-[8%]">Token</th>
              <th className="py-3 px-4 w-[10%]">Confidence</th>
              <th className="py-3 px-3 w-[8%]">Predicted</th>
              <th className="py-3 px-3 w-[12%]">Actual Status</th>
              <th className="py-3 px-4 w-[8%]">PnL</th>
              <th className="py-3 px-4 w-[6%] text-center">On-Chain Tx</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {paginatedSignals.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#666] text-xs">
                  No signals found matching the active filter criteria. Click reset to clear.
                </td>
              </tr>
            ) : (
              paginatedSignals.map((signal) => {
                const isExpanded = !!expandedRows[signal.id];

                // Badge colors matching requested types
                const typeBadgeClass =
                  signal.type === 'Whale Accumulation'
                    ? 'text-purple-400 border-purple-950 bg-purple-950/20'
                    : signal.type === 'Bridge Inflow'
                    ? 'text-blue-400 border-blue-950 bg-blue-950/20'
                    : signal.type === 'LP Entry Detection'
                    ? 'text-teal-400 border-teal-950 bg-teal-950/20'
                    : signal.type === 'Narrative Detection'
                    ? 'text-amber-400 border-amber-950 bg-amber-950/20'
                    : 'text-rose-400 border-rose-950 bg-rose-950/20';

                // Confidence color bar logic
                const confidenceColor =
                  signal.confidence >= 75
                    ? (isDark ? 'bg-[#00ff88]' : 'bg-[#00aa5a]')
                    : signal.confidence >= 50
                    ? 'bg-[#ffeb3b]'
                    : 'bg-[#ff3b3b]';

                // Status layout styling (NO EMOJIS)
                const statusBadge =
                  signal.status === 'Hit' ? (
                    <span className={isDark ? "text-[#00ff88] font-bold" : "text-[#00aa5a] font-bold"}>Hit</span>
                  ) : signal.status === 'Miss' ? (
                    <span className="text-[#ff6b35] font-bold">Miss</span>
                  ) : (
                    <span className="text-[#666]">Pending</span>
                  );

                // PnL green/red
                const pnlClass =
                  signal.status === 'Pending'
                    ? 'text-[#666]'
                    : signal.pnl > 0
                    ? (isDark ? 'text-[#00ff88] font-bold' : 'text-[#00aa5a] font-bold')
                    : 'text-[#ff6b35]';

                const pnlLabel =
                  signal.status === 'Pending'
                    ? '—'
                    : `${signal.pnl > 0 ? '+' : ''}${signal.pnl.toFixed(1)}%`;

                return (
                  <React.Fragment key={signal.id}>
                    {/* Primary Row */}
                    <tr
                      onClick={() => toggleRow(signal.id)}
                      className={cn(
                        "border-b transition-colors cursor-pointer select-none",
                        isDark 
                          ? "border-[#141414] hover:bg-[#111] bg-transparent" 
                          : "border-[#f3f4f6] hover:bg-[#f9fafb] bg-white",
                        isExpanded && (isDark ? 'bg-[#121212]' : 'bg-slate-50')
                      )}
                      id={`ledger-row-${signal.id}`}
                    >
                      <td className="py-4 px-4 text-[#666] font-mono text-[11px]">
                        {signal.id}
                      </td>
                      <td className={cn("py-4 px-4", isDark ? "text-[#a0a0a0]" : "text-slate-600")} title={signal.timestamp}>
                        {signal.relativeTime}
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn("px-2 py-1 text-[10px] uppercase font-bold border border-opacity-30 rounded-sm leading-none tracking-tight", typeBadgeClass)}>
                          {signal.type}
                        </span>
                      </td>
                      <td className={cn("py-4 px-4 flex items-center justify-between group max-w-[200px]", isDark ? "text-[#a0a0a0]" : "text-slate-600")}>
                        <span className="font-mono truncate select-all">
                          {signal.wallet.slice(0, 6)}...{signal.wallet.slice(-8)}
                        </span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleCopy(e, signal.wallet, signal.id)}
                            className="hover:text-white transition-colors"
                            title="Copy Wallet Address"
                          >
                            {copiedId === signal.id ? (
                              <Check className={cn("w-3 h-3", isDark ? "text-[#00ff88]" : "text-[#00aa5a]")} />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn("flex items-center gap-1.5 font-bold", isDark ? "text-white" : "text-slate-900")}>
                          {signal.tokenLogo && <span>{signal.tokenLogo}</span>}
                          <span>{signal.token}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-12 h-1.5 rounded-full overflow-hidden border relative",
                            isDark ? "bg-[#121212] border-[#202020]" : "bg-slate-100 border-slate-200"
                          )}>
                            <div
                              className={`h-full ${confidenceColor}`}
                              style={{ width: `${signal.confidence}%` }}
                            />
                          </div>
                          <span className={cn("font-bold text-[11px]", isDark ? "text-white" : "text-slate-900")}>
                            {signal.confidence}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span
                          className={`flex items-center gap-1 font-bold ${
                            signal.predicted === 'Bullish' 
                              ? (isDark ? 'text-[#00ff88]' : 'text-[#00aa5a]') 
                              : 'text-[#ff6b35]'
                          }`}
                        >
                          {signal.predicted === 'Bullish' ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>{signal.predicted}</span>
                        </span>
                      </td>
                      <td className={cn("py-4 px-3", isDark ? "text-[#a0a0a0]" : "text-slate-600")}>{signal.actual}</td>
                      <td className="py-4 px-4 font-mono">{statusBadge}</td>
                      <td className="py-4 px-4 text-center">
                        <a
                          href={`${MANTLESCAN_TX_PREFIX}${signal.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center text-[#666] hover:text-[#00ff88] transition-colors"
                          title="Open Mantlescan Tx View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>

                    {/* Expandable Info Panel Row on click */}
                    {isExpanded && (
                      <tr className={isDark ? "bg-[#0b0b0b] border-b border-[#1c1c1c] text-[#a0a0a0]" : "bg-[#f9fafb] border-b border-[#e5e7eb] text-slate-700"}>
                        <td colSpan={10} className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Claude/AI generated reasoning summary description */}
                            <div className="lg:col-span-6 flex flex-col gap-2">
                              <span className={cn(
                                "text-[10px] font-mono font-bold uppercase tracking-wider",
                                isDark ? "text-[#00ff88]" : "text-[#00aa5a]"
                              )}>
                                Smart Model Signal Intelligence (Saved Payload)
                              </span>
                              <div className={cn(
                                "border p-4 font-sans text-xs leading-relaxed relative",
                                isDark 
                                  ? "bg-black/60 border-[#191919] text-[#dcdcdc]" 
                                  : "bg-white border-[#e5e7eb] text-slate-800"
                              )}>
                                <div className="absolute right-3 top-3 text-[10px] font-mono text-[#666]">
                                  CHAML-AI v3.2
                                </div>
                                <p className="italic">{signal.aiExplanation}</p>
                              </div>
                            </div>

                            {/* Wallet profile DNA characteristics */}
                            <div className="lg:col-span-3 flex flex-col gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666]">
                                Trigger Wallet DNA profile
                              </span>
                              <div className={cn(
                                "border p-4 h-full flex flex-col justify-between",
                                isDark 
                                  ? "bg-black/40 border-[#191919]" 
                                  : "bg-white border-[#e5e7eb]"
                              )}>
                                <div>
                                  <span className={cn("font-bold block text-sm", isDark ? "text-white" : "text-slate-900")}>
                                    {signal.walletDna}
                                  </span>
                                  <span className={cn(
                                    "text-[10px] font-mono uppercase font-black block mt-1 tracking-wider",
                                    isDark ? "text-[#00ff88]" : "text-[#00aa5a]"
                                  )}>
                                    VERIFIABLE ALIGNMENT: OK
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#666] font-mono mt-4 leading-relaxed">
                                  This segment displays custom trade attributes aligned to past cluster signatures matching: block size, trade velocity, and dex selection constraints.
                                </p>
                              </div>
                            </div>

                            {/* Token Price Outcome chart (Sparkline) */}
                            <div className="lg:col-span-3 flex flex-col gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666]">
                                Outcome Sparkline Performance
                              </span>
                              <div className={cn(
                                "border p-4 flex flex-col justify-between h-full",
                                isDark 
                                  ? "bg-black/40 border-[#191919]" 
                                  : "bg-white border-[#e5e7eb]"
                              )}>
                                <div className="flex justify-between items-baseline mb-2">
                                  <span className="text-[10px] text-[#666]">Trigger At:</span>
                                  <span className={cn("font-black text-xs font-mono", isDark ? "text-white" : "text-slate-900")}>
                                    ${signal.priceAtSignal.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                  </span>
                                </div>
                                
                                <div className="flex-grow flex items-center justify-center my-2">
                                  <Sparkline data={signal.sparkline} isPositive={signal.pnl > 0} isDark={isDark} />
                                </div>

                                <div className={cn(
                                  "flex justify-between items-baseline mt-2 pt-2 border-t",
                                  isDark ? "border-[#141414]" : "border-slate-150"
                                )}>
                                  <span className="text-[10px] text-[#666]">Target/Latest:</span>
                                  <span className={cn("font-black text-sm font-mono", pnlClass)}>
                                    {pnlLabel}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-xs font-mono text-[#666]">
        <div>
          Showing <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
          <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{Math.min(totalItems, currentPage * itemsPerPage)}</span> of{' '}
          <span className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{totalItems}</span> filtered signals{' '}
          <span className="text-[#666]">(Database overall matches: 4,812)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={cn(
              "px-4 py-2 border transition-colors cursor-pointer disabled:cursor-not-allowed uppercase text-[10px] font-bold",
              isDark 
                ? "bg-[#0c0c0c] border-[#1c1c1c] text-[#a0a0a0] hover:text-white hover:bg-[#121212] disabled:opacity-40 disabled:hover:bg-[#0c0c0c] disabled:hover:text-[#a0a0a0]" 
                : "bg-white border-[#e5e7eb] text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            )}
          >
            Previous
          </button>
          <span className={isDark ? "text-white" : "text-slate-900"}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "px-4 py-2 border transition-colors cursor-pointer disabled:cursor-not-allowed uppercase text-[10px] font-bold",
              isDark 
                ? "bg-[#0c0c0c] border-[#1c1c1c] text-[#a0a0a0] hover:text-white hover:bg-[#121212] disabled:opacity-40 disabled:hover:bg-[#0c0c0c] disabled:hover:text-[#a0a0a0]" 
                : "bg-white border-[#e5e7eb] text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
