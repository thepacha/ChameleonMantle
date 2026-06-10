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

    const systemPrompt = `You are a forensic behavioral analyst for the ChameleonAI Layer 2 system on Mantle.
    Evaluate the following address behavioral metrics and context description to outline its on-chain DNA profile.
    Target Address: ${wallet}
    Context description: ${analysisPrompt}

    Deduce the investor archetype, overall conviction, and their favorite sector niches. Use top-tier quantitative L2 financial descriptions.`;

    // Call Gemini with strict JSON schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            archetype: { 
              type: Type.STRING,
              description: "The behavioral archetype. E.g., Early Trend Sniper, LP Farmer, Governance Insider, Whale Accumulator, High-Frequency Ape."
            },
            convictionScore: { 
              type: Type.INTEGER, 
              description: "AI conviction score of holding strategy from 0 to 100."
            },
            favoriteSectors: { 
              type: Type.STRING,
              description: "Comma-separated sector list of favorites on Mantle (e.g. AI & GPU, DeFi, LRT Restaking)."
            }
          },
          required: ["archetype", "convictionScore", "favoriteSectors"]
        }
      }
    });

    const aiText = response.text?.trim() || "";
    let dnaResult;
    try {
      dnaResult = JSON.parse(aiText);
    } catch (parseErr) {
      console.error("Failed to parse Gemini DNA JSON output:", aiText);
      return NextResponse.json(
        { error: "AI generated an invalid JSON structure. Please retry." },
        { status: 500 }
      );
    }

    const { archetype, convictionScore, favoriteSectors } = dnaResult;

    // Check if operator variables are configured. If not, do a graceful dry-run return
    if (!operatorPrivateKey || !contractAddress) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        message: "Chameleon operator keys are missing. DNA compiled successfully (Dry-Run mode).",
        dna: {
          archetype,
          convictionScore: Math.min(100, Math.max(0, Number(convictionScore))),
          favoriteSectors
        },
        warning: "Configure CHAMELEON_CONTRACT_ADDRESS and CHAMELEON_OPERATOR_PRIVATE_KEY to store on-chain."
      });
    }

    // Lazy load the off-chain operator
    const operator = new ChameleonOperator();
    const storeRes = await operator.storeWalletDNA(
      wallet,
      archetype,
      Math.min(100, Math.max(0, Number(convictionScore))),
      favoriteSectors
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
      dna: {
        archetype,
        convictionScore,
        favoriteSectors
      }
    });

  } catch (error: any) {
    console.error("POST /api/wallet-dna error:", error);
    return NextResponse.json(
      { error: `Operator dispatch error: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
