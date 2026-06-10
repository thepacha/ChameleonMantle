"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Menu, X, ChevronDown, Calendar, Wallet } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  dateRangeText?: string;
}

export function Header({ isDarkMode, toggleTheme, dateRangeText = "01 Apr, 2026 - 12 Apr, 2026" }: HeaderProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Close dropdowns on route changes
  useEffect(() => {
    setMoreOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const mainNavItems = [
    { label: "Dashboard", href: "/" },
    { label: "Smart Money", href: "/dashboard" },
    { label: "Wallet DNA", href: "/dna" },
    { label: "Alpha Stats", href: "/stats" },
  ];

  const moreNavItems = [
    { label: "Alpha Replay", href: "/replay-v2" },
    { label: "Validation Center", href: "/performance" },
  ];

  const isMoreActive = moreNavItems.some(item => item.href === pathname);

  return (
    <>
      <header className="h-[64px] shrink-0 w-full bg-[var(--bg-base)] border-b border-[var(--border)] px-3 sm:px-6 md:px-8 flex items-center justify-between z-40 relative select-none">
        {/* LEFT - Brand & Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <div className="relative w-[110px] sm:w-[144px] h-8 sm:h-9 flex items-center justify-center">
              <img
                src="https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon.svg"
                alt="Chameleon Logo Bright"
                className="w-full h-full object-contain block dark:hidden"
                referrerPolicy="no-referrer"
              />
              <img
                src="https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon%20-%20BLACK%20BACKGROUND.svg"
                alt="Chameleon Logo Dark"
                className="w-full h-full object-contain hidden dark:block"
                referrerPolicy="no-referrer"
              />
            </div>
          </Link>
        </div>

        {/* CENTER - Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-[28px] h-full">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm h-full flex items-center transition-colors duration-150 py-1 font-sans",
                  isActive
                    ? "text-[var(--text-primary)] font-semibold"
                    : "text-[var(--app-muted)] font-normal hover:text-[var(--text-secondary)]"
                )}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#10B981]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* More Dropdown Target */}
          <div
            className="relative h-full flex items-center"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={cn(
                "text-sm h-full flex items-center gap-1 transition-colors duration-150 py-1 font-sans cursor-pointer",
                isMoreActive
                  ? "text-[var(--text-primary)] font-semibold"
                  : "text-[var(--app-muted)] font-normal hover:text-[var(--text-secondary)]"
              )}
            >
              <span>More</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-150", moreOpen && "rotate-180")} />
              {isMoreActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#10B981]" />
              )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-[calc(100%-8px)] w-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-2 z-20 flex flex-col gap-0.5"
                >
                  {moreNavItems.map((item) => {
                    const isSubActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center h-[36px] px-3 rounded-lg text-xs font-medium font-sans transition-colors",
                          isSubActive
                            ? "bg-emerald-500/10 text-[#10B981]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* RIGHT - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Status Pill (desktop only) */}
          <div className="hidden md:flex bg-[var(--bg-surface)] border border-[#10B981]/25 px-2.5 py-1.5 rounded-lg items-center space-x-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
            <span className="text-[9px] font-mono text-[#10B981] uppercase tracking-wider font-bold">MANTLE NETWORK OK</span>
          </div>

          {/* Connect Wallet Button */}
          <button
            onClick={() => setWalletConnected(!walletConnected)}
            className="bg-[#10B981] hover:brightness-[1.1] text-[#080B10] font-sans font-semibold rounded-lg px-2 sm:px-4 py-1.5 text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 sm:gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>
              {walletConnected ? (
                <>
                  <span className="hidden xs:inline">0x7bf...c32</span>
                  <span className="inline xs:hidden">0x7bf...</span>
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">Connect Wallet</span>
                  <span className="inline xs:hidden">Connect</span>
                </>
              )}
            </span>
          </button>

          {/* Mobile Menu trigger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[var(--bg-card)] border-r border-[var(--border)] p-5 z-50 md:hidden flex flex-col gap-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center hover:opacity-90 transition-opacity">
                  <div className="relative w-[110px] h-8 flex items-center justify-center">
                    <img
                      src="https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon.svg"
                      alt="Chameleon Logo Bright"
                      className="w-full h-full object-contain block dark:hidden"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      src="https://pub-3f89eefcccc34790a13b41ee21b7427f.r2.dev/cropped-Chameleon%20-%20BLACK%20BACKGROUND.svg"
                      alt="Chameleon Logo Dark"
                      className="w-full h-full object-contain hidden dark:block"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <div className="flex flex-col gap-4 overflow-y-auto flex-grow font-sans">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--app-muted)] px-3 mb-1">
                    Main Pages
                  </span>
                  {mainNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center h-10 px-3 rounded-lg text-sm font-semibold transition-all",
                          isActive
                            ? "bg-emerald-500/10 text-[#10B981]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1 border-t border-[var(--border)] pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--app-muted)] px-3 mb-1">
                    Other Terminals
                  </span>
                  {moreNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center h-10 px-3 rounded-lg text-sm font-semibold transition-all",
                          isActive
                            ? "bg-emerald-500/10 text-[#10B981]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Drawer Bottom Info */}
              <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-2.5">
                {/* Mobile Drawer Connect Wallet CTA */}
                <div className="flex flex-col gap-1.5 mb-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--app-muted)]">
                    Identity
                  </span>
                  <button
                    onClick={() => setWalletConnected(!walletConnected)}
                    className="w-full bg-[#10B981] hover:brightness-[1.1] text-[#080B10] font-sans font-semibold rounded-lg py-2 text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{walletConnected ? "0x7bf...c32 (Connected)" : "Connect Wallet"}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>Theme State</span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 bg-[var(--bg-surface)] border border-[var(--border)] rounded px-2.5 py-1 cursor-pointer"
                  >
                    {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
                    <span>{isDarkMode ? "Dark" : "Light"}</span>
                  </button>
                </div>
                <div className="flex bg-[var(--bg-surface)] border border-[#10B981]/25 px-2.5 py-1.5 rounded-lg items-center space-x-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-mono text-[#10B981] uppercase tracking-wider font-bold">MANTLE NETWORK OK</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
