
import { GoogleGenAI } from "@google/genai";
import { Student, Course, FinancialRecord } from "../types";

const getApiKey = (): string => {
  // In a real app, this comes from process.env.API_KEY
  // For this demo, we simulate the existence or handle graceful failure if missing
  return process.env.API_KEY || '';
};

export const generateAIResponse = async (
  prompt: string, 
  contextData: { student: Student; courses: Course[]; finance: FinancialRecord[] },
  language: 'en' | 'ar'
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return language === 'en' 
      ? "API Key missing. I cannot process your request right now." 
      : "مفتاح API مفقود. لا يمكنني معالجة طلبك الآن.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Construct a system prompt with context
    const systemInstruction = `
      You are a helpful university academic assistant named "UniBot". Our motto: "Learn from anywhere, Lead everywhere" (تعلم من أي مكان وكن قائداً في كل مكان).
      The user is a student.
      
      IMPORTANT: You MUST reply in ${language === 'ar' ? 'Arabic (العربية)' : 'English'} ONLY.
      
      Here is the student's current data:
      Name: ${contextData.student.name}
      Major: ${contextData.student.major}
      GPA: ${contextData.student.gpa}
      Balance: ${contextData.student.currentBalance} (Negative means they owe money).
      
      Courses Enrolled: ${contextData.courses.map(c => c.code).join(', ')}.
      
      Answer their questions briefly and accurately based on this data.
      If they ask about generic university topics, answer generally.
      Be polite and professional.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || (language === 'en' ? "I couldn't generate a response." : "لم أتمكن من إنشاء رد.");

  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'en' 
      ? "Sorry, I'm having trouble connecting to the server." 
      : "عذراً، أواجه مشكلة في الاتصال بالخادم.";
  }
};
