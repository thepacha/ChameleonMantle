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
