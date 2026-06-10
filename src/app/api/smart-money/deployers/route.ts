import { NextResponse } from 'next/server';
import { triggerScan, getScannedDeployers, getLastUpdatedTimestamp, getScannedBlocksCount } from '@/src/lib/smart-money-scanner';

export async function GET() {
  try {
    // Trigger blockchain scan
    await triggerScan();

    const deployers = getScannedDeployers();
    const lastUpdated = getLastUpdatedTimestamp();
    const blocksCount = getScannedBlocksCount();

    return NextResponse.json({
      success: true,
      data: deployers,
      lastUpdated,
      blocksCount
    });
  } catch (error: any) {
    console.error("GET /api/smart-money/deployers error:", error);
    return NextResponse.json(
      { error: "Unable to retrieve live Mantle data. Please verify RPC connectivity." },
      { status: 500 }
    );
  }
}
