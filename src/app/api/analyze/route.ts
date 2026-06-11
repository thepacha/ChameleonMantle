import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
        "X-Title": "Chameleon",
      }
    });

    const body = await req.json();
    const { marketData, walletActivity } = body;
    
    const prompt = `Analyze the following crypto market data and wallet activity for the Mantle ecosystem:
    Market Data Summary: ${JSON.stringify(marketData)}
    Recent Smart Money Activity: ${JSON.stringify(walletActivity)}
    
    Provide a detailed behavioral assessment in strictly valid JSON format.
    The response must be strictly formatted as JSON to be directly passed as arguments to smart contract function calls.
    Do NOT include any markdown formatting (like \`\`\`json or backticks) in your output. Just return the raw JSON object.

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
      model: "google/gemma-4-31b-it:free",
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
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }
      return JSON.parse(cleaned);
    }

    const parsedData = cleanAndParseJson(text);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('OpenRouter error:', error);
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
  }
}
