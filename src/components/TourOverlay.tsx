import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'center',
    title: 'WELCOME TO GAMEFIX AI ⚡',
    content: 'Your elite 1-click diagnostics engine. Let\'s take a quick 15-second tour to unlock your rig\'s true potential.',
    placement: 'center'
  },
  {
    targetId: 'open-rig-specs-btn',
    title: 'HARDWARE PROFILE',
    content: 'Set your PC specs here. The AI uses your exact CPU and GPU to calculate pixel-perfect fixes and frame-pacing optimizations.',
    placement: 'bottom'
  },
  {
    targetId: 'quick-game-presets',
    title: 'QUICK PRESETS',
    content: 'Instantly select your active game to context-switch without wasting time typing.',
    placement: 'top'
  },
  {
    targetId: 'gamefix-chat-input',
    title: 'INSTANT DIAGNOSTICS',
    content: 'Paste your crash log, error code (like VAN 9003), or describe your stutter. Hit enter for a 1-click fix.',
    placement: 'top'
  },
  {
    targetId: 'toggle-telemetry-btn',
    title: 'LIVE TELEMETRY',
    content: 'Toggle the right sidebar to monitor your system\'s health, thermals, and get 1-click snapshot reports.',
    placement: 'bottom'
  }
];

export const TourOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleRestart = () => {
      localStorage.removeItem('gamefix-tour-completed');
      setCurrentStep(0);
      setIsVisible(true);
    };
    
    window.addEventListener('restart-tour', handleRestart);
    return () => window.removeEventListener('restart-tour', handleRestart);
  }, []);

  useEffect(() => {
    const tourCompleted = localStorage.getItem('gamefix-tour-completed');
    if (!tourCompleted) {
      // Small delay to let UI render completely
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateRect = useCallback(() => {
    if (!isVisible) return;
    const step = TOUR_STEPS[currentStep];
    if (step.targetId === 'center') {
      setTargetRect(null);
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      // Ensure element is in view
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Wait for scroll to finish
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }, 300);
    } else {
      setTargetRect(null);
    }
  }, [currentStep, isVisible]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [updateRect]);

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isCenter = step.targetId === 'center' || !targetRect;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      endTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const endTour = () => {
    setIsVisible(false);
    localStorage.setItem('gamefix-tour-completed', 'true');
  };

  // Calculate tooltip position based on target rect
  let tooltipStyle: React.CSSProperties = {};
  if (!isCenter && targetRect) {
    const margin = 16;
    if (step.placement === 'bottom') {
      tooltipStyle = { top: targetRect.bottom + margin, left: targetRect.left + (targetRect.width / 2), transform: 'translateX(-50%)' };
    } else if (step.placement === 'top') {
      tooltipStyle = { top: targetRect.top - margin, left: targetRect.left + (targetRect.width / 2), transform: 'translate(-50%, -100%)' };
    } else if (step.placement === 'left') {
      tooltipStyle = { top: targetRect.top + (targetRect.height / 2), left: targetRect.left - margin, transform: 'translate(-100%, -50%)' };
    } else if (step.placement === 'right') {
      tooltipStyle = { top: targetRect.top + (targetRect.height / 2), left: targetRect.right + margin, transform: 'translateY(-50%)' };
    }
    
    // Boundary checks (basic)
    if (tooltipStyle.left && (typeof tooltipStyle.left === 'number') && tooltipStyle.left < 16) {
      tooltipStyle.left = 16;
      tooltipStyle.transform = tooltipStyle.transform?.replace('translateX(-50%)', 'translateX(0)');
    }
  } else {
    tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500"
        style={{
          clipPath: !isCenter && targetRect 
            ? `polygon(0% 0%, 0% 100%, ${targetRect.left - 4}px 100%, ${targetRect.left - 4}px ${targetRect.top - 4}px, ${targetRect.right + 4}px ${targetRect.top - 4}px, ${targetRect.right + 4}px ${targetRect.bottom + 4}px, ${targetRect.left - 4}px ${targetRect.bottom + 4}px, ${targetRect.left - 4}px 100%, 100% 100%, 100% 0%)` 
            : 'none'
        }}
      />
      
      {/* Highlight Box Outline */}
      {!isCenter && targetRect && (
        <div 
          className="absolute border-2 border-green-400 rounded shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all duration-300 pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        >
          {/* Radar Ping effect on the target */}
          <span className="absolute -top-1 -right-1 w-3 h-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      )}

      {/* Tooltip Card */}
      <div 
        className="absolute z-[101] w-[320px] bg-[#0c0c0e] border border-green-500/30 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 flex flex-col"
        style={tooltipStyle}
      >
        <div className="bg-gradient-to-r from-green-500/20 to-transparent p-4 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-green-400 font-mono text-[10px] font-bold tracking-widest">
              <Sparkles className="w-3 h-3" />
              STEP {currentStep + 1} OF {TOUR_STEPS.length}
            </span>
            <button 
              onClick={endTour}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-black text-slate-100 text-sm tracking-wide uppercase">{step.title}</h3>
        </div>
        
        <div className="p-4">
          <p className="text-slate-300 text-xs leading-relaxed font-sans">
            {step.content}
          </p>
        </div>

        <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? 'bg-green-400 w-3' : 'bg-white/20'}`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button 
                onClick={handlePrev}
                className="p-1.5 rounded bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition border border-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            
            <button 
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-500 hover:bg-green-400 text-black font-mono text-xs font-bold transition shadow-[0_0_15px_rgba(34,197,94,0.3)] active:scale-95"
            >
              {currentStep === TOUR_STEPS.length - 1 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>START</span>
                </>
              ) : (
                <>
                  <span>NEXT</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
