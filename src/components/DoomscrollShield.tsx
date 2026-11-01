import React from 'react';
import { ShieldCheck, Smartphone, AlertTriangle, Eye, Flame, CheckCircle2 } from 'lucide-react';

interface DoomscrollShieldProps {
  trapsDodged: number;
  isShieldEnabled: boolean;
  onToggleShield: () => void;
  onEmergencyReset: () => void;
  notificationsEnabled: boolean;
  onRequestNotifications: () => void;
}

export const DoomscrollShield: React.FC<DoomscrollShieldProps> = ({
  trapsDodged,
  isShieldEnabled,
  onToggleShield,
  onEmergencyReset,
  notificationsEnabled,
  onRequestNotifications,
}) => {
  return (
    <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 shadow-xl space-y-4">
      {/* Title & Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
              <span>Anti-Doomscroll Shield</span>
            </h3>
            <p className="text-xs text-neutral-400">Protects you from phone & tab distraction loops</p>
          </div>
        </div>

        {/* Toggle active switch */}
        <button
          onClick={onToggleShield}
          className={`px-3 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
            isShieldEnabled
              ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400'
          }`}
        >
          {isShieldEnabled ? 'SHIELD ON' : 'PAUSED'}
        </button>
      </div>

      {/* Traps dodged stats callout */}
      <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-neutral-300 font-medium">Doomscroll Traps Dodged:</span>
        </div>
        <span className="font-mono text-sm font-bold text-amber-400">
          {trapsDodged} {trapsDodged === 1 ? 'loop avoided' : 'loops avoided'}
        </span>
      </div>

      {/* Phone Solitary Rules (The core habit fix) */}
      <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Tactical Phone Defense (Anti-Instagram Routine)</span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-xs text-neutral-400">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>Turn phone upside down or keep it 10 feet out of arm's reach.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>If friends message or Insta pings, ignore until your 20m sprint ends.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>LockIn will ping with sound on your laptop to pull you back if you drift.</span>
          </div>
        </div>
      </div>

      {/* Notification banner if not permitted / status */}
      {!notificationsEnabled ? (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-neutral-900 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-200 min-w-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <div className="font-semibold text-amber-300">Enable Desktop Pop-Up Alerts</div>
              <div className="text-[11px] text-neutral-400 leading-snug">
                Pops up "Are you studying?" alarms on your laptop screen even when this tab is hidden or minimized.
              </div>
            </div>
          </div>
          <button
            onClick={onRequestNotifications}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            Allow
          </button>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-neutral-950/50 border border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Laptop Popups Active (alerts will show over other apps)</span>
          </div>
        </div>
      )}

      {/* Emergency distraction breaker button */}
      <button
        onClick={onEmergencyReset}
        className="w-full py-2.5 px-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-medium text-neutral-300 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5 text-amber-400" />
        <span>Feeling the urge to doomscroll? Click for 30s Grounding Reset</span>
      </button>
    </div>
  );
};
