import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { ChameleonOperator } from "@/src/lib/chameleon/operator";

export async function POST(req: NextRequest) {
  try {
    const { wallet, analysisPrompt } = await req.json();

    // Note: Narrative can optionally be analyzed with/without a specific wallet reference
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

    const systemPrompt = `You are a macroeconomic sentiment compiler for the ChameleonAI Layer 2 system on Mantle.
    Evaluate the following on-chain narrative prompt ${wallet ? `for active context wallet ${wallet}` : ""}:
    Prompt: ${analysisPrompt}

    Deduce the central trending narrative, the AI's confidence level, and an estimated capital flow size (in USD) flowing into this narrative.
    Use highly professional and exact financial metrics.`;

    // Call Gemini with strict JSON schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrative: { 
              type: Type.STRING,
              description: "Trending ecosystem narrative (e.g., Liquid Staking, AI Memes, Gas Layer-2 Rotation)."
            },
            confidence: { 
              type: Type.INTEGER, 
              description: "AI confidence score from 0 to 100."
            },
            capitalFlowSize: { 
              type: Type.INTEGER,
              description: "Estimated capital flow size in USD (e.g. 1000000 for $1M)."
            }
          },
          required: ["narrative", "confidence", "capitalFlowSize"]
        }
      }
    });

    const aiText = response.text?.trim() || "";
    let narrativeResult;
    try {
      narrativeResult = JSON.parse(aiText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini Narrative JSON output:", aiText);
      return NextResponse.json(
        { error: "AI generated an invalid JSON structure. Please retry." },
        { status: 500 }
      );
    }

    const { narrative, confidence, capitalFlowSize } = narrativeResult;

    // Check if operator variables are configured. If not, do a graceful dry-run return
    if (!operatorPrivateKey || !contractAddress) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: "Chameleon operator keys are missing. Narrative compiled successfully (Dry-Run mode).",
        narrative: {
          narrative,
          confidence: Math.min(100, Math.max(0, Number(confidence))),
          capitalFlowSize: Number(capitalFlowSize)
        },
        warning: "Configure CHAMELEON_CONTRACT_ADDRESS and CHAMELEON_OPERATOR_PRIVATE_KEY to store on-chain."
      });
    }

    // Lazy load the off-chain operator
    const operator = new ChameleonOperator();
    const storeRes = await operator.storeNarrative(
      narrative,
      Math.min(100, Math.max(0, Number(confidence))),
      BigInt(capitalFlowSize)
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
      narrative: {
        narrative,
        confidence,
        capitalFlowSize
      }
    });

  } catch (error: any) {
    console.error("POST /api/narrative error:", error);
    return NextResponse.json(
      { error: `Operator dispatch error: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
