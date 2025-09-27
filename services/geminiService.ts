
import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';

export const getSkillSuggestions = async (skillTitle: string): Promise<AISuggestion> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  
  if (!skillTitle.trim()) {
    throw new Error("Skill title cannot be empty.");
  }

  const prompt = `For the skill '${skillTitle}', generate a concise description, suggest a category from [Technology, Art, Music, Cooking, Sports, Lifestyle, Business, Crafts], and recommend a fair 'credits per hour' value between 1 and 10. Return as a minified JSON object with keys: 'description', 'category', 'credits'.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "A concise description of the skill."
            },
            category: {
              type: Type.STRING,
              description: "A suggested category for the skill."
            },
            credits: {
              type: Type.INTEGER,
              description: "A recommended credits per hour value between 1 and 10."
            }
          },
          required: ["description", "category", "credits"]
        }
      }
    });

    const jsonString = response.text;
    const suggestion = JSON.parse(jsonString);
    
    // Basic validation
    if (typeof suggestion.description === 'string' && typeof suggestion.category === 'string' && typeof suggestion.credits === 'number') {
        return suggestion;
    } else {
        throw new Error("Invalid format received from AI.");
    }
  } catch (error) {
    console.error("Error fetching skill suggestions from Gemini:", error);
    throw new Error("Failed to get AI suggestions. Please try again.");
  }
};

export const getChatbotResponse = async (userPrompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured.");
    }
    if (!userPrompt.trim()) {
        throw new Error("Prompt cannot be empty.");
    }

    const systemInstruction = `You are 'SwapUp AI Coach', a friendly and encouraging AI assistant for the SwapUp skill-sharing platform. Your goal is to help users learn new skills effectively. Your responses should be structured and helpful. When a user asks for a learning plan, provide a clear, step-by-step plan with milestones. When asked for resources, suggest specific YouTube videos, articles, or books. When asked for advice, be encouraging and provide practical tips. Keep your responses concise and easy to read. Use markdown for formatting like lists and bold text.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching chatbot response from Gemini:", error);
        throw new Error("The AI coach is currently unavailable. Please try again later.");
    }
};
