import { JsonRpcProvider, Wallet, Contract, keccak256, toUtf8Bytes } from "ethers";

// Minimal ABI as specified by user instructions covering the 5 write functions and PriceFetchFailed event
export const CHAMELEON_ABI = [
  "event PriceFetchFailed(uint256 timestamp)",
  "function storeSignal(address wallet, string signalType, uint8 confidence, string explanation, bytes32 contentHash) external",
  "function storeWalletDNA(address wallet, string archetype, uint8 convictionScore, string favoriteSectors, bytes32 contentHash) external",
  "function storeNarrative(string narrative, uint8 confidence, uint256 capitalFlowSize, bytes32 contentHash) external",
  "function storeHealthScore(uint8 overallScore, uint8 liquidity, uint8 whaleConfidence, uint8 risk, string summary, bytes32 contentHash) external",
  "function storeAnomaly(address wallet, string anomalyType, uint8 severity, string description, bytes32 contentHash) external"
];

export interface OperatorResponse {
  success: boolean;
  txHash?: string;
  contentHash: string;
  priceFetchFailed?: boolean;
  error?: string;
}

export class ChameleonOperator {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: Contract;

  constructor() {
    const rpcUrl = process.env.MANTLE_RPC_URL || "https://rpc.mantle.xyz";
    const privateKey = process.env.CHAMELEON_OPERATOR_PRIVATE_KEY;
    const contractAddress = process.env.CHAMELEON_CONTRACT_ADDRESS || "0xE495f3dD4d7DC3A7D980421569b4775458F4CfD0";

    if (!privateKey) {
      throw new Error("CHAMELEON_OPERATOR_PRIVATE_KEY is not defined in environment variables");
    }

    if (!contractAddress) {
      throw new Error("CHAMELEON_CONTRACT_ADDRESS is not defined in environment variables");
    }

    this.provider = new JsonRpcProvider(rpcUrl);
    // Securely instantiate the wallet without logging the private key
    this.wallet = new Wallet(privateKey, this.provider);
    this.contract = new Contract(contractAddress, CHAMELEON_ABI, this.wallet);
  }

  /**
   * Helper to retrieve the operator's public address (useful for role verification)
   */
  public getOperatorAddress(): string {
    return this.wallet.address;
  }

  /**
   * Internal helper to generate contentHash via keccak256 of JSON payload
   */
  private generateContentHash(payload: Record<string, any>): string {
    const jsonStr = JSON.stringify(payload);
    return keccak256(toUtf8Bytes(jsonStr));
  }

  /**
   * Checks the transaction receipt for PriceFetchFailed event
   */
  private checkPriceFetchFailed(receipt: any): boolean {
    try {
      const eventTopic = this.contract.interface.getEvent("PriceFetchFailed")?.topicHash;
      if (!eventTopic) return false;
      return receipt.logs.some((log: any) => log.topics[0] === eventTopic);
    } catch {
      return false;
    }
  }

  /**
   * 1. Store Trading Signal
   */
  public async storeSignal(
    wallet: string,
    signalType: string,
    confidence: number,
    explanation: string
  ): Promise<OperatorResponse> {
    const payload = { wallet, signalType, confidence, explanation, timestamp: Date.now() };
    const contentHash = this.generateContentHash(payload);

    try {
      console.log(`[ChameleonOperator] Storing signal for ${wallet}...`);
      const tx = await this.contract.storeSignal(
        wallet,
        signalType,
        confidence,
        explanation,
        contentHash
      );
      
      const receipt = await tx.wait();
      const priceFetchFailed = this.checkPriceFetchFailed(receipt);

      if (priceFetchFailed) {
        console.warn("[ChameleonOperator] On-chain storeSignal succeeded, but price oracle fetch was down.");
      }

      return {
        success: true,
        txHash: receipt.hash,
        contentHash,
        priceFetchFailed
      };
    } catch (error: any) {
      console.error("[ChameleonOperator] storeSignal failed:", error);
      return {
        success: false,
        contentHash,
        error: error.message || String(error)
      };
    }
  }

  /**
   * 2. Store Wallet DNA Profile
   */
  public async storeWalletDNA(
    wallet: string,
    archetype: string,
    convictionScore: number,
    favoriteSectors: string
  ): Promise<OperatorResponse> {
    const payload = { wallet, archetype, convictionScore, favoriteSectors, timestamp: Date.now() };
    const contentHash = this.generateContentHash(payload);

    try {
      console.log(`[ChameleonOperator] Storing DNA profile for ${wallet}...`);
      const tx = await this.contract.storeWalletDNA(
        wallet,
        archetype,
        convictionScore,
        favoriteSectors,
        contentHash
      );

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        contentHash
      };
    } catch (error: any) {
      console.error("[ChameleonOperator] storeWalletDNA failed:", error);
      return {
        success: false,
        contentHash,
        error: error.message || String(error)
      };
    }
  }

  /**
   * 3. Store Ecosystem Narrative
   */
  public async storeNarrative(
    narrative: string,
    confidence: number,
    capitalFlowSize: bigint | number
  ): Promise<OperatorResponse> {
    const payload = { narrative, confidence, capitalFlowSize: capitalFlowSize.toString(), timestamp: Date.now() };
    const contentHash = this.generateContentHash(payload);

    try {
      console.log(`[ChameleonOperator] Storing narrative "${narrative}"...`);
      const tx = await this.contract.storeNarrative(
        narrative,
        confidence,
        capitalFlowSize,
        contentHash
      );

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        contentHash
      };
    } catch (error: any) {
      console.error("[ChameleonOperator] storeNarrative failed:", error);
      return {
        success: false,
        contentHash,
        error: error.message || String(error)
      };
    }
  }

  /**
   * 4. Store Health Score
   */
  public async storeHealthScore(
    overallScore: number,
    liquidity: number,
    whaleConfidence: number,
    risk: number,
    summary: string
  ): Promise<OperatorResponse> {
    const payload = { overallScore, liquidity, whaleConfidence, risk, summary, timestamp: Date.now() };
    const contentHash = this.generateContentHash(payload);

    try {
      console.log("[ChameleonOperator] Storing health score...");
      const tx = await this.contract.storeHealthScore(
        overallScore,
        liquidity,
        whaleConfidence,
        risk,
        summary,
        contentHash
      );

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        contentHash
      };
    } catch (error: any) {
      console.error("[ChameleonOperator] storeHealthScore failed:", error);
      return {
        success: false,
        contentHash,
        error: error.message || String(error)
      };
    }
  }

  /**
   * 5. Store Behavioral Anomaly Alert
   */
  public async storeAnomaly(
    wallet: string,
    anomalyType: string,
    severity: number,
    description: string
  ): Promise<OperatorResponse> {
    const payload = { wallet, anomalyType, severity, description, timestamp: Date.now() };
    const contentHash = this.generateContentHash(payload);

    try {
      console.log(`[ChameleonOperator] Storing anomaly alert for wallet ${wallet}...`);
      const tx = await this.contract.storeAnomaly(
        wallet,
        anomalyType,
        severity,
        description,
        contentHash
      );

      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        contentHash
      };
    } catch (error: any) {
      console.error("[ChameleonOperator] storeAnomaly failed:", error);
      return {
        success: false,
        contentHash,
        error: error.message || String(error)
      };
    }
  }
}
