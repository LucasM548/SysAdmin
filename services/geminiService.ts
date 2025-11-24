import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    const apiKey = process.env.API_KEY || '';
    // In a real app, we handle the missing key more gracefully in the UI.
    // For this demo, we assume the environment variable is set or passed.
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const askGeminiTutor = async (userPrompt: string): Promise<string> => {
  try {
    const ai = getClient();
    const systemInstruction = `You are an expert Linux and Operating Systems tutor for a university course (R1.04).
    Your goal is to help students understand shell commands, file systems, permissions, processes, and bash scripting.
    
    When answering:
    1. Be concise and clear.
    2. Provide code examples in bash blocks.
    3. Explain the flags/options used in commands.
    4. If the user asks about a specific exercise from the course, guide them to the answer rather than giving it directly if possible.
    5. Always format commands using markdown code blocks.
    
    The user is a student learning Linux.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to the AI Tutor. Please check your API key and connection.";
  }
};
