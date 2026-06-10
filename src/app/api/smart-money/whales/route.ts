import { NextResponse } from 'next/server';
import { triggerScan, getScannedWhales, getLastUpdatedTimestamp, getScannedBlocksCount } from '@/src/lib/smart-money-scanner';

export async function GET() {
  try {
    // Trigger blockchain scan to pull the latest blocks
    await triggerScan();

    const whales = getScannedWhales();
    const lastUpdated = getLastUpdatedTimestamp();
    const blocksCount = getScannedBlocksCount();

    return NextResponse.json({
      success: true,
      data: whales,
      lastUpdated,
      blocksCount
    });
  } catch (error: any) {
    console.error("GET /api/smart-money/whales error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve live Mantle data. Please verify RPC connectivity." },
      { status: 500 }
    );
  }
}
