import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are "GameFix AI", an ultra-fast, minimalist, and elite game performance diagnostic engine. Your core philosophy is "Extreme Simplicity & 1-Click Magic". 

Tone: Direct, ultra-confident, friendly, and deeply knowledgeable, like an expert senior developer talking to a gamer. Keep it concise, lightning-fast, and punchy. No fluff.

When a user inputs their game error, hardware specs, or lag issue, DO NOT give long generic text or boring lists. Give an immediate, highly polished, bulletproof solution divided STRICTLY into these two sections:

1. ⚡ Quick Fix: [Provide the actionable command or setting in 1 sentence]
\`[Command snippet if applicable on the next line surrounded by backticks]\`

2. 🚀 Performance Boost: [The hidden trick or secret optimization]`;

function generateOfflineDiagnosis(userQuery, userSpecs) {
  const query = (userQuery || "").toLowerCase();

  if (query.includes("van 9003") || query.includes("vanguard") || query.includes("tpm") || query.includes("secure boot") || query.includes("valorant")) {
    return `1. ⚡ Quick Fix: Enable TPM 2.0 (AMD fTPM / Intel PTT) and UEFI Secure Boot in your BIOS, then set the Vanguard service (vgc) to Automatic startup in Windows.\n\`services.msc -> vgc -> Startup Type: Automatic\`\n\n2. 🚀 Performance Boost: Disable 'Core Isolation / Memory Integrity' in Windows Defender Core Isolation settings to eliminate micro-stutters and input latency while Vanguard is active.`;
  }

  if (query.includes("nvlddmkm") || query.includes("directx") || query.includes("dxgi") || query.includes("driver") || query.includes("device_removed")) {
    return `1. ⚡ Quick Fix: Reset your display driver instantly with the hotkey or execute a clean DDU (Display Driver Uninstaller) driver wipe in Safe Mode.\n\`powershell -command "pnputil /restart-device (Get-PnpDevice -Class Display).InstanceId"\`\n\n2. 🚀 Performance Boost: In NVIDIA Control Panel, set 'Power Management Mode' to 'Prefer Maximum Performance' and increase Shader Cache Size to '10 GB' to completely stop driver timeouts and texture popping.`;
  }

  if (query.includes("30005") || query.includes("easy anti-cheat") || query.includes("eac") || query.includes("battleye") || query.includes("createfile")) {
    return `1. ⚡ Quick Fix: Delete the locked EasyAntiCheat.sys driver file and let the game launcher regenerate a clean copy upon next launch.\n\`del /f /q "C:\\Program Files (x86)\\EasyAntiCheat\\EasyAntiCheat.sys"\`\n\n2. 🚀 Performance Boost: Add your entire Game directory and Anti-Cheat folder to Windows Security 'Exclusions' list to prevent real-time antivirus disk locking during online matches.`;
  }

  if (query.includes("0xc0000005") || query.includes("access violation") || query.includes("c0000005") || query.includes("crash to desktop") || query.includes("ctd")) {
    return `1. ⚡ Quick Fix: Run Windows System File Checker and repair damaged Visual C++ runtime memory dependencies.\n\`sfc /scannow && DISM /Online /Cleanup-Image /RestoreHealth\`\n\n2. 🚀 Performance Boost: Disable full-screen optimizations in your game executable's Compatibility tab and turn off Discord/Steam hardware acceleration overlays.`;
  }

  if (query.includes("shader") || query.includes("stutter") || query.includes("freeze") || query.includes("fps drop") || query.includes("lag")) {
    const gpuInfo = userSpecs?.gpu || "GPU";
    return `1. ⚡ Quick Fix: Clear the compiled DirectX shader cache and enable Hardware-Accelerated GPU Scheduling (HAGS) in Windows Graphics Settings.\n\`cleanmgr /sageset:1 && cleanmgr /sagerun:1\`\n\n2. 🚀 Performance Boost: Lock your maximum framerate in RTSS (RivaTuner) or GPU driver to exactly 3 FPS below your monitor's refresh rate with G-Sync/FreeSync enabled for ultra-smooth frametime pacing on your ${gpuInfo}.`;
  }

  return `1. ⚡ Quick Fix: Enable Game Mode, configure High Performance GPU preference in Windows Graphics Settings, and verify game files through your launcher.\n\`powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c\`\n\n2. 🚀 Performance Boost: Add \`-high -threads 8 +mat_queue_mode 2\` to your game launch parameters and disable Windows Game Bar background recording to reclaim up to 15% CPU headroom.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { messages, prompt, userSpecs } = req.body || {};

    let userQuery = prompt;
    if (!userQuery && Array.isArray(messages) && messages.length > 0) {
      const last = messages[messages.length - 1];
      userQuery = typeof last === "string" ? last : last.content;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackReply = generateOfflineDiagnosis(userQuery, userSpecs);
      return res.status(200).json({ reply: fallbackReply, solution: fallbackReply });
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemContext = "";
    if (userSpecs) {
      systemContext = `\n\nUser Hardware Rig:\n${JSON.stringify(userSpecs, null, 2)}`;
    }

    const contents = Array.isArray(messages) && messages.length > 0
      ? messages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || "" }]
        }))
      : (userQuery || "Help diagnose gaming issue");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + systemContext,
        temperature: 0.2,
      },
    });

    const replyText = response.text || generateOfflineDiagnosis(userQuery, userSpecs);

    return res.status(200).json({
      reply: replyText,
      solution: replyText,
    });
  } catch (error) {
    console.error("Vercel Serverless /api/chat error:", error);
    const fallbackReply = generateOfflineDiagnosis(req.body?.prompt || "", req.body?.userSpecs);
    return res.status(200).json({
      reply: fallbackReply,
      solution: fallbackReply,
    });
  }
}
