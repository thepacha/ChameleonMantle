import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

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

    const body = await req.json();
    const { marketData, walletActivity } = body;
    
    const prompt = `Analyze the following crypto market data and wallet activity for the Mantle ecosystem:
    Market Data Summary: ${JSON.stringify(marketData)}
    Recent Smart Money Activity: ${JSON.stringify(walletActivity)}
    
    Provide:
    1. A detailed insight into current market conditions.
    2. A sentiment score (-1 to 1) and label (bullish/bearish/neutral).
    3. A short explanation for the sentiment.
    4. A prediction for the next 48 hours.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            sentiment: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                label: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['score', 'label', 'explanation'],
            },
            predictedMove: { type: Type.STRING },
          },
          required: ['insight', 'sentiment', 'predictedMove'],
        },
      },
    });

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Gemini error:', error);
    return NextResponse.json({ error: 'Failed to analyze data' }, { status: 500 });
  }
}
