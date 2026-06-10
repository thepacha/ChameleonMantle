import { NextRequest, NextResponse } from 'next/server';
import { getMantleTokenTransfers } from '@/src/lib/mantle';

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();
    if (!address || !address.startsWith('0x')) {
      return NextResponse.json({ error: 'Invalid or missing wallet address' }, { status: 400 });
    }
    const { data, error, warning } = await getMantleTokenTransfers(address.trim());
    if (error) {
      return NextResponse.json({ error, warning }, { status: 500 });
    }
    return NextResponse.json({ success: true, data, warning });
  } catch (error: any) {
    console.error('API /api/wallet/transfers error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transfers via explorer API' }, { status: 500 });
  }
}
