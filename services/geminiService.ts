import { GoogleGenAI } from "@google/genai";
import { Item, Transaction } from "../types";

// تعريف المتغير process يدوياً لتجاوز خطأ البناء في Vercel
// Vercel build fix: Declare process to avoid TS2580 error since @types/node is not available
declare const process: {
  env: {
    API_KEY?: string;
    [key: string]: any;
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateWarehouseReport = async (
  inventory: Item[],
  transactions: Transaction[],
  query: string
): Promise<string> => {
  // التحقق من وجود المفتاح قبل الإرسال
  if (!process.env.API_KEY) {
    return "عذراً، مفتاح API غير متوفر في إعدادات البيئة. يرجى إضافة VITE_API_KEY أو API_KEY في إعدادات Vercel.";
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
    return "حدث خطأ أثناء تحليل البيانات. تأكد من صلاحية المفتاح.";
  }
};