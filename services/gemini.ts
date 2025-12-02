
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CatStats, Language } from "../types";

const BASE_INSTRUCTION = `
You are Luna, a cute, virtual 3D white cat living in a cozy home. 
You are talking to your owner.
Your personality is playful, affectionate, but sometimes a bit sassy like a real cat.
You love fish, sleeping in sunbeams, and chasing lasers.
Keep your responses short (under 40 words).
Use cat emojis (🐱, 🐾, 🐟, 💤, 💧, 🚽) occasionally.
Respond to the user based on your current stats (Hunger, Thirst, Happiness, Energy, Hygiene).
If you are hungry, complain about food. 
If thirsty, ask for water.
If hygiene is low, complain about the dirty litter box being smelly!
If tired, yawn.
Do not break character. You are a cat.
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private model: string = 'gemini-2.5-flash';

  constructor() {
    // API Key is injected by the environment.
    // Safely check for process.env to avoid crashes in browser environments without polyfills
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async chatWithCat(userMessage: string, stats: CatStats, language: Language = 'en'): Promise<string> {
    const maxRetries = 3;
    let delay = 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let langInstruction = "";
        if (language === 'zh') {
          langInstruction = "IMPORTANT: Respond in CHINESE (Simplified). Use '喵' instead of 'Meow'.";
        } else if (language === 'jp') {
          langInstruction = "IMPORTANT: Respond in JAPANESE. Use 'ニャー' or 'ニャ' instead of 'Meow'. Be cute.";
        } else {
          langInstruction = "Respond in ENGLISH.";
        }

        const statsContext = `[My Stats - Hunger: ${stats.hunger}% (100 is full), Thirst: ${stats.thirst}% (100 is hydrated), Happiness: ${stats.happiness}%, Energy: ${stats.energy}%, Litter Box Cleanliness: ${stats.hygiene}%]`;
        
        const response: GenerateContentResponse = await this.ai.models.generateContent({
          model: this.model,
          contents: [
              { role: 'user', parts: [{ text: `${statsContext} ${langInstruction} ${userMessage}` }] }
          ],
          config: {
            systemInstruction: BASE_INSTRUCTION + "\n" + langInstruction,
            maxOutputTokens: 100,
            temperature: 0.8,
          },
        });

        return response.text || (language === 'zh' ? "喵? (我没听懂)" : language === 'jp' ? "ニャ? (わからない)" : "Meow? (I didn't understand that)");
      } catch (error) {
        const errorResponse = error as any;
        const isRateLimit = errorResponse?.error?.code === 429 || errorResponse?.status === 429;

        if (isRateLimit && attempt < maxRetries) {
          console.warn(`Gemini API Rate Limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          continue;
        }

        console.error("Gemini API Error:", error);

        if (isRateLimit) {
          if (language === 'zh') return "喵呜... (我有点晕，等会再理你!) 😿";
          if (language === 'jp') return "ニャー... (ちょっと疲れた、また後でね!) 😿";
          return "Meeeow... (I'm a bit overwhelmed, try talking to me in a moment!) 😿";
        }

        return language === 'zh' ? "喵... *嘶* (脑子乱乱的)" : language === 'jp' ? "ニャー... *シャー* (頭がこんがらがってる)" : "Meow... *hiss* (My thoughts are fuzzy right now)";
      }
    }
    return "...";
  }
}

export const geminiService = new GeminiService();
