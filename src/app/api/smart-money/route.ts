import { NextResponse } from 'next/server';
import { getMantleTokenTransfers } from '@/src/lib/mantle';

export async function GET() {
  try {
    const { data: realTransfers, error, warning } = await getMantleTokenTransfers();
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (realTransfers && realTransfers.length > 0) {
      const activities = realTransfers.map((tx: any, idx: number) => ({
        id: tx.transaction_hash || String(idx),
        address: tx.trader_address,
        type: 'buy',
        asset: tx.token_bought_symbol || 'WMNT',
        amount: tx.token_bought_amount,
        valueUsd: tx.trade_value_usd,
        timestamp: tx.block_timestamp,
        isSmartMoney: true
      }));
      return NextResponse.json(activities);
    }
    return NextResponse.json([]);
  } catch (e: any) {
    console.error("GET smart-money error:", e);
    return NextResponse.json({ error: e.message || "Failed to fetch smart money transfers" }, { status: 500 });
  }
}

