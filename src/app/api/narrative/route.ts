import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
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
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    const operatorPrivateKey = process.env.CHAMELEON_OPERATOR_PRIVATE_KEY;
    const contractAddress = process.env.CHAMELEON_CONTRACT_ADDRESS;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY or GEMINI_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    // Initialize OpenAI Client for OpenRouter
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
        "X-Title": "Chameleon",
      }
    });

    const systemPrompt = `You are a macroeconomic sentiment compiler for the ChameleonAI Layer 2 system on Mantle.
    Evaluate the following on-chain narrative prompt ${wallet ? `for active context wallet ${wallet}` : ""}:
    Prompt: ${analysisPrompt}

    Deduce the central trending narrative, the AI's confidence level, and an estimated capital flow size (in USD) flowing into this narrative.
    Use highly professional and exact financial metrics.

    The response must be strictly formatted as JSON to be directly passed as arguments to smart contract function calls.
    Do NOT include any markdown formatting (like \`\`\`json or backticks) in your output. Just return the raw JSON object.

    REQUIRED SCHEMA:
    {
      "narrative": "string trending narrative (e.g., Liquid Staking, AI Memes, Gas Layer-2 Rotation)",
      "confidence": number (confidence score from 0 to 100),
      "capitalFlowSize": number (Estimated capital flow size in USD, e.g. 1000000 for $1M)
    }`;

    // Call OpenAI with strict JSON format
    const completion = await openai.chat.completions.create({
      model: "google/gemma-4-31b-it:free",
      messages: [
        {
          role: "user",
          content: systemPrompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiText = completion.choices[0]?.message?.content?.trim() || "";
    let narrativeResult;
    try {
      function cleanAndParseJson(text: string): any {
        let cleaned = text.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        return JSON.parse(cleaned);
      }
      narrativeResult = cleanAndParseJson(aiText);
    } catch (parseErr) {
      console.error("Failed to parse OpenRouter Narrative JSON output:", aiText);
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
