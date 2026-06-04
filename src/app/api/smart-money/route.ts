import { NextResponse } from 'next/server';

export async function GET() {
  const activities = [
    { id: '1', address: '0x123...456', type: 'buy', asset: 'MNT', amount: 50000, valueUsd: 45000, timestamp: new Date().toISOString(), isSmartMoney: true },
    { id: '2', address: '0x789...abc', type: 'sell', asset: 'USDC', amount: 100000, valueUsd: 100000, timestamp: new Date(Date.now() - 3600000).toISOString(), isSmartMoney: true },
    { id: '3', address: '0xdef...012', type: 'transfer', asset: 'ETH', amount: 10, valueUsd: 25000, timestamp: new Date(Date.now() - 7200000).toISOString(), isSmartMoney: true },
  ];
  return NextResponse.json(activities);
}
