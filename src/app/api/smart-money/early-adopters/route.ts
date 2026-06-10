import { NextResponse } from 'next/server';
import { triggerScan, getScannedEarlyAdopters, getLastUpdatedTimestamp, getScannedBlocksCount } from '@/src/lib/smart-money-scanner';

export async function GET() {
  try {
    // Trigger blockchain scan
    await triggerScan();

    const earlyAdopters = getScannedEarlyAdopters();
    const lastUpdated = getLastUpdatedTimestamp();
    const blocksCount = getScannedBlocksCount();

    return NextResponse.json({
      success: true,
      data: earlyAdopters,
      lastUpdated,
      blocksCount
    });
  } catch (error: any) {
    console.error("GET /api/smart-money/early-adopters error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve live Mantle data. Please verify RPC connectivity." },
      { status: 500 }
    );
  }
}
