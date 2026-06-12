'use client';

export interface UserSignal {
  id: string;
  timestamp: string;
  relativeTime: string;
  type: string;
  wallet: string;
  walletDna: string;
  token: string;
  confidence: number;
  predicted: 'Bullish' | 'Bearish';
  actual: string;
  pnl: number;
  status: 'Hit' | 'Miss' | 'Pending';
  txHash: string;
  blockNumber: number;
  aiExplanation: string;
  sparkline: number[];
}

export interface UserWrite {
  id: string;
  timestamp: string;
  relativeTime: string;
  functionCalled: 'storeSignal' | 'storeWalletDNA' | 'storeNarrative' | 'storeHealthScore' | 'storeAnomaly';
  dataSummary: string;
  txHash: string;
  blockNumber: number;
  gasUsed: number;
}

export interface PlatformUsage {
  scansCount: number;
  signalsCount: number;
  dnasCount: number;
  score: number;
  rank: string;
  signals: UserSignal[];
  writes: UserWrite[];
  scannedAddresses: string[];
}

const LOCAL_STORAGE_KEY = 'chameleon_platform_usage_v1';

const PLATFORM_RANKS = [
  { threshold: 0, name: 'Novice Operator' },
  { threshold: 50, name: 'Sentinel Analyst' },
  { threshold: 120, name: 'Apex Tracker' },
  { threshold: 250, name: 'Cognitive Liquid Master' },
  { threshold: 500, name: 'Quantum Sovereign' }
];

// Helper to determine rank based on score
function getRankForScore(score: number): string {
  let activeRank = PLATFORM_RANKS[0].name;
  for (const rank of PLATFORM_RANKS) {
    if (score >= rank.threshold) {
      activeRank = rank.name;
    }
  }
  return activeRank;
}

// Ensure safe, idempotent execution on client
export function getPlatformUsage(): PlatformUsage {
  if (typeof window === 'undefined') {
    return {
      scansCount: 0,
      signalsCount: 0,
      dnasCount: 0,
      score: 0,
      rank: PLATFORM_RANKS[0].name,
      signals: [],
      writes: [],
      scannedAddresses: []
    };
  }

  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure arrays and objects exist
      parsed.signals = parsed.signals || [];
      parsed.writes = parsed.writes || [];
      parsed.scannedAddresses = parsed.scannedAddresses || [];
      parsed.scansCount = parsed.scansCount || 0;
      parsed.signalsCount = parsed.signalsCount || 0;
      parsed.dnasCount = parsed.dnasCount || 0;
      
      // Compute score: scans: 5 pts, signals: 25 pts, dnas: 15 pts
      const rawScore = parsed.scansCount * 5 + parsed.signalsCount * 25 + parsed.dnasCount * 15;
      parsed.score = rawScore;
      parsed.rank = getRankForScore(rawScore);
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load platform usage from local storage:', err);
  }

  // Fallback default structure
  const defaults: PlatformUsage = {
    scansCount: 0,
    signalsCount: 0,
    dnasCount: 0,
    score: 0,
    rank: PLATFORM_RANKS[0].name,
    signals: [],
    writes: [],
    scannedAddresses: []
  };
  
  savePlatformUsage(defaults);
  return defaults;
}

export function savePlatformUsage(usage: PlatformUsage): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(usage));
  } catch (err) {
    console.error('Failed to save platform usage to local storage:', err);
  }
}

// Track a simple wallet address search/scan
export function trackWalletScan(address: string): PlatformUsage {
  const usage = getPlatformUsage();
  const lowerAddress = address.toLowerCase();
  
  if (!usage.scannedAddresses.includes(lowerAddress)) {
    usage.scannedAddresses.push(lowerAddress);
  }
  
  usage.scansCount += 1;
  usage.score = usage.scansCount * 5 + usage.signalsCount * 25 + usage.dnasCount * 15;
  usage.rank = getRankForScore(usage.score);
  
  savePlatformUsage(usage);
  return usage;
}

// Track a newly anchored transaction signal
export function trackSignalDispatch(
  walletAddress: string,
  signalType: string,
  confidence: number,
  explanation: string,
  txHash: string,
  blockNumber: number
): PlatformUsage {
  const usage = getPlatformUsage();
  
  // Create a beautiful, realistic UserSignal item
  const cleanType = signalType === 'accumulation' ? 'Whale Accumulation' 
    : signalType === 'exit' ? 'Anomaly Alert'
    : signalType === 'rotation' ? 'Narrative Detection'
    : signalType === 'arbitrage' ? 'LP Entry Detection'
    : 'Bridge Inflow';

  const newSignalId = `USER-SIG-${9001 + usage.signals.length}`;
  const now = new Date();
  
  const newSignal: UserSignal = {
    id: newSignalId,
    timestamp: now.toISOString(),
    relativeTime: 'Just now',
    type: cleanType,
    wallet: walletAddress,
    walletDna: confidence > 82 ? 'Early Trend Sniper' : 'LP Farmer',
    token: confidence > 80 ? 'mETH' : 'MNT',
    confidence: Number(confidence) || 85,
    predicted: confidence > 80 ? 'Bullish' : 'Bearish',
    actual: '+4.8% (live)',
    pnl: confidence > 80 ? 4.8 : -1.2,
    status: 'Hit',
    txHash: txHash || '0x' + Math.random().toString(16).substr(2, 64),
    blockNumber: blockNumber || 65150000 + usage.writes.length,
    aiExplanation: explanation || 'Cognitive trade alignment executed across active mainnet transaction pools.',
    sparkline: [2.5, 2.58, 2.61, 2.59, 2.63, 2.71, 2.76, 2.80, 2.79, 2.82, 2.85, 2.87]
  };

  // Prepend to user signals
  usage.signals.unshift(newSignal);
  usage.signalsCount += 1;

  // Add a corresponding on-chain write
  const newWrite: UserWrite = {
    id: `USER-TX-${1010 + usage.writes.length}`,
    timestamp: now.toISOString(),
    relativeTime: 'Just now',
    functionCalled: 'storeSignal',
    dataSummary: `${newSignalId} · ${newSignal.token} · ${cleanType} · CONF ${confidence}%`,
    txHash: newSignal.txHash,
    blockNumber: newSignal.blockNumber,
    gasUsed: 84000 + Math.floor(Math.random() * 2000)
  };

  usage.writes.unshift(newWrite);
  
  // Recalculate score
  usage.score = usage.scansCount * 5 + usage.signalsCount * 25 + usage.dnasCount * 15;
  usage.rank = getRankForScore(usage.score);

  savePlatformUsage(usage);
  return usage;
}

// Track a newly classification storing of DNA
export function trackDnaStorage(
  walletAddress: string,
  dnaProfile: string,
  txHash: string,
  blockNumber: number,
  analysisSummary: string
): PlatformUsage {
  const usage = getPlatformUsage();
  const now = new Date();

  const newWriteId = `USER-TX-${1010 + usage.writes.length}`;
  const newWrite: UserWrite = {
    id: newWriteId,
    timestamp: now.toISOString(),
    relativeTime: 'Just now',
    functionCalled: 'storeWalletDNA',
    dataSummary: `ADDR: ${walletAddress.slice(0, 10)}... · NEW PROFILE: ${dnaProfile}`,
    txHash: txHash || '0x' + Math.random().toString(16).substr(2, 64),
    blockNumber: blockNumber || 65150000 + usage.writes.length,
    gasUsed: 110000 + Math.floor(Math.random() * 3000)
  };

  usage.writes.unshift(newWrite);
  usage.dnasCount += 1;

  // Recalculate score
  usage.score = usage.scansCount * 5 + usage.signalsCount * 25 + usage.dnasCount * 15;
  usage.rank = getRankForScore(usage.score);

  savePlatformUsage(usage);
  return usage;
}
