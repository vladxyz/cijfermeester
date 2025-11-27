import { GoogleGenAI } from "@google/genai";
import { Module, Course } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const getStudyAdvice = async (
  module: Module,
  neededGrade: number,
  remainingCourses: Course[]
): Promise<string> => {
  const ai = getClient();
  
  const courseNames = remainingCourses.map(c => `${c.name} (weging: ${c.weight})`).join(', ');
  
  const prompt = `
    Ik ben een student in het Nederlandse onderwijssysteem (cijfers 1-10).
    Ik volg de module "${module.name}".
    Om mijn doel te halen (gemiddeld een ${module.targetAverage || module.minAverage}), moet ik gemiddeld een **${neededGrade.toFixed(1)}** halen voor de resterende vakken: ${courseNames}.
    
    Geef me een kort, motiverend en strategisch studieplan. 
    Focus op time-management en prioriteiten stellen gezien de weging van de vakken.
    Als het cijfer onrealistisch hoog is (>9), geef dan advies over wat te doen (bijv. docent spreken, herexamen strategie).
    Houd het beknopt (max 150 woorden) en gebruik opmaak (bullet points).
    Spreek Nederlands.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    return response.text || "Kon geen advies genereren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is iets misgegaan bij het ophalen van advies. Controleer je internetverbinding of API sleutel.";
  }
};
