import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { logText, gameName, userSpecs } = req.body || {};

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      let prompt = `Analyze this crash log for the game: ${gameName || "Unknown"}\n\n`;
      if (userSpecs) {
        prompt += `User Specs: ${JSON.stringify(userSpecs)}\n\n`;
      }
      prompt += `Log Content:\n${logText}\n\nOutput a JSON object exactly matching this format:\n{\n  "summary": "1 sentence overview",\n  "rootCause": "The core technical reason",\n  "culpritModule": "e.g., nvlddmkm.sys",\n  "steps": ["Step 1", "Step 2"],\n  "proTip": "A useful pro tip"\n}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a crash log analyzer. Return valid JSON only, no markdown formatting like ```json.",
          temperature: 0.1,
        },
      });

      const jsonText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      return res.status(200).json(JSON.parse(jsonText));
    } catch (err) {
      console.warn("Vercel diagnose-log API fallback:", err);
    }
  }

  // Offline fallback analysis
  const log = (logText || "").toLowerCase();
  let culprit = "Graphics Driver / Direct3D";
  let cause = "GPU device lost or driver execution timeout (TDR).";
  let steps = [
    "Press Win + Ctrl + Shift + B to restart GPU subsystem.",
    "Increase Windows TDR delay to 8 seconds in registry (TdrDelay).",
    "Perform a clean driver install using Display Driver Uninstaller (DDU)."
  ];

  if (log.includes("nvlddmkm") || log.includes("nvoglv64") || log.includes("nvd3dumx")) {
    culprit = "nvlddmkm.sys (NVIDIA Driver)";
    cause = "NVIDIA display driver timeout during shader execution.";
    steps = ["Clean install latest GeForce driver with DDU in Safe Mode.", "Turn off GPU overclock and set Power Management to Maximum Performance."];
  } else if (log.includes("0xc0000005") || log.includes("access_violation")) {
    culprit = "Memory Access Violation (0xC0000005)";
    cause = "Invalid memory pointer dereference or corrupted game binaries.";
    steps = ["Run sfc /scannow in Admin CMD.", "Reinstall Microsoft Visual C++ 2015-2022 Redistributable (x86 & x64)."];
  }

  return res.status(200).json({
    summary: `Critical crash detected in ${gameName || "Application"}: ${cause}`,
    rootCause: cause,
    culpritModule: culprit,
    steps: steps,
    proTip: "Use RivaTuner Statistics Server (RTSS) to cap framerates and prevent sudden GPU power spikes."
  });
}
