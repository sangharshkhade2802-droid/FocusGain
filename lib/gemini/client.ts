import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!apiKey) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

export const hasGeminiKey = (): boolean => {
  return !!apiKey && apiKey !== 'your-gemini-api-key' && apiKey.length > 5;
};
