import { HistoricalSignal } from '../types';

export const HISTORICAL_SIGNALS: HistoricalSignal[] = [
  {
    id: 'sig-mnt-001',
    token: 'MNT',
    type: 'SNIPER_BUY',
    typeName: 'Sniper Core Buy',
    time: '2 hours ago',
    confidence: 96,
    status: 'hit',
    pnl: '+18.4%',
    initialPrice: 0.65,
    peakPrice: 0.77,
    currentPrice: 0.74,
    stages: {
      detection: {
        wallets: ['0xabc', '0x19a', '0xdef'],
        anomaly: 'Z-score volume spike inside Agni Finance pair: +4.62 SD',
        zScore: 4.62,
        timestamp: '2026-06-06T17:48:00Z'
      },
      capitalFlow: {
        inflow: '$4.2M',
        source: 'Symbiosis Bridge',
        target: 'Agni DEX',
        nodes: [
          { id: 'symbiosis', label: 'Symbiosis Bridge', type: 'bridge', value: 11 },
          { id: 'agni', label: 'Agni DEX', type: 'protocol', value: 12 },
          { id: '0xabc', label: '0xabc (Sniper)', type: 'wallet', value: 7 },
        ],
        links: [
          { source: 'symbiosis', target: 'agni', value: 5, asset: 'USDT' },
          { source: 'agni', target: '0xabc', value: 3, asset: 'MNT' },
        ]
      },
      aiReasoning: {
        output: "Detected coordinated bridge inflow of $4.2M USDT appearing systematically across Agni's MNT/USDT pair. 3 known snipers (0xabc, 0x19a, 0xdef) entered positions within the same block. Pattern matches institutional accumulation phase observed in previous MNT cycles. Recommended execution: LONG with trailing stop-loss at -2%.",
        confidence: 96,
        dataPoints: ['Volume increase: 400% vs 24h avg', 'Wallet overlap: 85% high-conviction group', 'Liquidity depth: +12% improvement']
      },
      marketResponse: {
        chartData: [
          { time: '17:40', price: 0.65, volume: 12000 },
          { time: '17:45', price: 0.65, volume: 15000 },
          { time: '17:48', price: 0.65, volume: 85000 }, // Signal
          { time: '17:50', price: 0.68, volume: 45000 },
          { time: '18:00', price: 0.72, volume: 32000 },
          { time: '18:30', price: 0.77, volume: 28000 }, // Peak
          { time: '19:00', price: 0.75, volume: 15000 },
          { time: '19:30', price: 0.74, volume: 10000 },
        ],
        peakPrice: 0.77,
        priceChange: '+18.46%'
      },
      outcome: {
        pnl: '+18.4%',
        isHit: true,
        smartMoneyNextMoves: '0xabc exited 50% at peak; 0x19a still holding full position.'
      }
    },
    evidence: [
      { id: 'tx1', type: 'Bridge Inflow', address: '0xsym...', amount: '$4.2M USDT', timestamp: '17:47:12', hash: '0x44fa...7b1' },
      { id: 'tx2', type: 'Sniper Buy', address: '0xabc...', amount: '450k MNT', timestamp: '17:48:05', hash: '0x32f1...a42' },
      { id: 'tx3', type: 'Sniper Buy', address: '0x19a...', amount: '120k MNT', timestamp: '17:48:10', hash: '0xaba8...1cf' },
    ]
  },
  {
    id: 'sig-eth-002',
    token: 'ETH',
    type: 'WHALE_ALERT',
    typeName: 'Whale Accumulate',
    time: '5 hours ago',
    confidence: 91,
    status: 'miss',
    pnl: '-2.1%',
    initialPrice: 3804,
    peakPrice: 3850,
    currentPrice: 3724,
    stages: {
      detection: {
        wallets: ['0x44f'],
        anomaly: 'Heavy institutional accumulation detected: $460k buy wall at $3800',
        zScore: 3.1,
        timestamp: '2026-06-06T14:48:00Z'
      },
      capitalFlow: {
        inflow: '$1.2M',
        source: 'Coinbase Custody',
        target: 'ETH/USDC Pool',
        nodes: [
          { id: 'coinbase', label: 'Coinbase', type: 'bridge', value: 10 },
          { id: 'pool', label: 'ETH/USDC UniV3', type: 'protocol', value: 11 },
          { id: '0x44f', label: '0x44f (Whale)', type: 'wallet', value: 9 },
        ],
        links: [
          { source: 'coinbase', target: '0x44f', value: 4, asset: 'ETH' },
          { source: '0x44f', target: 'pool', value: 4, asset: 'ETH' },
        ]
      },
      aiReasoning: {
        output: "Whale 0x44f transferred 150 ETH from custody and provided liquidity. Historic win rate is high, but overall market sentiment is neutral. Probability of breakout is 65% based on order book depth.",
        confidence: 91,
        dataPoints: ['Whale behavior: 3rd accumulation this week', 'Market beta: 0.95', 'Sentiment: Bearish divergence detected']
      },
      marketResponse: {
        chartData: [
          { time: '14:40', price: 3800, volume: 500 },
          { time: '14:48', price: 3804, volume: 1200 }, // Signal
          { time: '15:00', price: 3850, volume: 800 },
          { time: '16:00', price: 3780, volume: 1500 },
          { time: '17:00', price: 3724, volume: 2000 },
        ],
        peakPrice: 3850,
        priceChange: '+1.21%'
      },
      outcome: {
        pnl: '-2.1%',
        isHit: false,
        smartMoneyNextMoves: '0x44f removed liquidity at loss; moving to stables.'
      }
    },
    evidence: [
      { id: 'tx-eth-1', type: 'Transfer', address: '0x44f...', amount: '150 ETH', timestamp: '14:45:00', hash: '0x88f2...9fb' },
      { id: 'tx-eth-2', type: 'LP Add', address: '0x44f...', amount: '$460k Liquidity', timestamp: '14:48:30', hash: '0xbb2a...9cc' },
    ]
  }
];
