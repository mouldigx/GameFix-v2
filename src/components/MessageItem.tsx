import React, { useState } from 'react';
import { Bot, User, Check, Copy, Volume2, VolumeX, Sparkles, AlertCircle, Wrench, Lightbulb, CheckCircle2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { speakText, stopSpeaking, fireResolvedConfetti } from '../utils/aiHelpers';
import { TypewriterText } from './TypewriterText';

interface MessageItemProps {
  message: ChatMessage;
  onMarkResolved: (id: string) => void;
  audioMuted: boolean;
  onSelectPrompt?: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onMarkResolved,
  audioMuted,
  onSelectPrompt,
}) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(message.content, () => setIsSpeaking(false));
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleResolveClick = () => {
    onMarkResolved(message.id);
    fireResolvedConfetti();
  };

  const parsed = message.parsed;

  // Calculate cumulative delays for typewriter sequence
  let currentDelay = 0;
  const typeSpeed = 10;
  const getNextDelay = (text: string | undefined) => {
    if (!text) return currentDelay;
    const delay = currentDelay;
    currentDelay += (text.length * typeSpeed) + 300; // 300ms pause between sections
    return delay;
  };

  if (!isAssistant) {
    // High Density User Bubble
    return (
      <div className="flex flex-col items-end gap-1.5 animate-fadeIn select-text">
        <div className="bg-blue-600/20 border border-blue-500/30 text-blue-100 p-3.5 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[75%] text-sm shadow-md">
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.specsAttached?.gpu && (
            <div className="mt-2 pt-1.5 border-t border-blue-500/20 flex items-center gap-1.5 text-[10px] font-mono text-blue-300/80">
              <span>Attached Rig:</span>
              <span className="font-bold text-blue-200">{message.specsAttached.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '')}</span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-500 font-mono tracking-wider">
          {message.timestamp} SENT
        </span>
      </div>
    );
  }

  // High Density AI Diagnostic Response
  return (
    <div className="flex flex-col items-start gap-1.5 animate-fadeIn select-text w-full">
      {/* Header Banner */}
      <div className="flex items-center justify-between w-full max-w-[95%] sm:max-w-[90%] mb-0.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded text-black flex items-center justify-center font-bold text-[10px] shadow-[0_0_10px_rgba(34,197,94,0.4)]">
            AI
          </div>
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest font-mono">
            Diagnostic Response
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSpeak}
            title={isSpeaking ? 'Stop reading' : 'Read aloud'}
            className={`p-1.5 rounded text-xs transition ${
              isSpeaking
                ? 'bg-green-500 text-black font-bold animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleCopy(message.content)}
            title="Copy diagnosis"
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Diagnostic Card */}
      <div className="bg-white/5 border border-white/10 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-[95%] sm:max-w-[90%] text-sm shadow-xl space-y-3.5 backdrop-blur-sm">
        
        {/* NEW V2 FORMAT: Quick Fix */}
        {parsed?.quickFix && (
          <div className="bg-green-500/10 border border-green-500/20 p-3.5 rounded-xl space-y-2">
            <h4 className="text-green-400 font-bold font-mono text-[11px] uppercase tracking-widest flex items-center gap-2">
              <span className="text-sm">⚡</span> Quick Fix
            </h4>
            <div className="text-slate-100 font-medium leading-relaxed text-sm">
              <TypewriterText 
                text={parsed.quickFix}
                id={`${message.id}-qf`}
                startDelay={getNextDelay(parsed.quickFix)}
                speed={typeSpeed}
              />
            </div>
            
            {parsed.quickFixCommand && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(parsed.quickFixCommand!);
                }}
                className="flex items-center justify-between p-2 mt-2 rounded bg-[#09090b] border border-white/10 font-mono text-xs text-green-400 hover:border-green-500/50 transition group cursor-pointer"
              >
                <code className="truncate mr-2 text-green-400">
                  <TypewriterText 
                    text={parsed.quickFixCommand}
                    id={`${message.id}-qf-cmd`}
                    startDelay={getNextDelay(parsed.quickFixCommand)}
                    speed={typeSpeed}
                  />
                </code>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-green-300 shrink-0 font-bold">
                  Copy
                </span>
              </div>
            )}
          </div>
        )}

        {/* NEW V2 FORMAT: Performance Boost */}
        {parsed?.performanceBoost && (
          <div className="bg-purple-500/10 border border-purple-500/20 p-3.5 rounded-xl space-y-2">
            <h4 className="text-purple-400 font-bold font-mono text-[11px] uppercase tracking-widest flex items-center gap-2">
              <span className="text-sm">🚀</span> Performance Boost
            </h4>
            <div className="text-slate-100 font-medium leading-relaxed text-sm">
              <TypewriterText 
                text={parsed.performanceBoost}
                id={`${message.id}-pb`}
                startDelay={getNextDelay(parsed.performanceBoost)}
                speed={typeSpeed}
              />
            </div>
          </div>
        )}

        {/* LEGACY FORMAT: Assessment */}
        {parsed?.quickCause && !parsed.quickFix ? (
          <p className="font-semibold text-green-400 italic text-sm leading-relaxed">
            <span className="text-green-500 font-mono not-italic mr-1.5 opacity-70">{'>'}</span>
            <TypewriterText 
              text={`Assessment: ${parsed.quickCause}`}
              id={`${message.id}-assessment`}
              startDelay={getNextDelay(`Assessment: ${parsed.quickCause}`)}
              speed={typeSpeed}
            />
          </p>
        ) : !parsed?.quickFix && (
          <div className="whitespace-pre-wrap text-slate-200 leading-relaxed font-medium">
            <TypewriterText 
              text={message.content}
              id={`${message.id}-content`}
              startDelay={getNextDelay(message.content)}
              speed={typeSpeed}
            />
          </div>
        )}

        {/* LEGACY FORMAT: Step-by-Step Fix List */}
        {parsed?.steps && parsed.steps.length > 0 && !parsed.quickFix && (
          <div className="space-y-2.5 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              <TypewriterText 
                text="Ordered Resolution Sequence:"
                id={`${message.id}-steps-title`}
                startDelay={getNextDelay("Ordered Resolution Sequence:")}
                speed={typeSpeed}
              />
            </div>
            <ol className="space-y-2.5 list-decimal ml-4 text-xs sm:text-sm">
              {parsed.steps.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                const stepText = `${step.title}: ${step.detail}`;
                const stepDelay = getNextDelay(stepText);
                const cmdDelay = step.command ? getNextDelay(step.command) : 0;
                
                return (
                  <li
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`cursor-pointer transition select-none leading-relaxed ${
                      isDone ? 'line-through text-slate-500 opacity-60' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    <TypewriterText 
                      text={stepText}
                      id={`${message.id}-step-${idx}`}
                      startDelay={stepDelay}
                      speed={typeSpeed}
                    />

                    {step.command && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(step.command!);
                        }}
                        className="flex items-center justify-between p-2 mt-1.5 rounded bg-[#18181b] border border-white/10 font-mono text-xs text-green-400 hover:border-green-500/50 transition group cursor-pointer"
                      >
                        <code className="truncate mr-2 text-green-400">
                          <TypewriterText 
                            text={step.command}
                            id={`${message.id}-step-cmd-${idx}`}
                            startDelay={cmdDelay}
                            speed={typeSpeed}
                          />
                        </code>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-green-300 shrink-0 font-bold">
                          Copy Command
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* LEGACY FORMAT: Pro-Tip Box */}
        {parsed?.proTip && !parsed.quickFix && (
          <div className="mt-3 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-slate-200">
            <span className="text-green-400 font-bold font-mono mr-1.5">PRO-TIP:</span>
            <span>
              <TypewriterText 
                text={parsed.proTip}
                id={`${message.id}-protip`}
                startDelay={getNextDelay(parsed.proTip)}
                speed={typeSpeed}
              />
            </span>
          </div>
        )}

        {/* Mark Resolved Action & Copy Solution */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
          {message.isResolved ? (
            <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>DIAGNOSIS RESOLVED 🏆</span>
            </div>
          ) : (
            <button
              onClick={handleResolveClick}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 hover:bg-green-500 hover:text-black border border-white/10 text-slate-300 text-xs font-mono font-bold transition group"
            >
              <Sparkles className="w-3.5 h-3.5 text-green-400 group-hover:text-black" />
              <span>Did this fix your game? Mark as Solved</span>
            </button>
          )}

          <button
            onClick={() => handleCopy(message.content)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono font-bold transition group"
            title="Copy Solution"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 group-hover:text-white" />}
            <span className={copied ? "text-green-400" : ""}>{copied ? 'COPIED!' : 'Copy Solution'}</span>
          </button>
        </div>
      </div>

      <span className="text-[10px] text-slate-500 font-mono tracking-wider">
        {message.timestamp} DELIVERED
      </span>
    </div>
  );
};
