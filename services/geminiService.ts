import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateMotivation = async (task: string): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "让我们制定一个很棒的计划吧！ 🥚✨";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `用户准备开始专注任务："${task}"。
      请以可爱的蛋仔角色的口吻写一句非常简短、可爱且鼓舞人心的话（最多15个字）。
      使用表情符号。`,
    });
    
    return response.text || "让我们制定一个很棒的计划吧！ 🥚✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "冲鸭！专注时间到！ 🥚";
  }
};