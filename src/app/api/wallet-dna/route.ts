import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
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

    const systemPrompt = `You are a forensic behavioral analyst for the ChameleonAI Layer 2 system on Mantle.
    Evaluate the following address behavioral metrics and context description to outline its on-chain DNA profile.
    Target Address: ${wallet}
    Context description: ${analysisPrompt}

    Deduce the investor archetype, overall conviction, and their favorite sector niches. Use top-tier quantitative L2 financial descriptions.

    CRITICAL CONSTRAINTS:
    - You MUST NEVER output your internal reasoning, chain-of-thought, or use <think> tags under any circumstances.
    - Do NOT wrap the response in markdown blocks (no \`\`\`json or \`\`\`), do NOT include any backticks or markdown formatting, and do NOT output any introductory or explanatory text. It must be directly parseable.
    - All text explanation fields in the output JSON ("archetype", "favoriteSectors") MUST be extremely concise: strictly under 30 words total per field.
    - Focus ONLY on the core raw descriptors and metrics without any filler words.
    - Deliver the final JSON immediately.

    REQUIRED SCHEMA:
    {
      "archetype": "string archetype (e.g., Early Trend Sniper, LP Farmer, Governance Insider, Whale Accumulator, High-Frequency Ape)",
      "convictionScore": number (holding strategy conviction score from 0 to 100),
      "favoriteSectors": "string comma-separated sector list of favorites (e.g., 'AI & GPU, DeFi, LRT Restaking')"
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
    let dnaResult;
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
      dnaResult = cleanAndParseJson(aiText);
    } catch (parseErr) {
      console.error("Failed to parse Groq DNA JSON output:", aiText);
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
