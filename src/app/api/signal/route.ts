import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { ChameleonOperator } from "@/src/lib/chameleon/operator";

export async function POST(req: NextRequest) {
  try {
    const { wallet, analysisPrompt } = await req.json();

    if (!wallet || !wallet.startsWith("0x") || wallet.length !== 42) {
      return NextResponse.json(
        { error: "Invalid Ethereum/Mantle address format." },
        { status: 400 }
      );
    }

    if (!analysisPrompt) {
      return NextResponse.json(
        { error: "analysisPrompt is required." },
        { status: 400 }
      );
    }

    // Check configuration safely
    const apiKey = process.env.GEMINI_API_KEY;
    const operatorPrivateKey = process.env.CHAMELEON_OPERATOR_PRIVATE_KEY;
    const contractAddress = process.env.CHAMELEON_CONTRACT_ADDRESS;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    // Initialize Gemini Client
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemPrompt = `You are a cognitive trading intelligence operator for the ChameleonAI Layer 2 system on Mantle.
    Analyze the following request and on-chain intelligence prompt for wallet address: ${wallet}.
    Context prompt: ${analysisPrompt}

    Generate a trading signal with high-quality, professional, realistic on-chain vocabulary (e.g., liquidity range, smart contract volume, accumulation cycles, index).`;

    // Call Gemini with strict JSON schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signalType: { 
              type: Type.STRING,
              description: "The type of trading signal. Choose from: accumulation, exit, rotation, arbitrage, liquidity_mining."
            },
            confidence: { 
              type: Type.INTEGER, 
              description: "AI confidence score from 0 to 100."
            },
            explanation: { 
              type: Type.STRING,
              description: "A professional, analytical explanation of the signal (1-2 sentences)."
            }
          },
          required: ["signalType", "confidence", "explanation"]
        }
      }
    });

    const aiText = response.text?.trim() || "";
    let signalResult;
    try {
      signalResult = JSON.parse(aiText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON output:", aiText);
      return NextResponse.json(
        { error: "AI generated an invalid JSON structure. Please retry." },
        { status: 500 }
      );
    }

    const { signalType, confidence, explanation } = signalResult;
    
    // Check if operator variables are configured. If not, do a graceful dry-run return
    if (!operatorPrivateKey || !contractAddress) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: "Chameleon operator keys are missing. Output produced successfully (Dry-Run mode).",
        signal: {
          signalType,
          confidence: Math.min(100, Math.max(0, Number(confidence))),
          explanation
        },
        warning: "Configure CHAMELEON_CONTRACT_ADDRESS and CHAMELEON_OPERATOR_PRIVATE_KEY to store on-chain."
      });
    }

    // Lazy load the off-chain operator
    const operator = new ChameleonOperator();
    const storeRes = await operator.storeSignal(
      wallet,
      signalType,
      Math.min(100, Math.max(0, Number(confidence))),
      explanation
    );

    if (!storeRes.success) {
      return NextResponse.json(
        { error: `Contract call failed: ${storeRes.error}`, contentHash: storeRes.contentHash },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      txHash: storeRes.txHash,
      contentHash: storeRes.contentHash,
      priceFetchFailed: storeRes.priceFetchFailed,
      signal: {
        signalType,
        confidence,
        explanation
      }
    });

  } catch (error: any) {
    console.error("POST /api/signal error:", error);
    return NextResponse.json(
      { error: `Operator dispatch error: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
