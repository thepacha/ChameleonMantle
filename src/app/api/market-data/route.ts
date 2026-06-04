import { NextResponse } from 'next/server';

export async function GET() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    price: 0.8 + Math.random() * 0.4,
    volume: 1000000 + Math.random() * 500000,
    liquidity: 5000000 + Math.random() * 1000000,
  }));
  return NextResponse.json(data);
}
