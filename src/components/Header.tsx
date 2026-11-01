import React, { useState } from 'react';
import { Shield, Sparkles, Trophy, Settings, Maximize2, Minimize2, Flame, BellRing, ChevronDown } from 'lucide-react';
import { UserStats } from '../types';

interface HeaderProps {
  stats: UserStats;
  isFocusing: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenTrophyShelf: () => void;
  onOpenSettings: () => void;
  onTriggerCheckIn: () => void;
  activeTaskTitle?: string;
  alarmIntervalMinutes?: number;
  onSelectAlarmInterval?: (minutes: number) => void;
  secondsUntilNextAlarm?: number;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  isFocusing,
  isFullscreen,
  onToggleFullscreen,
  onOpenTrophyShelf,
  onOpenSettings,
  onTriggerCheckIn,
  activeTaskTitle,
  alarmIntervalMinutes = 5,
  onSelectAlarmInterval,
  secondsUntilNextAlarm,
}) => {
  const [showAlarmDropdown, setShowAlarmDropdown] = useState(false);

  return (
    <header className="w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-neutral-100">LockIn</span>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
                Study Shield
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isFocusing ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
              <span className="truncate max-w-[160px] sm:max-w-[260px]">
                {isFocusing ? (activeTaskTitle ? `Locked in: ${activeTaskTitle}` : 'Focusing now') : 'Ready to study'}
              </span>
            </div>
          </div>
        </div>

        {/* User Stats & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Check-in Alarm Tester & Interval Picker */}
          <div className="relative">
            <div className="hidden sm:inline-flex items-center rounded-lg bg-neutral-900 border border-neutral-800 p-0.5">
              <button
                onClick={onTriggerCheckIn}
                title="Test what the 'Are you studying right now?' alarm sounds & looks like"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-neutral-800 text-amber-300 transition-colors cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Alarm</span>
              </button>

              <button
                onClick={() => setShowAlarmDropdown(!showAlarmDropdown)}
                className="px-2 py-1 text-xs font-mono text-neutral-400 hover:text-white border-l border-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
                title="Change alarm timer interval (5m, 15m, 20m, 25m)"
              >
                <span>{alarmIntervalMinutes}m</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Interval Popover */}
            {showAlarmDropdown && (
              <div className="absolute right-0 mt-2 w-56 p-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  "ARE YOU STUDYING?" TIMER
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {[5, 15, 20, 25].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        onSelectAlarmInterval?.(mins);
                        setShowAlarmDropdown(false);
                      }}
                      className={`py-1.5 px-2 text-xs font-mono rounded-lg border text-center transition-all cursor-pointer ${
                        alarmIntervalMinutes === mins
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    onTriggerCheckIn();
                    setShowAlarmDropdown(false);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Test Alarm Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 border border-neutral-800/80 text-xs font-mono text-amber-400">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
            <span>{stats.currentStreakDays}d streak</span>
          </div>

          {/* Aura Points */}
          <button
            onClick={onOpenTrophyShelf}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-emerald-400 transition-colors cursor-pointer"
            title="View collected stickers & rewards"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.auraPoints} Aura</span>
          </button>

          {/* Trophy Shelf Button */}
          <button
            onClick={onOpenTrophyShelf}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Trophy Shelf & Rewards"
            title="Rewards & Badges"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          {/* Fullscreen Zen Mode */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle Fullscreen"
            title={isFullscreen ? 'Exit Zen Mode' : 'Enter Zen Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Settings"
            title="Alarm & Study Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
