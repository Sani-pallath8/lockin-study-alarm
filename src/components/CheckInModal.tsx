import React from 'react';
import { Flame, ShieldAlert, Sparkles, Volume2, Coffee } from 'lucide-react';
import { audioService } from '../services/audioService';
import { AlarmSoundType } from '../types';

interface CheckInModalProps {
  isOpen: boolean;
  onLockedIn: () => void;
  onCaughtSlacking: () => void;
  onTakeBreak: () => void;
  currentSound: AlarmSoundType;
  activeTaskTitle?: string;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onLockedIn,
  onCaughtSlacking,
  onTakeBreak,
  currentSound,
  activeTaskTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700/80 p-6 shadow-2xl relative overflow-hidden text-center">
        {/* Subtle glowing ring background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Alarm icon */}
        <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>

        {/* Heading */}
        <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-1">
          FOCUS DRIFT CHECK
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight sm:text-3xl">
          Are you studying right now?
        </h2>

        {/* Motivational Callout */}
        <p className="mt-2 text-sm text-neutral-300 leading-relaxed">
          {activeTaskTitle ? (
            <span>
              Target: <strong className="text-emerald-300 font-semibold">{activeTaskTitle}</strong>.
            </span>
          ) : (
            <span>Put the phone face down!</span>
          )}{' '}
          Don't let notifications or friend chats drag you into an Instagram doomscroll loop.
        </p>

        {/* Replay Sound helper */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => {
              audioService.playAlarm(currentSound);
              audioService.speakMotivation("Are you studying right now? Put the phone down and lock in!");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors py-1 px-2.5 rounded-md bg-neutral-800/80 border border-neutral-700"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Replay Audio Alert</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          {/* Main button: YES LOCKED IN */}
          <button
            onClick={onLockedIn}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Flame className="w-4 h-4 fill-neutral-950" />
            <span>YES, LOCKED IN (+10 Aura)</span>
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Caught Slacking button */}
          <button
            onClick={onCaughtSlacking}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 border border-neutral-700 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Caught slacking! Resetting my phone trap</span>
          </button>

          {/* Need break */}
          <button
            onClick={onTakeBreak}
            className="w-full py-2 px-4 text-xs font-medium text-neutral-400 hover:text-neutral-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Need a 3-minute breather</span>
          </button>
        </div>
      </div>
    </div>
  );
};
