import { NextResponse } from "next/server";
import { getProvider, getScannedBlockRange, getScannerRpcUrl, getScannedBlocksCount } from "@/src/lib/smart-money-scanner";

export async function GET() {
  try {
    const startTime = Date.now();
    const provider = getProvider();
    
    // Check RPC block height and measure latency
    const latestBlock = await provider.getBlockNumber();
    const latencyMs = Date.now() - startTime;
    
    const scannedRange = getScannedBlockRange();
    const rpcUrl = getScannerRpcUrl();
    const blocksCount = getScannedBlocksCount();
    
    // Mask any secrets in RPC URL if needed, but standard public node is fine
    const displayRpc = rpcUrl.replace(/[\w-]{12,}/g, "******");

    return NextResponse.json({
      success: true,
      rpcUrl: displayRpc,
      chainId: 5000,
      networkName: "Mantle Mainnet",
      status: "Healthy",
      latencyMs,
      latestBlock,
      lowestScannedBlock: scannedRange.lowest,
      highestScannedBlock: scannedRange.highest,
      scannedRangeSize: scannedRange.highest > 0 ? scannedRange.highest - scannedRange.lowest : 0,
      blocksCountInState: blocksCount,
    });
  } catch (error: any) {
    console.error("RPC Status check failed:", error);
    return NextResponse.json({
      success: false,
      rpcUrl: "https://rpc.mantle.xyz",
      chainId: 5000,
      networkName: "Mantle Mainnet",
      status: "Degraded",
      error: error.message || "Unable to retrieve live Mantle data. Please verify RPC connectivity.",
      latencyMs: 0,
      latestBlock: 0,
      lowestScannedBlock: 0,
      highestScannedBlock: 0,
      scannedRangeSize: 0,
      blocksCountInState: 0,
    });
  }
}
