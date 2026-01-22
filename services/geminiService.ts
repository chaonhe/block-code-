
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Strictly use process.env.API_KEY for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCodeFromPrompt = async (prompt: string, language: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      // Fix: Use 'gemini-3-pro-preview' for complex coding tasks
      model: 'gemini-3-pro-preview',
      contents: `Generate a code snippet for the following requirement: "${prompt}". 
                 The language should be "${language}". 
                 Only return the raw code, do not include markdown backticks or explanations.`,
    });
    // Fix: Access response.text directly (it is a property)
    return response.text || '// Failed to generate code';
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `// Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const suggestBlockContent = async (context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this existing content: "${context}", suggest the next logical paragraph or code block description. Keep it short.`,
    });
    // Fix: Access response.text directly
    return response.text || '';
  } catch (error) {
    return '';
  }
};
