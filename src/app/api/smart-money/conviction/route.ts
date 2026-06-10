import { NextRequest, NextResponse } from 'next/server';
import { triggerScan, getWalletConviction } from '@/src/lib/smart-money-scanner';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { error: "Invalid Ethereum/Mantle address format. Address must begin with 0x and be 42 characters long." },
        { status: 400 }
      );
    }

    // Ensure state is updated
    await triggerScan();

    const conviction = getWalletConviction(address);

    return NextResponse.json({
      success: true,
      data: conviction
    });
  } catch (error: any) {
    console.error("GET /api/smart-money/conviction error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve live Mantle data. Please verify RPC connectivity." },
      { status: 500 }
    );
  }
}
