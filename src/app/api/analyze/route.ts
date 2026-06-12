import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API key is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey,
    });

    const body = await req.json();
    const { marketData, walletActivity } = body;
    
    const prompt = `Analyze the following crypto market data and wallet activity for the Mantle ecosystem:
    Market Data Summary: ${JSON.stringify(marketData)}
    Recent Smart Money Activity: ${JSON.stringify(walletActivity)}
    
    Provide a detailed behavioral assessment in strictly valid JSON format.
    The response must be strictly formatted as JSON to be directly passed as arguments to smart contract function calls.
    
    CRITICAL CONSTRAINTS:
    - You MUST NEVER output your internal reasoning, chain-of-thought, or use <think> tags under any circumstances.
    - Do NOT wrap the response in markdown blocks (no \`\`\`json or \`\`\`), do NOT include any backticks or markdown formatting, and do NOT output any introductory or explanatory text. It must be directly parseable.
    - All text explanation fields in the output JSON ("insight", "explanation", "predictedMove") MUST be extremely concise: strictly 2 short sentences maximum.
    - Total length of any text explanation field must not exceed 30 words.
    - Be punchy, direct, and focus ONLY on the core metrics without any fluff, storytelling, or filler words.
    - Deliver the final JSON immediately.

    REQUIRED SCHEMA:
    {
      "insight": "string detailed insight into current market conditions",
      "sentiment": {
        "score": number (-1 to 1),
        "label": "bullish" | "bearish" | "neutral",
        "explanation": "string short explanation for the sentiment"
      },
      "predictedMove": "string prediction for the next 48 hours"
    }`;

    const completion = await openai.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const text = completion.choices[0]?.message?.content || '{}';
    
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

    const parsedData = cleanAndParseJson(text);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Groq error:', error);
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
  }
}
