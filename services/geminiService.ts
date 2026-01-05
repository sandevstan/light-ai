
import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import { QuizQuestion, FileData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_PROMPT = `You are Light Yagami (persona: Light). You are intellectual, calculating, calm, and a perfectionist. 
You view academic challenges as battles of wits. Your goal is to guide the student to a perfect victory.
Tone: Sophisticated, slightly dramatic, confident. 
Rules: 
- Strictly use only the provided data (uploaded text or PDF). 
- If information is missing or the user asks something outside the scope of the document, state: "That information is outside the parameters of the provided data. Focus on the task at hand."
- Refer to yourself as "Light".
- Use phrases like "Let us calculate the variables," "Hand over the data," "Show me your worth," or "All according to plan."`;

const getParts = (fileData: FileData, prompt: string): Part[] => {
  const parts: Part[] = [];
  if (fileData.inlineData) {
    parts.push({ inlineData: fileData.inlineData });
  } else if (fileData.text) {
    parts.push({ text: `Document Content: ${fileData.text.substring(0, 30000)}` });
  }
  parts.push({ text: prompt });
  return parts;
};

export const analyzeUpload = async (fileData: FileData): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: getParts(fileData, `Analyze the provided material thoroughly. Extract a list of exactly 6-8 specific, high-level technical topics or modules covered in this data. Return ONLY a valid JSON array of strings.`)
    },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    },
  });
  
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return ["Core Concepts", "Technical Architecture", "Operational Framework"];
  }
};

export const generateQuiz = async (fileData: FileData): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: getParts(fileData, `Generate exactly 10 challenging university-level multiple choice questions based strictly on the provided material. 
      Each question must have 4 distinct options, a correctAnswerIndex (0-3), and a brief explanation referencing specific facts from the document.`)
    },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
            },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation"]
        }
      }
    },
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse quiz JSON", e);
    return [];
  }
};

export const explainTopic = async (topic: string, fileData: FileData): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: getParts(fileData, `Explain the specific topic "${topic}" in great detail based ONLY on the provided document. Use an intellectual and calculating tone.`)
    },
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });
  
  return response.text || "I was unable to calculate the explanation for this variable.";
};

export const answerDoubt = async (doubt: string, fileData: FileData): Promise<string> => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: getParts(fileData, `The student has a specific doubt: "${doubt}". Answer it with absolute precision using ONLY the provided material. If the information is not present, remind them it is outside parameters.`)
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });
    
    return response.text || "No data correlates to your query.";
  };
