import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles, RefreshCw, Zap, ShieldCheck, FileDown, Download, CheckCircle2 } from 'lucide-react';
import { ChatMessage, UserHardwareSpecs } from '../types';
import { MessageItem } from './MessageItem';
import { STARTER_PROMPTS } from '../data/gamingKnowledge';
import { exportChatResolutionToPdf } from '../utils/pdfExport';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, includeSpecs: boolean) => Promise<void>;
  isLoading: boolean;
  userSpecs: UserHardwareSpecs;
  onMarkResolved: (messageId: string) => void;
  audioMuted: boolean;
  onClearChat: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  userSpecs,
  onMarkResolved,
  audioMuted,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState(() => {
    return localStorage.getItem('gamefixChatDraft') || '';
  });
  const [includeSpecs, setIncludeSpecs] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save input draft to localStorage
  useEffect(() => {
    localStorage.setItem('gamefixChatDraft', inputText);
  }, [inputText]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleExportPdf = (specificMessageId?: string) => {
    setIsExportingPdf(true);
    try {
      exportChatResolutionToPdf(messages, userSpecs, specificMessageId);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 800);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const query = inputText.trim();
    setInputText('');
    await onSendMessage(query, includeSpecs);
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleSelectStarter = (text: string) => {
    setInputText(text);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full flex-1 overflow-hidden bg-gradient-to-b from-[#0f172a]/20 to-transparent">
      {/* Scrollable Chat Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
        {/* Starter Presets Bar (shown initially) */}
        {messages.length <= 1 && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest font-mono">
                  Instant Diagnostic Triggers
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Auto-calibrated for {userSpecs.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {STARTER_PROMPTS.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectStarter(starter.text)}
                  className="text-left p-2.5 rounded-lg bg-[#18181b] border border-white/5 hover:border-green-500/40 hover:bg-white/10 transition group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold text-green-400 uppercase tracking-wider">
                      {starter.tag}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 group-hover:text-green-400 transition">
                      RUN &rarr;
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-300 group-hover:text-white line-clamp-2">
                    {starter.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Offline Crash Recovery Alert Banner when assistant messages exist */}
        {messages.some((m) => m.role === 'assistant') && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-white">Offline Crash Recovery:</strong> Export this troubleshooting guide to PDF before rebooting or entering Safe Mode.
              </span>
            </div>
            <button
              onClick={() => handleExportPdf()}
              disabled={isExportingPdf}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] tracking-wider uppercase transition cursor-pointer shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.4)]"
            >
              <FileDown className={`w-3 h-3 ${isExportingPdf ? 'animate-spin' : ''}`} />
              <span>{isExportingPdf ? 'Saving PDF...' : 'Download PDF Guide'}</span>
            </button>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onMarkResolved={onMarkResolved}
            audioMuted={audioMuted}
            onSelectPrompt={handleSelectStarter}
            onExportPdf={handleExportPdf}
          />
        ))}

        {/* AI Loading Pulse */}
        {isLoading && (
          <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-slate-200 max-w-[90%] text-sm flex items-center gap-3 animate-pulse">
            <div className="w-6 h-6 bg-green-500/20 border border-green-500/40 rounded flex items-center justify-center text-green-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="font-mono text-xs text-green-400">
              [PROBE ACTIVE] Analyzing DirectX pipeline, GPU shader compiler, and system drivers...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* High Density Command Input Bar */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0c0c0e]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 px-1 text-[10px] font-mono text-slate-500">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
            <input
              type="checkbox"
              checked={includeSpecs}
              onChange={(e) => setIncludeSpecs(e.target.checked)}
              className="rounded bg-[#18181b] border-white/10 text-green-500 focus:ring-0 h-3 w-3"
            />
            <span className="text-green-400 font-bold">RIG SPECS INJECTED:</span>
            <span className="truncate max-w-[240px] sm:max-w-[300px]">
              {userSpecs.gpu.replace('NVIDIA GeForce ', '')} • {userSpecs.ram.split(' ')[0]}
            </span>
          </label>

          <div className="flex items-center gap-3">
            {messages.some(m => m.role === 'assistant') && (
              <button
                type="button"
                id="export-chat-pdf-btn"
                onClick={() => handleExportPdf()}
                disabled={isExportingPdf}
                title="Download this entire resolution guide as an offline PDF in case of PC restarts or crashes"
                className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50 transition cursor-pointer font-bold"
              >
                <FileDown className={`w-3 h-3 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span>{isExportingPdf ? 'GENERATING PDF...' : 'SAVE AS PDF (OFFLINE RUNBOOK)'}</span>
              </button>
            )}

            {messages.length > 2 && (
              <button
                type="button"
                onClick={onClearChat}
                className="hover:text-rose-400 transition flex items-center gap-1"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>CLEAR SESSION</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Game Presets */}
        <div id="quick-game-presets" className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 scrollbar-hide px-1">
          {['Valorant', 'GTA V', 'CS2', 'Warzone', 'Fortnite', 'Cyberpunk'].map(game => (
            <button
              key={game}
              type="button"
              onClick={() => {
                setInputText(prev => {
                  if (prev.includes(`${game}: `)) return prev;
                  return prev ? `${game}: ${prev}` : `${game}: `;
                });
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-md bg-[#18181b] border border-white/10 hover:border-green-500/40 hover:bg-white/10 text-[10px] font-mono text-slate-300 hover:text-green-400 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              {game}
            </button>
          ))}
        </div>

        {/* Quick Game Presets */}
        <div id="quick-game-presets" className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 scrollbar-hide px-1">
          {['Valorant', 'GTA V', 'CS2', 'Warzone', 'Fortnite', 'Cyberpunk'].map(game => (
            <button
              key={game}
              type="button"
              onClick={() => {
                setInputText(prev => {
                  if (prev.includes(`${game}: `)) return prev;
                  return prev ? `${game}: ${prev}` : `${game}: `;
                });
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-md bg-[#18181b] border border-white/10 hover:border-green-500/40 hover:bg-white/10 text-[10px] font-mono text-slate-300 hover:text-green-400 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              {game}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            id="gamefix-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            placeholder="Ask about stuttering, crashes, or optimization (e.g. 0xc000007b, Warzone drop FPS, Riot VAN 128)..."
            className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3 pr-28 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
          />

          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Listening...' : 'Voice Dictate'}
              className={`p-2 rounded-lg border transition ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              type="submit"
              id="send-chat-btn"
              disabled={!inputText.trim() || isLoading}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-tight transition ${
                inputText.trim() && !isLoading
                  ? 'bg-green-500 text-black hover:bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)] cursor-pointer'
                  : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
