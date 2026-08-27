import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { gameName, targetPreference, userSpecs } = req.body || {};
  const isQuality = targetPreference === "Quality";
  const gpuName = userSpecs?.gpu || "RTX 3060";

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = `Optimize settings for ${gameName} aiming for ${targetPreference}.\n\n`;
      if (userSpecs) {
        prompt += `User Specs: ${JSON.stringify(userSpecs)}\n\n`;
      }
      prompt += `Output a JSON object exactly matching this format:\n{\n  "game": "${gameName}",\n  "targetFps": "string",\n  "estimatedFps": "string",\n  "resolution": "string",\n  "upscaling": "string",\n  "settings": [{ "category": "Graphics/Display/System", "name": "Setting name", "value": "Recommended Value", "impact": "Low/Medium/High/Ultra", "tip": "Why change this" }],\n  "launchOptions": "Optional Steam launch options",\n  "proTip": "One secret trick"\n}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a game optimization AI. Return valid JSON only, no markdown formatting like ```json.",
          temperature: 0.1,
        },
      });

      const jsonText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      return res.status(200).json(JSON.parse(jsonText));
    } catch (err) {
      console.warn("Vercel optimize-settings API fallback:", err);
    }
  }

  return res.status(200).json({
    game: gameName || "Universal Gaming Optimization",
    targetFps: isQuality ? "60-90 FPS (Max Visuals)" : "144-240 FPS (Competitive)",
    estimatedFps: isQuality ? "~75 FPS" : "~165 FPS",
    resolution: userSpecs?.resolution || "1920x1080 (1080p)",
    upscaling: isQuality ? "DLSS / FSR Quality" : "DLSS / FSR Performance",
    settings: [
      { category: "Display", name: "Display Mode", value: "Fullscreen Exclusive", impact: "High", tip: "Bypasses Desktop Window Manager (DWM) latency." },
      { category: "Graphics", name: "Volumetric Clouds & Fog", value: isQuality ? "Medium" : "Low / Off", impact: "Ultra", tip: "Saves up to 25% GPU compute cycles with minimal visual difference." },
      { category: "Graphics", name: "Shadow Quality", value: isQuality ? "High" : "Medium", impact: "High", tip: "Balances shadow map resolution and VRAM bandwidth." },
      { category: "Graphics", name: "Motion Blur & Chromatic Aberration", value: "Disabled", impact: "Low", tip: "Provides instant competitive clarity during fast mouse movements." },
      { category: "System", name: "NVIDIA Reflex / AMD Anti-Lag", value: "Enabled + Boost", impact: "High", tip: "Reduces system-wide end-to-end click-to-photon latency." }
    ],
    launchOptions: "-novid -high -fullscreen +mat_queue_mode 2",
    proTip: `For ${gpuName}, lock in-game FPS 3 frames below refresh rate to prevent GPU queue buffer saturation.`
  });
}
