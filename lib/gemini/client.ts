import { GoogleGenerativeAI } from '@google/generative-ai';

const envApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

export const getGeminiModel = (customKey?: string, modelName = 'gemini-1.5-flash') => {
  const key = customKey?.trim() || envApiKey;
  if (!key || key === 'your-gemini-api-key' || key.length < 5) {
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({ model: modelName });
  } catch (err) {
    console.error('Error instantiating GoogleGenerativeAI:', err);
    return null;
  }
};

export const hasGeminiKey = (customKey?: string): boolean => {
  const key = customKey?.trim() || envApiKey;
  return !!key && key !== 'your-gemini-api-key' && key.length > 5;
};
