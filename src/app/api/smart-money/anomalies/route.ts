import { NextResponse } from 'next/server';
import { getAnomalyEngine } from '@/src/lib/chameleon/anomaly-engine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const engine = getAnomalyEngine();
    
    // Proactively start the background listener thread if not already running
    if (!engine.isRunning) {
      // Lazy startup - runs in background asynchronously
      engine.start().catch((err) => {
        console.error("[Anomaly API] Non-blocking background engine start failure:", err);
      });
    }

    // Retrieve active on-chain and in-memory combined detections
    const anomalies = await engine.getHistoricalAnomalies();

    return NextResponse.json({
      success: true,
      anomalies,
      engineState: {
        isRunning: engine.isRunning,
        activeScentSize: engine.activeAnomalies.length
      }
    });

  } catch (err: any) {
    console.error("GET /api/smart-money/anomalies error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || String(err)
    }, { status: 500 });
  }
}
