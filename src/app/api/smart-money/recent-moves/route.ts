import { NextResponse } from 'next/server';
import { triggerScan, getScannedRecentMoves, getLastUpdatedTimestamp, getScannedBlocksCount } from '@/src/lib/smart-money-scanner';

export async function GET() {
  try {
    // Trigger blockchain scan
    await triggerScan();

    const recentMoves = getScannedRecentMoves();
    const lastUpdated = getLastUpdatedTimestamp();
    const blocksCount = getScannedBlocksCount();

    return NextResponse.json({
      success: true,
      data: recentMoves,
      lastUpdated,
      blocksCount
    });
  } catch (error: any) {
    console.error("GET /api/smart-money/recent-moves error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve live Mantle data. Please verify RPC connectivity." },
      { status: 500 }
    );
  }
}
