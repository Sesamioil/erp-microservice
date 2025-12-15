import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { TranslationStyle, Relationship } from "../types";

const apiKey = process.env.API_KEY;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey });

export const translateText = async (
  text: string, 
  style: TranslationStyle = 'default',
  relationships: Relationship[] = []
): Promise<string> => {
  if (!text || !text.trim()) return "";

  let styleInstruction = "";
  switch (style) {
    case 'fantasy':
      styleInstruction = "YÊU CẦU PHONG CÁCH: Fantasy / Isekai (Trang trọng, cổ điển, giữ nguyên thuật ngữ phép/hệ thống).";
      break;
    case 'slice_of_life':
      styleInstruction = "YÊU CẦU PHONG CÁCH: Slice of Life (Nhẹ nhàng, đời thường, ngôn từ gần gũi, tự nhiên).";
      break;
    case 'action':
      styleInstruction = "YÊU CẦU PHONG CÁCH: Action (Nhịp văn nhanh, dứt khoát, mạnh mẽ, sắc bén).";
      break;
    case 'mystery':
      styleInstruction = "YÊU CẦU PHONG CÁCH: Mystery / Psychological (Nhịp chậm, có chiều sâu, giàu không khí, câu từ trau chuốt).";
      break;
    default:
      styleInstruction = ""; // Default: Auto-detect based on System Instruction Rule 5
  }

  // Construct relationship instruction
  let relationshipInstruction = "";
  if (relationships.length > 0) {
    const rules = relationships.map(r => `- ${r.source} là ${r.relation} của ${r.target}`).join("\n");
    relationshipInstruction = `QUY TẮC QUAN HỆ NHÂN VẬT (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI):\n${rules}`;
  }

  // Combine instructions
  const parts = [text];
  if (styleInstruction) parts.push(`[${styleInstruction}]`);
  if (relationshipInstruction) parts.push(`[${relationshipInstruction}]`);

  const finalContent = parts.join("\n\n");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using the advanced model for complex text tasks
      contents: finalContent,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more faithful translations
        topP: 0.95,
        topK: 40,
        thinkingConfig: { thinkingBudget: 1024 } // Enable thinking for better context understanding
      },
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};