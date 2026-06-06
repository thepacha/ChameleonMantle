export interface SignalType {
  id: string;
  name: string;
  accuracy: number;
  count: number;
}

export interface WalletDNAAccuracy {
  name: string;
  accuracy: number;
}

export interface MarketComparisonPoint {
  date: string;
  chameleon: number; // Cumulative return %
  mantle: number; // Cumulative return %
  isDivergencePoint?: boolean;
}

export interface SignalItem {
  id: string;
  timestamp: string; // ISO or relative
  relativeTime: string;
  type: 'Whale Accumulation' | 'Bridge Inflow' | 'LP Entry Detection' | 'Narrative Detection' | 'Anomaly Alert';
  wallet: string;
  walletDna: string;
  token: string;
  tokenLogo: string;
  confidence: number; // 0-100
  predicted: 'Bullish' | 'Bearish';
  actual: string; // e.g. "+8.4% (24h)" or "-1.2% (24h)"
  priceAtSignal: number;
  priceOutcome: number;
  pnl: number; // percentage
  status: 'Hit' | 'Miss' | 'Pending';
  txHash: string;
  blockNumber: number;
  aiExplanation: string;
  sparkline: number[]; // mini historical price points
}

export interface OnChainWrite {
  timestamp: string;
  relativeTime: string;
  functionCalled: 'storeSignal' | 'storeWalletDNA' | 'storeNarrative' | 'storeHealthScore';
  dataSummary: string;
  txHash: string;
  blockNumber: number;
}

// 1. SIGNAL TYPE DATA
export const SIGNAL_TYPES: SignalType[] = [
  { id: 'whale', name: 'Whale Accumulation', accuracy: 81, count: 1204 },
  { id: 'bridge', name: 'Bridge Inflow', accuracy: 76, count: 987 },
  { id: 'lp-entry', name: 'LP Entry Detection', accuracy: 73, count: 1156 },
  { id: 'narrative', name: 'Narrative Detection', accuracy: 69, count: 891 },
  { id: 'anomaly', name: 'Anomaly Alert', accuracy: 64, count: 574 },
];

// 2. WALLET DNA ACCURACY DATA
export const WALLET_DNA_ACCURACY: WalletDNAAccuracy[] = [
  { name: 'Early Trend Sniper', accuracy: 84 },
  { name: 'VC Accumulator', accuracy: 79 },
  { name: 'Governance Insider', accuracy: 72 },
  { name: 'Momentum Chaser', accuracy: 61 },
  { name: 'LP Farmer', accuracy: 58 },
];

// Contract specifications
export const CONTRACT_ADDRESS = '0x3aF829dce446d7cb49c81cba90818ae460a6f93e';
export const MANTLESCAN_URL = `https://explorer.mantle.xyz/address/${CONTRACT_ADDRESS}`;
export const MANTLESCAN_TX_PREFIX = 'https://explorer.mantle.xyz/tx/';

// 3. MARKET COMPARISON DATA (30 DAYS)
// Chameleon cumulative returns (+31.4%) vs MNT cumulative returns (+12.1%) over 30 days
export const MARKET_COMPARISON_DATA: MarketComparisonPoint[] = [
  { date: 'May 08', chameleon: 0.0, mantle: 0.0 },
  { date: 'May 09', chameleon: 0.8, mantle: -0.5 },
  { date: 'May 10', chameleon: 1.5, mantle: 0.2 },
  { date: 'May 11', chameleon: 2.1, mantle: 1.1 },
  { date: 'May 12', chameleon: 1.9, mantle: 0.8 },
  { date: 'May 13', chameleon: 3.2, mantle: 1.5 },
  { date: 'May 14', chameleon: 3.8, mantle: 2.1 },
  { date: 'May 15', chameleon: 4.5, mantle: 2.9, isDivergencePoint: true }, // "Signal system activated"
  { date: 'May 16', chameleon: 6.2, mantle: 3.4 },
  { date: 'May 17', chameleon: 7.9, mantle: 3.1 },
  { date: 'May 18', chameleon: 9.5, mantle: 4.0 },
  { date: 'May 19', chameleon: 11.2, mantle: 4.5 },
  { date: 'May 20', chameleon: 10.8, mantle: 3.9 },
  { date: 'May 21', chameleon: 12.5, mantle: 4.8 },
  { date: 'May 22', chameleon: 14.1, mantle: 5.6 },
  { date: 'May 23', chameleon: 15.8, mantle: 6.1 },
  { date: 'May 24', chameleon: 17.5, mantle: 6.8 },
  { date: 'May 25', chameleon: 19.3, mantle: 7.2 },
  { date: 'May 26', chameleon: 18.9, mantle: 6.9 },
  { date: 'May 27', chameleon: 20.4, mantle: 7.5 },
  { date: 'May 28', chameleon: 22.8, mantle: 8.4 },
  { date: 'May 29', chameleon: 24.1, mantle: 9.1 },
  { date: 'May 30', chameleon: 25.6, mantle: 9.8 },
  { date: 'May 31', chameleon: 26.2, mantle: 10.2 },
  { date: 'Jun 01', chameleon: 25.8, mantle: 9.7 },
  { date: 'Jun 02', chameleon: 27.5, mantle: 10.5 },
  { date: 'Jun 03', chameleon: 29.1, mantle: 11.1 },
  { date: 'Jun 04', chameleon: 28.7, mantle: 10.8 },
  { date: 'Jun 05', chameleon: 30.5, mantle: 11.5 },
  { date: 'Jun 06', chameleon: 31.4, mantle: 12.1 },
];

// Helper to generate a realistic mock database of signals
const TOKENS = [
  { symbol: 'MNT', logo: '', basePrice: 0.82 },
  { symbol: 'mETH', logo: '', basePrice: 3820 },
  { symbol: 'AGNI', logo: '', basePrice: 0.14 },
  { symbol: 'MOE', logo: '', basePrice: 0.28 },
  { symbol: 'INIT', logo: '', basePrice: 0.45 },
  { symbol: 'WMNT', logo: '', basePrice: 0.82 },
  { symbol: 'AIGPU', logo: '', basePrice: 0.05 },
];

const WALLETS = [
  { address: '0xabc14298cf085b42d76a5b78f4ea492eb9c24942', dna: 'Early Trend Sniper' },
  { address: '0x44f9cf2e21bbda7c2901977cf923984ca903bccc', dna: 'VC Accumulator' },
  { address: '0xdef8432ce9dca838bdf8811eef24177dd31c111a', dna: 'LP Farmer' },
  { address: '0xaa201bbbcca11e7a00ecfa2a912bcf4c0587a009', dna: 'Momentum Chaser' },
  { address: '0x19adfa43bb1cc20e9871fcceaa77b94109ca37b1', dna: 'Governance Insider' },
  { address: '0x88f293acc0811eef2a912bcf4c0587a00914298c', dna: 'Early Trend Sniper' },
  { address: '0x221bbda7ccd2901977cf923984caa301977cf923', dna: 'VC Accumulator' },
  { address: '0xf085b42d76a5b78f4ea492eb9c249420abc14298', dna: 'LP Farmer' },
];

const AI_EXPLANATIONS = {
  'Whale Accumulation': [
    'Substantial volume anomaly identified. Wallet classified as "VC Accumulator" initiated three split purchases totaling 450,000 $TOKEN within a 6-minute window. Previous tracking shows this entity has a 79% win-rate when building positions prior to major ecosystem shifts. AI model confidence stands high because of minimal secondary sell pressure & corresponding bridge inflows.',
    'A known insider wallet has increased their holdings of $TOKEN by 12% over the last 48 hours. This accumulation matches the wallet profile "Governance Insider", which previously successfully anticipated two Mantle governance proposal surges. Block routing was split across Merchant Moe to avoid localized price impact.',
  ],
  'Bridge Inflow': [
    'Cross-chain forensic trace triggers. A major bridging event of $1.2M USDT has arrived on Mantle from Ethereum mainnet. Within 90 seconds, these funds were allocated directly to custom farming contracts for $TOKEN. This represents a heavy net liqudity influx. Statistical models project minor supply contraction and bullish pressure.',
    'Bridge volume for $TOKEN is currently running at 4.2x standard deviation. Analysis of the deposition hashes reveals a highly coordinated deployment loop mapped to multiple "Momentum Chaser" wallets. Historical trends predict a strong momentum continuation.',
  ],
  'LP Entry Detection': [
    'Concentrated liquidity provision observed on Agni V3 pools. A high-efficiency LP address ("LP Farmer" profile) added $850,000 of liquidity in the narrow range of $MIN to $MAX. This specialized positioning suggests low-volatility accumulation expectations and highly concentrated buy-back support. Price action is forming a solid horizontal floor.',
    'Liquidity depth for $TOKEN surged by 34% inside the last 4h. The liquidity additions match the fingerprint of smart farming entities. This creates heavily cushioned downside support, reducing sell-slippage and clearing paths for bullish breakout action.',
  ],
  'Narrative Detection': [
    'AI-powered social and on-chain sentiment alignment achieved. Mentions of "$TOKEN" across key developer channels and on-chain activity inside the Mantle ecosystem have increased by 280%. On-chain clustering reveals 14 smart wallets shifted stablecoin allocations directly into $TOKEN within 24 hours, signaling institutional or ecosystem narrative shift.',
    'The "AI x GPU Cluster" narrative score has crested past its critical 90% threshold. $TOKEN serves as the primary utility vector on Mantle for this narrative. Multi-wallet clustering reveals smart snipers are steadily swapping defensive assets into this position.',
  ],
  'Anomaly Alert': [
    'Our volume z-score engine triggered an alert on $TOKEN after trade volume spiked to an unprecedented +5.2 SD in block #1a39f. Crucially, the buy-to-sell ratio is holding at 8.2:1. This is a clear indicator of institutional demand or unannounced private sales clearing order books.',
    'Unusual gas premium consumption detected: several smart frontrunners ("Early Trend Sniper" profile) spent up to 15 GWEI above the base fee to secure early fills on $TOKEN. Such aggressive transaction behavior is 94% correlated with immediate price adjustments.',
  ],
};

const TYPES: Array<'Whale Accumulation' | 'Bridge Inflow' | 'LP Entry Detection' | 'Narrative Detection' | 'Anomaly Alert'> = [
  'Whale Accumulation',
  'Bridge Inflow',
  'LP Entry Detection',
  'Narrative Detection',
  'Anomaly Alert',
];

// Seeded pseudo-random generator to ensure data is deterministic and internally consistent
function createRandom(seed: number) {
  return function() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateMockSignals(): SignalItem[] {
  const rand = createRandom(1337);
  const signals: SignalItem[] = [];

  // Generate around 150 highly structured signals for UI interaction, sorting, and pagination
  // (we state there are 4,812 signals in total for stats, and we paginate/serve these beautifully).
  const count = 150;
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const hoursAgo = Math.floor(i * 1.5) + 1;
    const signalDate = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    
    // Pick token
    const tokenIdx = Math.floor(rand() * TOKENS.length);
    const token = TOKENS[tokenIdx];

    // Pick type
    const typeIdx = Math.floor(rand() * TYPES.length);
    const type = TYPES[typeIdx];

    // Pick wallet
    const walletIdx = Math.floor(rand() * WALLETS.length);
    const walletObj = WALLETS[walletIdx];

    // Status logic: older are Hits or Misses based on historical accuracy. Newest are Pending.
    let status: 'Hit' | 'Miss' | 'Pending' = 'Hit';
    if (i < 5) {
      status = rand() > 0.4 ? 'Pending' : (rand() > 0.3 ? 'Hit' : 'Miss');
    } else {
      // Align status with actual signal type accuracy to make statistics consistent
      const targetAccuracy = SIGNAL_TYPES.find(t => t.name === type)?.accuracy || 70;
      status = (rand() * 100) < targetAccuracy ? 'Hit' : 'Miss';
    }

    // Confidence
    const baseConf = type === 'Whale Accumulation' ? 82 : (type === 'Bridge Inflow' ? 77 : (type === 'LP Entry Detection' ? 74 : (type === 'Narrative Detection' ? 70 : 62)));
    const confidence = Math.floor(baseConf + (rand() * 15) - 5);

    // Predicted
    const predicted = rand() > 0.2 ? 'Bullish' : 'Bearish';

    // Pricing & Outcome calculation
    const isHit = status === 'Hit';
    const isMiss = status === 'Miss';
    const isPending = status === 'Pending';

    let pnl = 0;
    if (isHit) {
      pnl = parseFloat((rand() * 32 + 4).toFixed(1)) * (predicted === 'Bullish' ? 1 : -1);
    } else if (isMiss) {
      pnl = parseFloat((rand() * 15 + 1).toFixed(1)) * (predicted === 'Bullish' ? -1 : 1);
    } else {
      pnl = parseFloat((rand() * 3 - 1.5).toFixed(1)); // small fluctuating pnl for pending
    }

    const priceAtSignal = token.basePrice;
    const priceOutcome = priceAtSignal * (1 + pnl / 100);

    const actualStr = isPending 
      ? 'Awaiting 24h close' 
      : `${pnl > 0 ? '+' : ''}${pnl.toFixed(1)}% (24h)`;

    // Tx Hash and Block number
    const txHash = '0x' + Array.from({length: 64}, () => Math.floor(rand()*16).toString(16)).join('');
    const blockNumber = 12431000 - i * 150 - Math.floor(rand() * 80);

    // Prompt template replacement
    const expTemplates = AI_EXPLANATIONS[type];
    const rawExp = expTemplates[Math.floor(rand() * expTemplates.length)];
    const aiExplanation = rawExp
      .replaceAll('$TOKEN', token.symbol)
      .replaceAll('$MIN', (token.basePrice * 0.95).toFixed(3))
      .replaceAll('$MAX', (token.basePrice * 1.05).toFixed(3));

    // Sparkline data representing price performance around signal trigger
    const sparkline: number[] = [];
    let curPrice = priceAtSignal * 0.95;
    for (let k = 0; k < 12; k++) {
      if (k === 5) {
        curPrice = priceAtSignal; // exact trigger point
      } else {
        const step = isHit ? (k > 5 ? 1.02 : 1.0) : (k > 5 ? 0.98 : 1.0);
        curPrice *= step + (rand() * 0.04 - 0.02);
      }
      sparkline.push(curPrice);
    }

    // Relative time builder
    let relativeTime = `${hoursAgo}h ago`;
    if (hoursAgo < 1) {
      relativeTime = '42m ago';
    } else if (hoursAgo >= 24) {
      const days = Math.floor(hoursAgo / 24);
      relativeTime = `${days}d ago`;
    }

    signals.push({
      id: `SIG-${10000 - i}`,
      timestamp: signalDate.toISOString(),
      relativeTime,
      type,
      wallet: walletObj.address,
      walletDna: walletObj.dna,
      token: token.symbol,
      tokenLogo: token.logo,
      confidence,
      predicted,
      actual: actualStr,
      priceAtSignal,
      priceOutcome,
      pnl,
      status,
      txHash,
      blockNumber,
      aiExplanation,
      sparkline,
    });
  }

  return signals;
}

// Generate the 10 on-chain writes logs
export const ON_CHAIN_WRITES: OnChainWrite[] = [
  {
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    relativeTime: '2m ago',
    functionCalled: 'storeSignal',
    dataSummary: 'SIG-9850 · MNT · Whale Accumulation · CONF 87%',
    txHash: '0x94f1c93ebca20211fcca9723a1009dbcccff8429ca903b29ab78f4a1bbdcd8542',
    blockNumber: 12430852,
  },
  {
    timestamp: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
    relativeTime: '17m ago',
    functionCalled: 'storeWalletDNA',
    dataSummary: 'ADDR: 0xabc14298cf085b42d... · NEW PROFILE: Early Trend Sniper',
    txHash: '0x5ca719c288922bf88ffd293acc05ca7b94109ca37b1cc20e9871fca492eb9c2c',
    blockNumber: 12430790,
  },
  {
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    relativeTime: '42m ago',
    functionCalled: 'storeNarrative',
    dataSummary: 'NEW TREND: "AI x GPU Cluster" · CONFIDENCE SCORE: 91.2%',
    txHash: '0x6a2ef843bbfed293922bf88ffd293acc05ca7b94109ca37b1cc20e9871fca492',
    blockNumber: 12430630,
  },
  {
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    relativeTime: '1h ago',
    functionCalled: 'storeHealthScore',
    dataSummary: 'SYSTEM HEALTH UPDATE: 74.2% ACCURACY · SAMPLE_SIZE 4,812',
    txHash: '0x3cbfa432ebdf88bdeca4492ccca1ce9dca838bdf8811eef24177dd31c111a938',
    blockNumber: 12430510,
  },
  {
    timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    relativeTime: '1h ago',
    functionCalled: 'storeSignal',
    dataSummary: 'SIG-9849 · mETH · LP Entry Detection · CONF 79%',
    txHash: '0xca9031ca371cc2c983b290bcccff8429ca903b29ab78f4a1bbdcd8542ff23bdf',
    blockNumber: 12430342,
  },
  {
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    relativeTime: '2h ago',
    functionCalled: 'storeSignal',
    dataSummary: 'SIG-9848 · AGNI · Anomaly Alert · CONF 65%',
    txHash: '0x88cba90818ae460f93e98ccff8422aa77b9410ca37b15ca7c2c983b29cba5022',
    blockNumber: 12430211,
  },
  {
    timestamp: new Date(Date.now() - 170 * 60 * 1000).toISOString(),
    relativeTime: '2h ago',
    functionCalled: 'storeWalletDNA',
    dataSummary: 'ADDR: 0x44f9cf2e21bbda7c29... · PROF RECORD: VC Accumulator',
    txHash: '0x2bf9cf923984ca903bcccffd109ca37b1cc20e9871fccda15cca15cfa99026da',
    blockNumber: 12430030,
  },
  {
    timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    relativeTime: '3h ago',
    functionCalled: 'storeSignal',
    dataSummary: 'SIG-9847 · MOE · Bridge Inflow · CONF 83%',
    txHash: '0xffee8432ce9dca838bdf8811eef24177dd31c111a9cf085b42d76a5b78f4ea49',
    blockNumber: 12429810,
  },
  {
    timestamp: new Date(Date.now() - 250 * 60 * 1000).toISOString(),
    relativeTime: '4h ago',
    functionCalled: 'storeNarrative',
    dataSummary: 'NEW TREND: "LP Yield Rotation" · CONFIDENCE SCORE: 76.8%',
    txHash: '0xab201bbbccaccfb109cc28a912bcf4e0587a009cccffbd292ee88ffcd928810c',
    blockNumber: 12429604,
  },
  {
    timestamp: new Date(Date.now() - 310 * 60 * 1000).toISOString(),
    relativeTime: '5h ago',
    functionCalled: 'storeSignal',
    dataSummary: 'SIG-9846 · INIT · Narrative Detection · CONF 73%',
    txHash: '0x1de19adfa43bb1cc20e9871fcceaa77b94109ca37b1eecc241aa7e0ad1bc6e32',
    blockNumber: 12429412,
  },
];
