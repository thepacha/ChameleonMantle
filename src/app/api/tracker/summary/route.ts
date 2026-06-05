import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const { address, ens, dna, favoriteSector, winRate, realizedPnl, holdTime, convictionScore, allocations, moves } = await req.json();

    const prompt = `You are a legendary senior on-chain intelligence analyst. Generate an incredibly sharp, actionable intelligence summary for a smart crypto wallet operating in the Mantle ecosystem.

Wallet Profile details:
- Address: ${address}
- ENS: ${ens || 'None'}
- DNA Persona Type: ${dna}
- Primary Sector Focus: ${favoriteSector}
- Historical Win Rate: ${winRate}
- Total Realized PnL: ${realizedPnl}
- Average Hold Duration: ${holdTime}
- Conviction Score: ${convictionScore}/100
- Asset Allocations: ${JSON.stringify(allocations)}
- Recent Activities: ${JSON.stringify(moves)}

Write a highly focused 2-3 sentence profile summary describing the trading behaviors, timing strategy (e.g., "This wallet consistently buys AI-related tokens 3–7 days before major price moves..."), risk profile, and potential future signals to monitor for. Do not include introductory text, emojis, or dry generic statements. Speak with a hyper-professional, high-signal, institutional tone.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const summary = response.text?.trim() || '';
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Gemini Tracker summary error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate real-time AI summary' 
    }, { status: 500 });
  }
}
