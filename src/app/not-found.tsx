"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div id="not-found-page" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
      <div id="not-found-container" className="max-w-md flex flex-col items-center gap-6">
        <div id="not-found-icon-wrap" className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-pulse">
          <Compass id="not-found-icon" className="w-12 h-12 text-emerald-400" />
        </div>
        <div id="not-found-headers" className="flex flex-col gap-2">
          <h1 id="not-found-title" className="text-4xl font-extrabold tracking-tight">404</h1>
          <h2 id="not-found-subtitle" className="text-xl font-semibold text-neutral-300">Command Page Not Found</h2>
          <p id="not-found-desc" className="text-sm text-neutral-400 leading-relaxed">
            The requested coordinate or ledger endpoint inside the Chameleon Command Center is invalid or has been re-allocated.
          </p>
        </div>
        <Link
          id="not-found-home-btn"
          href="/"
          className="bg-emerald-500 text-neutral-950 font-bold px-6 py-2.5 rounded-full text-xs hover:bg-emerald-400 active:scale-95 transition-all w-full"
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}
