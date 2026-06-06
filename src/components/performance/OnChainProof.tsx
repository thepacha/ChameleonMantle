'use client';

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ON_CHAIN_WRITES, CONTRACT_ADDRESS, MANTLESCAN_URL, MANTLESCAN_TX_PREFIX } from './mockData';

export function OnChainProof({ isDark }: { isDark: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mainColor = isDark ? "#00ff88" : "#00aa5a";

  return (
    <div className={cn(
      "p-8 border-b",
      isDark ? "border-[#1c1c1c] bg-[#090909]" : "border-[#e5e7eb] bg-white"
    )} id="performance-on-chain-proof">
      
      {/* Heavy green left-accented summary block */}
      <div 
        className={cn(
          "border border-l-4",
          isDark 
            ? "border-[#1c1c1c] border-l-[#00ff88] bg-[#0c0c0c] p-6 md:p-8" 
            : "border-[#e5e7eb] border-l-[#00aa5a] bg-slate-50 p-6 md:p-8"
        )}
        id="on-chain-integrity-card"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className={cn(
              "text-[14px] md:text-[16px] uppercase font-bold tracking-wider flex items-center gap-2",
              isDark ? "text-white" : "text-slate-900"
            )}>
              <span className={cn("w-2.5 h-2.5 rounded-full", isDark ? "bg-[#00ff88]" : "bg-[#00aa5a]")}></span>
              Every signal is permanently recorded on Mantle
            </h2>
            <p className={cn(
              "text-[12px] font-mono mt-1 leading-relaxed max-w-3xl",
              isDark ? "text-[#a0a0a0]" : "text-slate-600"
            )}>
              All intelligence cycles produced by the Chameleon engine are permanently and cryptographically bound to the blockchain. Data cannot be altered retroactively. All signal history is immutable and publicly verifiable on the Mantle Network ledger.
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-1.5 font-mono text-right max-md:text-left">
            <span className="text-[10px] text-[#666] uppercase font-bold">Network Integration</span>
            <span className={cn("text-[12px] font-bold", isDark ? "text-[#00ff88]" : "text-[#00aa5a]")}>MANTLE MAINNET</span>
          </div>
        </div>

        {/* Audit Write Ledger Block */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold font-mono text-[#666] tracking-wider">
              Recent On-Chain Activity Ledger (Last 10 Records)
            </span>
            <span className={cn(
              "text-[9px] border font-mono px-2 py-0.5 rounded-sm",
              isDark ? "bg-[#111] border-[#1b1b1b] text-[#a0a0a0]" : "bg-white border-[#e5e7eb] text-slate-600"
            )}>
              Polling Block: 12,430,852
            </span>
          </div>

          <div className={cn(
            "border overflow-x-auto",
            isDark ? "border-[#161616] bg-black/40" : "border-[#e5e7eb] bg-white shadow-xs"
          )}>
            <table className="w-full min-w-[700px] text-left border-collapse text-xs font-mono">
              <thead>
                <tr className={cn(
                  "border-b text-[9px] font-bold uppercase",
                  isDark ? "border-[#161616] bg-[#0d0d0d] text-[#666]" : "border-[#e5e7eb] bg-slate-100 text-slate-500"
                )}>
                  <th className="py-2.5 px-3 w-[12%]">Time</th>
                  <th className="py-2.5 px-3 w-[18%]">Function Invoked</th>
                  <th className="py-2.5 px-3 w-[45%]">Payload Summary</th>
                  <th className="py-2.5 px-3 w-[10%]">Block</th>
                  <th className="py-2.5 px-3 w-[15%] text-right">Transaction Hash</th>
                </tr>
              </thead>
              <tbody>
                {ON_CHAIN_WRITES.map((write, idx) => {
                  const isSignal = write.functionCalled === 'storeSignal';
                  const isDna = write.functionCalled === 'storeWalletDNA';
                  const isNarr = write.functionCalled === 'storeNarrative';

                  const badgeClass = isSignal 
                    ? (isDark ? 'text-[#00ff88] border-[#00ff88]/20 bg-[#00ff88]/5' : 'text-[#008844] border-[#00aa5a]/20 bg-[#00aa5a]/5')
                    : isDna
                    ? 'text-purple-600 dark:text-purple-400 border-purple-500/20 bg-purple-500/5'
                    : isNarr
                    ? 'text-amber-600 dark:text-amber-400 border-amber-500/20 bg-amber-500/5'
                    : 'text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/5';

                  return (
                    <tr 
                      key={idx} 
                      className={cn(
                        "border-b transition-colors",
                        isDark 
                          ? "border-[#141414] hover:bg-black/60" 
                          : "border-[#f3f4f6] hover:bg-slate-50 bg-white"
                      )}
                    >
                      <td className="py-3 px-3 text-[#666]" title={write.timestamp}>
                        {write.relativeTime}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-1.5 py-0.5 border text-[9px] font-bold rounded-xs leading-none ${badgeClass}`}>
                          {write.functionCalled}
                        </span>
                      </td>
                      <td className={cn("py-3 px-3 max-w-[300px] truncate", isDark ? "text-white" : "text-slate-800")} title={write.dataSummary}>
                        {write.dataSummary}
                      </td>
                      <td className="py-3 px-3 text-[#a0a0a0]">
                        {write.blockNumber.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <a
                          href={`${MANTLESCAN_TX_PREFIX}${write.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "transition-colors inline-flex items-center gap-1.5",
                            isDark ? "text-[#666] hover:text-[#00ff88]" : "text-slate-400 hover:text-[#00aa5a]"
                          )}
                        >
                          <span className="text-[10px]">
                            {write.txHash.slice(0, 6)}...{write.txHash.slice(-4)}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Footer copy-paste parameters address layout */}
        <div className={cn(
          "mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4",
          isDark ? "border-[#1a1a1a]" : "border-[#e5e7eb]"
        )}>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold font-mono text-[#666] tracking-wider shrink-0">
              Contract Address: 
            </span>
            <div className={cn(
              "flex items-center gap-2 border p-2 rounded-sm w-full sm:w-auto overflow-hidden",
              isDark ? "bg-[#080808] border-[#161616]" : "bg-white border-[#e5e7eb]"
            )}>
              <span className={cn(
                "font-mono text-[10px] md:text-[11px] font-bold select-all truncate",
                isDark ? "text-[#00ff88]" : "text-[#00aa5a]"
              )}>
                {CONTRACT_ADDRESS}
              </span>
              <button
                onClick={handleCopy}
                className="text-[#a0a0a0] hover:text-white transition-colors shrink-0"
                title="Copy Address to Clipboard"
              >
                {copied ? (
                  <span className={cn(
                    "text-[9px] uppercase font-semibold px-1 py-0.5 rounded-sm",
                    isDark ? "text-[#00ff88] bg-[#00ff88]/10" : "text-[#00aa5a] bg-[#00aa5a]/10"
                  )}>
                    Copied!
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
          
          <a
            href={MANTLESCAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "text-[11px] font-mono font-bold uppercase tracking-wider transition-all border px-4 py-2",
              isDark 
                ? "text-white hover:text-[#00ff88] border-[#1c1c1c] bg-[#121212] hover:bg-[#161616]" 
                : "text-slate-800 hover:text-[#00aa5a] border-[#e5e7eb] bg-white hover:bg-slate-50 shadow-xs"
            )}
          >
            Verify on Mantlescan →
          </a>
        </div>

      </div>
      
    </div>
  );
}
