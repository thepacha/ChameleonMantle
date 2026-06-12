import { NextRequest, NextResponse } from 'next/server';
import { getMantleAddressBalances, getMantleTokenTransfers, getMultichainBalances } from '@/src/lib/mantle';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Clean address format
    const cleanAddress = address.trim().toLowerCase();
    if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
      return NextResponse.json({ error: 'Invalid Ethereum/Mantle address format' }, { status: 400 });
    }

    // Fetch on-chain balances, transaction history, and multichain native balances in parallel
    const [balances, transfersResult, multichainBalances] = await Promise.all([
      getMantleAddressBalances(cleanAddress),
      getMantleTokenTransfers(cleanAddress),
      getMultichainBalances(cleanAddress)
    ]);

    return NextResponse.json({
      balances,
      transfers: transfersResult.data || [],
      multichainBalances,
      error: transfersResult.error || null,
      warning: transfersResult.warning || null
    });
  } catch (err: any) {
    console.error('Wallet API routing error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch live on-chain data' }, { status: 500 });
  }
}
