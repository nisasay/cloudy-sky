import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', appName: 'Daily Sky Financial Companion' });
});

// Hesitation Assistant API (Natural Language Analysis)
app.post('/api/hesitation-advice', async (req, res) => {
  try {
    const {
      userInput = '',
      currentBudget = 3000,
      budgetSpent = 1200,
      remainingBudget = 1800,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    const formatFallback = (inputStr: string) => {
      const priceMatch = inputStr.match(/(\d+(\.\d+)?)/);
      const parsedPrice = priceMatch ? parseFloat(priceMatch[1]) : 200;
      const cleanedName = inputStr
        .replace(/我想买|想买|买|一把|一个|一件|一块|包|双|只|条|台|套|顿|￥|\$|元|块|/g, '')
        .replace(/(\d+(\.\d+)?)/g, '')
        .trim() || '意向商品';

      const coffeeCount = Math.max(1, Math.round(parsedPrice / 30));
      const remBud = Math.max(1, remainingBudget || currentBudget - budgetSpent || 1000);
      const pct = Math.min(100, Math.round((parsedPrice / remBud) * 100));

      const isCooling = pct > 15 || parsedPrice >= 300;

      return {
        itemName: cleanedName,
        itemPrice: parsedPrice,
        equivalentCoffee: coffeeCount,
        budgetPercentage: pct,
        equivalentText: `相当于 ${coffeeCount} 杯咖啡 ☕，约占本月剩余预算的 ${pct}%`,
        impactAnalysis: isCooling
          ? `「${cleanedName}」金额为 ¥${parsedPrice}，占据了本月剩余预算的 ${pct}%。在当前预算节奏下属于一笔不小的额外支出，建议考量是否属于当下刚需。`
          : `「${cleanedName}」金额为 ¥${parsedPrice}，占本月剩余预算仅 ${pct}%，总体处于较为轻量的掌控范围内。`,
        recommendation: isCooling ? 'cooling' : 'buy',
        recommendationLabel: isCooling ? '冷静一下 (Cooling Off)' : '值得购买 (Go Ahead)',
        advice: isCooling
          ? `建议放入 24 小时冷静胶囊。如果明天此时内心依然满怀期待，再从容购买也不迟！`
          : `该支出对预算影响较小，若能带来持续愉悦感，可以放心拥抱它。`,
      };
    };

    if (!apiKey) {
      return res.json(formatFallback(userInput));
    }

    const ai = getGeminiClient();

    const prompt = `
You are Daily Sky's "Hesitation Assistant" (纠结小助手), an empathetic, intelligent AI financial counselor.

USER NATURAL LANGUAGE INPUT: "${userInput}"

USER FINANCIAL CONTEXT:
- Total Monthly Budget: ¥${currentBudget}
- Spent So Far: ¥${budgetSpent}
- Remaining Monthly Budget: ¥${remainingBudget}

TASK:
Analyze this potential extra expense based on user input and financial context.
Output strictly valid JSON with the following schema (no markdown block fences, raw JSON only):
{
  "itemName": string, // extracted concise item name (e.g. "人体工学椅")
  "itemPrice": number, // extracted numeric price (e.g. 450)
  "equivalentCoffee": number, // equivalent count of coffee cups (assume ~30 RMB per cup)
  "budgetPercentage": number, // percentage of remaining monthly budget (0-100)
  "equivalentText": string, // e.g. "相当于 15 杯咖啡 ☕，约占本月剩余预算的 25%"
  "impactAnalysis": string, // Frequency & impact analysis + rational advice (2-3 warm sentences in Chinese)
  "recommendation": "cooling" | "buy", // "cooling" if impulse/significant budget hit, "buy" if reasonable/high value
  "recommendationLabel": string, // e.g. "冷静一下 (Cooling Off)" or "值得购买 (Go Ahead)"
  "advice": string // final encouraging or cooling advice summary
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Daily Sky Hesitation Assistant. Return strict JSON only. Be empathetic, warm, clear, and analytical.',
      },
    });

    const rawText = response.text || '';
    try {
      const cleanedJsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJsonText);
      res.json(parsed);
    } catch (e) {
      console.warn('JSON parse failed for hesitation advice, returning structured fallback:', rawText);
      res.json(formatFallback(userInput));
    }
  } catch (error: any) {
    console.error('Error generating hesitation advice:', error);
    res.status(500).json({
      error: 'Failed to generate advice from Hesitation Assistant',
      details: error?.message || 'Unknown error',
    });
  }
});

// Monthly 3-Sentence AI Emotional Summary API
app.post('/api/monthly-ai-summary', async (req, res) => {
  try {
    const {
      monthName,
      totalBudget,
      totalSpent,
      categories,
      impulseMoneySaved,
      fulfilledWishesCount,
      abandonedWishesCount,
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        summary: [
          `[Rhythm Summary] This month you stayed mindful with $${totalSpent.toFixed(0)} spent out of $${totalBudget.toFixed(0)} budget.`,
          `[Joy Preference] Your spending leaned towards small everyday pleasures that kept your spirit bright.`,
          `[Impulse Battle Report] You successfully blocked $${impulseMoneySaved.toFixed(0)} in impulsive desires and granted yourself ${fulfilledWishesCount} meaningful wishes!`,
        ],
      });
    }

    const ai = getGeminiClient();

    const prompt = `
Generate a 3-Sentence AI Emotional Monthly Summary for the "Daily Sky" app for ${monthName || 'this month'}.

DATA:
- Total Budget: $${totalBudget}
- Total Spent: $${totalSpent} (Spent %: ${((totalSpent / (totalBudget || 1)) * 100).toFixed(1)}%)
- Top Cloud Categories: ${JSON.stringify(categories || [])}
- Impulse Money Blocked (Saved from abandoned wishes): $${impulseMoneySaved}
- Fulfilled Wishes: ${fulfilledWishesCount}
- Abandoned Wishes: ${abandonedWishesCount}

FORMAT REQUIRED:
Return EXACTLY 3 bullet sentences starting with the exact tags:
- [Rhythm Summary] <One clear sentence summarizing spending rhythm vs budget with emotional warmth>
- [Joy Preference] <One sentence identifying what brought genuine joy vs mindless spending>
- [Impulse Battle Report] <One sentence celebrating impulse wishes blocked and money preserved>
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    res.json({
      rawText,
      lines,
    });
  } catch (error: any) {
    console.error('Error generating monthly AI summary:', error);
    res.status(500).json({
      error: 'Failed to generate monthly summary',
      details: error?.message || 'Unknown error',
    });
  }
});

export default app;
