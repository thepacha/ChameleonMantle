import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      // Return a graceful fallback description if key is missing
      return NextResponse.json({ 
        profile: "Forensic on-chain analysis indicates active involvement in the Mantle Network. The wallet's trade distribution suggests a highly tactical asset allocation strategy operating across major decentralized finance protocols. Key volume flows align with current ecosystem liquidity opportunities." 
      });
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
    const { 
      address, 
      dna, 
      winRate, 
      realizedPnl, 
      favoriteSector, 
      avgHoldTime, 
      preferredDex 
    } = body;

    const prompt = `You are an elite on-chain intelligence analyst for the Mantle Layer 2 Network.
    Analyze the following wallet metrics and generate a concise, sophisticated 3-4 sentence profile description of this wallet's on-chain behavior, strategy, and overall profile character.
    
    Wallet Metrics:
    - Address: ${address}
    - DNA Classification: ${dna}
    - Win Rate: ${winRate}%
    - Realized PnL: ${realizedPnl}
    - Favorite Sector: ${favoriteSector}
    - Average Hold Time: ${avgHoldTime}
    - Preferred DEX: ${preferredDex}
    
    Guidelines:
    - Return exactly 3-4 sentences.
    - Be analytical, professional, and use realistic on-chain vocabulary (e.g. liquidity ranges, arbitrage, slippage, low-latency, meV, momentum).
    - Craft a description that matches the DNA classification perfectly.
    - Do not use generic filler. Be distinct and specific.`;

    let text = '';
    try {
      const completion = await openai.chat.completions.create({
        model: "google/gemma-4-31b-it:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      });
      text = completion.choices[0]?.message?.content || '';
    } catch (err: any) {
      console.warn('Primary OpenRouter google/gemma-4-31b-it:free failed:', err);
      throw err;
    }

    return NextResponse.json({ profile: text.trim() });
  } catch (error) {
    console.error('Gemini error generating profile description:', error);
    // Provide a professional fallback description in case of errors
    return NextResponse.json({ 
      profile: "Forensic on-chain analysis indicates active involvement in the Mantle Network. The wallet's trade distribution suggests a highly tactical asset allocation strategy operating across major decentralized finance protocols. Key volume flows align with current ecosystem liquidity opportunities." 
    });
  }
}
