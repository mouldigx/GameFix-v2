import React, { useState } from 'react';
import { X, ExternalLink, Zap } from 'lucide-react';

export const AdBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-[#0c0c0e]/95 backdrop-blur border-t border-white/5 flex justify-center py-2 px-4 relative z-40 shrink-0">
      <div className="relative w-full max-w-[320px] h-[50px] md:max-w-[728px] md:h-[90px] bg-gradient-to-r from-[#18181b] via-[#1f2937] to-[#18181b] border border-white/10 hover:border-green-500/30 rounded-lg overflow-hidden flex items-center justify-between px-4 md:px-8 group cursor-pointer transition-colors shadow-lg">
        
        {/* Ad Content */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex w-12 h-12 bg-green-500/10 rounded-full items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] text-green-400 font-mono tracking-widest uppercase mb-0.5">Sponsored</span>
            <h4 className="text-slate-200 font-bold text-xs md:text-sm lg:text-base flex items-center gap-1.5">
              Upgrade Your Gaming Gear Today
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-slate-500 group-hover:text-green-400 transition" />
            </h4>
            <p className="hidden md:block text-[11px] text-slate-400 mt-1">Get up to 40% off on premium mechanical keyboards and mice.</p>
          </div>
        </div>

        {/* Ad Call to Action (Desktop) */}
        <div className="hidden md:block">
          <span className="px-4 py-1.5 bg-green-500 text-black text-xs font-bold rounded shadow-[0_0_10px_rgba(34,197,94,0.2)] group-hover:bg-green-400 transition">
            Shop Now
          </span>
        </div>
        
        {/* Dismiss Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute top-1 right-1 md:top-2 md:right-2 p-1 md:p-1.5 rounded-md bg-black/40 text-slate-400 hover:text-white hover:bg-black/60 transition z-10"
          aria-label="Close ad"
          title="Close ad"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
