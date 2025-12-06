import { GoogleGenAI } from "@google/genai";
import { Item, Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWarehouseReport = async (
  inventory: Item[],
  transactions: Transaction[],
  query: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "عذراً، مفتاح API غير متوفر. لا يمكن استخدام المساعد الذكي حالياً.";
  }

  try {
    const prompt = `
      أنت مساعد ذكي لأمين مستودع في قسم تقنية التصنيع.
      
      البيانات الحالية للمستودع:
      ${JSON.stringify(inventory)}
      
      سجل العمليات الحديثة:
      ${JSON.stringify(transactions.slice(0, 20))}
      
      المطلوب:
      ${query}
      
      أجب باللغة العربية بأسلوب مهني ومختصر. نسق الإجابة بنقاط إذا لزم الأمر.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لم يتم استلام رد من النظام.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء تحليل البيانات.";
  }
};