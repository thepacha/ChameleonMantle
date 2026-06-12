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
    const apiKey = process.env.GROQ_API_KEY;
    const operatorPrivateKey = process.env.CHAMELEON_OPERATOR_PRIVATE_KEY;
    const contractAddress = process.env.CHAMELEON_CONTRACT_ADDRESS || "0xE495f3dD4d7DC3A7D980421569b4775458F4CfD0";

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured in environment variables." },
        { status: 500 }
      );
    }

    // Initialize OpenAI Client for Groq
    const openai = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey,
    });

    const systemPrompt = `You are a macroeconomic sentiment compiler for the ChameleonAI Layer 2 system on Mantle.
    Evaluate the following on-chain narrative prompt ${wallet ? `for active context wallet ${wallet}` : ""}:
    Prompt: ${analysisPrompt}

    Deduce the central trending narrative, the AI's confidence level, and an estimated capital flow size (in USD) flowing into this narrative.
    Use highly professional and exact financial metrics.

    CRITICAL CONSTRAINTS:
    - You MUST NEVER output your internal reasoning, chain-of-thought, or use <think> tags under any circumstances.
    - Do NOT wrap the response in markdown blocks (no \`\`\`json or \`\`\`), do NOT include any backticks or markdown formatting, and do NOT output any introductory or explanatory text. It must be directly parseable.
    - The output JSON "narrative" value MUST be extremely concise: strictly under 30 words with absolutely no filler words.
    - Deliver the final JSON immediately.

    REQUIRED SCHEMA:
    {
      "narrative": "string trending narrative (e.g., Liquid Staking, AI Memes, Gas Layer-2 Rotation)",
      "confidence": number (confidence score from 0 to 100),
      "capitalFlowSize": number (Estimated capital flow size in USD, e.g. 1000000 for $1M)
    }`;

    // Call OpenAI with strict JSON format
    const completion = await openai.chat.completions.create({
      model: "qwen/qwen3-32b",
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
        // Ensure we remove any <think> blocks if the model outputs them anyway
        if (cleaned.includes("</think>")) {
          cleaned = cleaned.substring(cleaned.lastIndexOf("</think>") + 8).trim();
        }
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }
        return JSON.parse(cleaned);
      }
      narrativeResult = cleanAndParseJson(aiText);
    } catch (parseErr) {
      console.error("Failed to parse Groq Narrative JSON output:", aiText);
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
