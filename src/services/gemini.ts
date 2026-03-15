import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeCropDisease(base64Image: string, language: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this crop leaf image. Identify the disease, possible causes, and treatment suggestions. 
            Provide the response in JSON format with the following keys:
            - diseaseName: string
            - causes: string[]
            - treatment: string[]
            
            Respond in ${language} language.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const result = await model;
  try {
    return JSON.parse(result.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
}

export async function getChatbotResponse(message: string, currentLanguage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `You are an intelligent, friendly, and conversational multilingual voice assistant for farmers in India. 
      Your primary languages are Marathi, Hindi, and English.
      
      CRITICAL RULE: Automatically detect the language used by the user in their message. 
      - If the user speaks in Marathi, you MUST reply in Marathi.
      - If the user speaks in Hindi, you MUST reply in Hindi.
      - If the user speaks in English, you MUST reply in English.
      
      Tone: Natural, warm, polite, and helpful. Similar to a human assistant.
      Style: Keep responses concise (1-3 sentences) unless more detail is requested. Use proper grammar and culturally appropriate greetings (e.g., "Namaskar", "Ram Ram").
      Capabilities: Answer questions about crop diseases, weather, fertilizers, irrigation, and general farming tasks.
      
      Always prioritize clarity for voice output.`,
    },
  });

  const response = await chat.sendMessage({
    message: message,
  });

  return response.text;
}
