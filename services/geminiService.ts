import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { TranslationStyle, Relationship, GlossaryTerm, ModelType } from "../types";

const apiKey = process.env.API_KEY;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey });

export const translateText = async (
  text: string, 
  model: ModelType,
  style: TranslationStyle = 'default',
  relationships: Relationship[] = [],
  glossary: GlossaryTerm[] = []
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

  // Construct glossary instruction
  let glossaryInstruction = "";
  if (glossary.length > 0) {
    const terms = glossary.map(g => `- ${g.source} = ${g.target}`).join("\n");
    glossaryInstruction = `TỪ ĐIỂN THUẬT NGỮ / TÊN RIÊNG (BẮT BUỘC DÙNG CÁC TỪ TIẾNG VIỆT SAU ĐÂY THAY CHO TỪ GỐC, BỎ QUA QUY TẮC 1 VỚI NHỮNG TỪ NÀY):\n${terms}`;
  }

  // Combine instructions
  const parts = [text];
  if (styleInstruction) parts.push(`[${styleInstruction}]`);
  if (relationshipInstruction) parts.push(`[${relationshipInstruction}]`);
  if (glossaryInstruction) parts.push(`[${glossaryInstruction}]`);

  const finalContent = parts.join("\n\n");

  try {
    const response = await ai.models.generateContent({
      model: model,
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