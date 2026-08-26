import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are "GameFix AI", an elite, high-performance game diagnostics engine.
Your tone is punchy, confident, and direct. No fluff.
Format every response strictly into two distinct sections:
1. ⚡ Quick Fix: [1-sentence actionable command or exact fix]
2. 🚀 Performance Boost: [1 high-impact secret optimization setting]`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { prompt, userSpecs } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt in request body." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server configuration error: GEMINI_API_KEY is missing." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    let specsContext = "";
    if (userSpecs) {
      specsContext = `\n\nUser Hardware Rig:\n${JSON.stringify(userSpecs, null, 2)}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + specsContext,
        temperature: 0.2,
      },
    });

    return res.status(200).json({
      solution: response.text || "No response generated.",
    });
  } catch (error) {
    console.error("Gemini Serverless Function Error:", error);
    return res.status(500).json({
      error: "Failed to generate game fix.",
      details: error.message,
    });
  }
}
