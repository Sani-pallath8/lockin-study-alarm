import React, { useState, useEffect } from 'react';
import { X, Sparkles, Smartphone } from 'lucide-react';

interface GroundingResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroundingResetModal: React.FC<GroundingResetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(30);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // 4-4-4 cycle
  useEffect(() => {
    if (!isOpen) return;
    const cycle = (30 - secondsLeft) % 12;
    if (cycle < 4) {
      setBreathPhase('Inhale');
    } else if (cycle < 8) {
      setBreathPhase('Hold');
    } else {
      setBreathPhase('Exhale');
    }
  }, [secondsLeft, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700/80 p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400">
          30-SECOND DOPAMINE DETOX RESET
        </div>
        <h3 className="text-xl font-bold text-white">Breathe & Drop The Urge</h3>
        <p className="text-xs text-neutral-400">
          Reels give cheap dopamine. Crushing this study session gives permanent confidence.
        </p>

        {/* Breathing Circle */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div
            className={`w-32 h-32 rounded-full border-4 border-emerald-400/80 flex items-center justify-center text-center transition-all duration-1000 ${
              breathPhase === 'Inhale'
                ? 'scale-110 bg-emerald-500/20 shadow-lg shadow-emerald-500/30'
                : breathPhase === 'Hold'
                ? 'scale-105 bg-emerald-500/10'
                : 'scale-90 bg-neutral-950'
            }`}
          >
            <div>
              <div className="text-lg font-extrabold text-white">{breathPhase}</div>
              <div className="text-xs font-mono text-emerald-400 mt-1">{secondsLeft}s left</div>
            </div>
          </div>
        </div>

        {/* Phone Solitary Reminder */}
        <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2 text-left">
          <Smartphone className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Take this exact moment to slide your phone across the room or face down.</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>I'm Grounded & Ready to Lock In</span>
        </button>
      </div>
    </div>
  );
};
