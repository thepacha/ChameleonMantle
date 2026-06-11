import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { getScannedWhales, getScannedRecentMoves } from "@/src/lib/smart-money-scanner";

// Simple in-memory global cache for high availability & rate-limit bypassing
interface PriceState {
  price: number;
  change24h: number;
  insight: string;
  lastUpdated: number;
}

let cachedState: PriceState = {
  price: 0.54,
  change24h: 2.34,
  insight: "MNT is climbing with active on-chain accumulation.",
  lastUpdated: Date.now(),
};

// Lazy initialization of OpenAI API for OpenRouter to prevent crashing on startups with missing keys
let aiClient: OpenAI | null = null;
function getAiClient(): OpenAI | null {
  if (!aiClient) {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey,
        defaultHeaders: {
          "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
          "X-Title": "Chameleon",
        }
      });
    }
  }
  return aiClient;
}

// Fallback rule-based generator if Gemini is missing or fails
function getDeterministicInsight(price: number, change: number, whaleCount: number): string {
  const absChange = Math.abs(change).toFixed(1);
  if (change > 1.5) {
    return `MNT is up ${absChange}% in the last 24h, indicating strong buying pressure.`;
  } else if (change < -1.5) {
    if (whaleCount > 5) {
      return `MNT is down ${absChange}% while whale accumulation increased, suggesting possible long-term accumulation.`;
    }
    return `MNT is down ${absChange}% with some selling pressure, monitoring whale activity closely.`;
  } else {
    return `MNT is trading sideways with low volatility and no unusual whale activity detected.`;
  }
}

export async function GET() {
  let isFallback = false;
  
  try {
    // 1. Fetch real-time price from CoinGecko public API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
    
    const coingeckoUrl = "https://api.coingecko.com/api/v3/simple/price?ids=mantle&vs_currencies=usd&include_24hr_change=true";
    const res = await fetch(coingeckoUrl, {
      signal: controller.signal,
      next: { revalidate: 45 }, // Cache edge/next revalidation
      headers: { "Accept": "application/json" }
    });
    
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const json = await res.json();
      if (json && json.mantle && typeof json.mantle.usd === "number") {
        cachedState.price = json.mantle.usd;
        cachedState.change24h = json.mantle.usd_24h_change || 0;
        cachedState.lastUpdated = Date.now();
      } else {
        console.warn("CoinGecko responded with unexpected schema, using cache.");
        isFallback = true;
      }
    } else {
      console.warn(`CoinGecko request failed with status: ${res.status}. Loading from fallback cache.`);
      isFallback = true;
    }
  } catch (error) {
    console.error("CoinGecko API in-route fetching error:", error);
    isFallback = true;
  }

  // 2. Fetch context variables for intelligence generation
  let whalesCount = 0;
  let movesCount = 0;
  try {
    whalesCount = getScannedWhales().filter(w => w.mntBalance > 30000).length;
    movesCount = getScannedRecentMoves().length;
  } catch (e) {
    console.warn("Could not read scanner context for insight prompt:", e);
  }

  // 3. Generate AI market insight under 30 words
  let aiInsightDone = false;
  let customInsight = "";
  
  const ai = getAiClient();
  if (ai) {
    try {
      const priceText = `$${cachedState.price.toFixed(2)}`;
      const changeText = `${cachedState.change24h >= 0 ? "+" : ""}${cachedState.change24h.toFixed(2)}%`;
      
      const prompt = `Write a quick cryptocurrency market intelligence report for Mantle (MNT). Let's keep explanations under 30 words and updated every refresh cycle.
Details:
- Current MNT Price: ${priceText}
- 24h Change: ${changeText}
- Whales over 30K MNT tracked: ${whalesCount}
- On-chain moves observed: ${movesCount}

Rules:
- Strictly write under 30 words.
- Describe the momentum (e.g. up, down, or sideways) and relate to either whale volume, recent activities or buying pressure.
- Avoid repeating words unnecessary. Do not include markdown headers or brackets. Just return the text.

Example Responses:
"MNT is up 4.2% in the last 24h, indicating strong buying pressure."
"MNT is down 3.1% while whale accumulation increased, suggesting possible long-term accumulation."
"MNT is trading sideways with low volatility and no unusual whale activity detected."`;

      const completion = await ai.chat.completions.create({
        model: "google/gemma-4-31b-it:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });
      
      const responseText = completion.choices[0]?.message?.content || "";
      if (responseText) {
        customInsight = responseText.trim().replace(/^"|"$/g, ""); // clean wrapping quotes
        aiInsightDone = true;
      }
    } catch (e) {
      console.error("Gemini content generation failed:", e);
    }
  }

  // Fallback to rules-based insights if Gemini is unavailable, errors, or fails
  if (!aiInsightDone) {
    customInsight = getDeterministicInsight(cachedState.price, cachedState.change24h, whalesCount);
  }

  // Set the clean updated insight
  cachedState.insight = customInsight;

  return NextResponse.json({
    price: cachedState.price,
    change24h: cachedState.change24h,
    insight: cachedState.insight,
    lastUpdated: cachedState.lastUpdated,
    isFallback,
  });
}
