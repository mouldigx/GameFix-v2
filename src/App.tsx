import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { TelemetrySidebar } from './components/TelemetrySidebar';
import { ChatView } from './components/ChatView';
import { GameOptimizerView } from './components/GameOptimizerView';
import { EmergencyFixesView } from './components/EmergencyFixesView';
import { CrashLogScanner } from './components/CrashLogScanner';
import { HardwareSpecsModal } from './components/HardwareSpecsModal';
import { ChatMessage, UserHardwareSpecs } from './types';
import { DEFAULT_USER_SPECS } from './data/gamingKnowledge';
import { parseAiResponse, speakText } from './utils/aiHelpers';

const INITIAL_GREETING_TN: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  timestamp: '14:00',
  content: `**Quick Cause Assessment**: محرك GameFix AI التشخيصي حاضر ومرڤل على مواصفات الـ PC متاعك.\n\n**Step-by-Step Fix**:\n1. **أعطيني المشكل بالضبط**: سميلي اللعبة والأعراض (مثلاً FPS Drops، كراش DirectX، إيرور 0xc000007b، بينغ طالع في فايبر، ولا Riot Vanguard).\n2. **تأكد من الـ Hardware Specs**: ثبت الكارت غرافيك والبروسيسور في الـ Telemetry باش نعطيك الإعدادات وحساب الـ Bottleneck بالملّي.\n3. **اطرح سؤالك كيف ما تحب**: اسأل بالتونسي، بالفرنسي ولا بالإنجليزي، وإجابتي ديما بالتونسي ديركت في صلب الموضوع!\n\n**Pro-Tip**: تنجم زادة تعمل كوبي لـ Windows Event Viewer Crash Logs وتلصقها في تبويب "Crash Logs" باش نطلعلك الـ Module المضروب في ثانية!`,
  parsed: {
    quickCause: 'محرك GameFix AI التشخيصي حاضر ومرڤل على مواصفات الـ PC متاعك.',
    steps: [
      {
        title: 'أعطيني المشكل بالضبط',
        detail: 'سميلي اللعبة والأعراض (مثلاً FPS Drops، كراش DirectX، إيرور 0xc000007b، بينغ طالع في فايبر، ولا Riot Vanguard).',
      },
      {
        title: 'تأكد من الـ Hardware Specs',
        detail: 'ثبت الكارت غرافيك والبروسيسور في الـ Telemetry باش نعطيك الإعدادات وحساب الـ Bottleneck بالملّي.',
      },
      {
        title: 'اطرح سؤالك كيف ما تحب',
        detail: 'اسأل بالتونسي، بالفرنسي ولا بالإنجليزي، وإجابتي ديما بالتونسي ديركت في صلب الموضوع!',
      },
    ],
    proTip: 'تنجم زادة تعمل كوبي لـ Windows Event Viewer Crash Logs وتلصقها في تبويب "Crash Logs" باش نطلعلك الـ Module المضروب في ثانية!',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'optimizer' | 'fixes' | 'logs'>('chat');
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [audioMuted, setAudioMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [uiLang, setUiLang] = useState<'tn' | 'en'>(() => {
    return (localStorage.getItem('gamefix_ui_lang') as 'tn' | 'en') || 'tn';
  });

  // Load specs from localStorage or use default
  const [userSpecs, setUserSpecs] = useState<UserHardwareSpecs>(() => {
    try {
      const saved = localStorage.getItem('gamefix_user_specs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved specs');
    }
    return DEFAULT_USER_SPECS;
  });

  // Load messages from localStorage or use initial welcome
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('gamefix_messages');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load chat history');
    }
    return [INITIAL_GREETING_TN];
  });

  // Save specs
  const handleSaveSpecs = (updated: UserHardwareSpecs) => {
    setUserSpecs(updated);
    try {
      localStorage.setItem('gamefix_user_specs', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Save messages
  useEffect(() => {
    try {
      localStorage.setItem('gamefix_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn(e);
    }
  }, [messages]);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gamefix_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+L to toggle between Chat and Logs
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setActiveTab((prev) => (prev === 'chat' ? 'logs' : 'chat'));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Send message to GameFix AI server
  const handleSendMessage = async (text: string, includeSpecs: boolean) => {
    // Add to recent searches
    setRecentSearches((prev) => {
      const updated = [text, ...prev.filter((s) => s !== text)].slice(0, 5);
      try {
        localStorage.setItem('gamefix_recent_searches', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      specsAttached: includeSpecs ? userSpecs : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Corrected to point to /api/fix matching our backend serverless function
      const response = await fetch('/api/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          userSpecs: includeSpecs ? userSpecs : undefined,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Server responded with an error');
      }

      const rawReply = data.solution || 'Diagnosis received.';
      const parsed = parseAiResponse(rawReply);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: rawReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsed: parsed,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If audio is unmuted, speak the quick cause
      if (!audioMuted && parsed.quickCause) {
        speakText(parsed.quickCause);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `**Quick Cause Assessment**: Diagnostic server communication timeout.\n\n**Step-by-Step Fix**:\n1. Verify your network connection.\n2. Ensure Vercel environment variables are set correctly.\n3. Try re-sending your gaming inquiry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsed: {
          quickCause: 'Diagnostic server communication timeout.',
          steps: [
            { title: 'Check connection', detail: 'Verify your network connection.' },
            { title: 'Retry inquiry', detail: 'Try re-sending your gaming inquiry with specific symptoms.' },
          ],
        },
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkResolved = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isResolved: true } : m))
    );
    setResolvedCount((prev) => prev + 1);
  };

  const handleToggleUiLang = () => {
    const nextLang = uiLang === 'tn' ? 'en' : 'tn';
    setUiLang(nextLang);
    try {
      localStorage.setItem('gamefix_ui_lang', nextLang);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING_TN]);
    try {
      localStorage.removeItem('gamefix_messages');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#09090b] text-slate-100 font-sans overflow-hidden select-text">
      {/* Top High Density Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userSpecs={userSpecs}
        onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
        audioMuted={audioMuted}
        onToggleAudio={() => setAudioMuted(!audioMuted)}
        resolvedCount={resolvedCount}
        showTelemetry={showTelemetry}
        onToggleTelemetry={() => setShowTelemetry(!showTelemetry)}
        uiLang={uiLang}
        onToggleUiLang={handleToggleUiLang}
      />

      {/* Main Cockpit Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Aside: Hardware Profile & Quick Sessions / Presets */}
        <LeftSidebar
          userSpecs={userSpecs}
          onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
          onSelectPrompt={(text) => {
            if (activeTab !== 'chat') setActiveTab('chat');
            handleSendMessage(text, true);
          }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          recentSearches={recentSearches}
        />

        {/* Center Workspace Section */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gradient-to-b from-[#0f172a]/20 to-transparent">
          {activeTab === 'chat' && (
            <ChatView
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              userSpecs={userSpecs}
              onMarkResolved={handleMarkResolved}
              audioMuted={audioMuted}
              onClearChat={handleClearChat}
            />
          )}

          {activeTab === 'optimizer' && (
            <GameOptimizerView
              userSpecs={userSpecs}
              onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
            />
          )}

          {activeTab === 'fixes' && <EmergencyFixesView />}

          {activeTab === 'logs' && <CrashLogScanner userSpecs={userSpecs} />}
        </main>

        {/* Right Aside: Real-Time Telemetry Monitor */}
        {showTelemetry && (
          <div className="hidden xl:flex">
            <TelemetrySidebar
              userSpecs={userSpecs}
              onOpenSpecsModal={() => setIsSpecsModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* Hardware Specs Modal */}
      <HardwareSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        specs={userSpecs}
        onSaveSpecs={handleSaveSpecs}
      />
    </div>
  );
}
