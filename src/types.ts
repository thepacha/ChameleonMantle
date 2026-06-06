/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MarketData {
  timestamp: string;
  price: number;
  volume: number;
  liquidity: number;
}

export interface WalletActivity {
  id: string;
  address: string;
  type: 'buy' | 'sell' | 'transfer';
  asset: string;
  amount: number;
  valueUsd: number;
  timestamp: string;
  isSmartMoney: boolean;
}

export interface SentimentData {
  score: number; // -1 to 1
  label: 'bullish' | 'bearish' | 'neutral';
  explanation: string;
}

export interface AnalysisResponse {
  insight: string;
  sentiment: SentimentData;
  predictedMove?: string;
}

export interface ProtocolStats {
  tvl: number;
  volume24h: number;
  activeUsers: number;
  topAssets: { name: string; tvl: number }[];
}

export interface ReplayStage {
  id: number;
  title: string;
  description: string;
  timestamp: string;
}

export interface HistoricalSignal {
  id: string;
  token: string;
  type: string;
  typeName: string;
  time: string;
  confidence: number;
  status: 'hit' | 'miss';
  pnl: string;
  initialPrice: number;
  peakPrice: number;
  currentPrice: number;
  stages: {
    detection: {
      wallets: string[];
      anomaly: string;
      zScore: number;
      timestamp: string;
    };
    capitalFlow: {
      inflow: string;
      source: string;
      target: string;
      nodes: { id: string; label: string; type: string; value: number }[];
      links: { source: string; target: string; value: number; asset: string }[];
    };
    aiReasoning: {
      output: string;
      confidence: number;
      dataPoints: string[];
    };
    marketResponse: {
      chartData: { time: string; price: number; volume: number }[];
      peakPrice: number;
      priceChange: string;
    };
    outcome: {
      pnl: string;
      isHit: boolean;
      smartMoneyNextMoves: string;
    };
  };
  evidence: {
    id: string;
    type: string;
    address: string;
    amount: string;
    timestamp: string;
    hash: string;
  }[];
}
