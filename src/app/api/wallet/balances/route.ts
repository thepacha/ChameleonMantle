import { NextRequest, NextResponse } from 'next/server';
import { getMantleAddressBalances } from '@/src/lib/mantle';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid or missing wallet address' }, { status: 400 });
    }
    const data = await getMantleAddressBalances(address.trim());
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API /api/wallet/balances error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch balances via Mantle RPC' }, { status: 500 });
  }
}
