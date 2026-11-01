import React from 'react';
import { Play, Pause, RotateCcw, Gift, Zap } from 'lucide-react';

interface TimerProps {
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSelectPreset: (minutes: number) => void;
  onFinishSprintEarly: () => void;
  activeTaskTitle?: string;
}

export const Timer: React.FC<TimerProps> = ({
  timeLeft,
  totalDuration,
  isRunning,
  onToggleTimer,
  onResetTimer,
  onSelectPreset,
  onFinishSprintEarly,
  activeTaskTitle,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage (0 to 100)
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // Presets designed around user's request:
  // "I am not a person who focuses at least a focusing time of 20 minutes, like if I sit for 25 minutes I would go."
  const presets = [
    { label: '10m Dip', mins: 10, tag: 'Zero friction' },
    { label: '15m Sprint', mins: 15, tag: 'Bite-sized' },
    { label: '20m Sweet Spot', mins: 20, tag: 'Recommended', isHighlight: true },
    { label: '25m Standard', mins: 25, tag: 'Classic' },
  ];

  return (
    <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
      {/* Background ambient glow when running */}
      <div
        className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isRunning ? 'bg-emerald-500/15 opacity-100' : 'bg-transparent opacity-0'
        }`}
      />

      {/* Target Task Notice */}
      <div className="flex items-center gap-2 mb-4 text-xs font-mono text-neutral-400">
        <span className={`inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
        <span>CURRENT OBJECTIVE</span>
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-neutral-100 max-w-md truncate mb-6">
        {activeTaskTitle || 'Pick or type a study micro-task below'}
      </h2>

      {/* Timer Display with Circular Ring */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r="44"
            className="text-neutral-800"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
          />
          {/* Progress Indicator */}
          <circle
            cx="50"
            cy="50"
            r="44"
            className="text-emerald-500 transition-all duration-500 ease-out"
            strokeWidth="5"
            strokeDasharray={276.46} // 2 * pi * 44
            strokeDashoffset={276.46 - (276.46 * progress) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>

        {/* Center Clock text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-5xl sm:text-6xl font-bold text-white tracking-tighter tabular-nums drop-shadow">
            {formattedTime}
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 mt-1">
            {isRunning ? 'LOCKED IN 🔒' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Primary Action Controls */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onToggleTimer}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer active:scale-95 ${
            isRunning
              ? 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-amber-400/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-emerald-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-neutral-950" />
              <span>Pause Sprint</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-neutral-950" />
              <span>Start Focus Sprint</span>
            </>
          )}
        </button>

        <button
          onClick={onResetTimer}
          className="p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          title="Reset timer"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Quick Complete / Crack Gift early if they finished task early */}
        <button
          onClick={onFinishSprintEarly}
          className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-medium text-emerald-300 transition-colors cursor-pointer"
          title="Finished task early? Claim reward now!"
        >
          <Gift className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Finished Task</span>
        </button>
      </div>

      {/* Preset Sprint Buttons */}
      <div className="w-full max-w-lg">
        <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
          FOCUS SPRINT DURATION (TUNED FOR SHORT ATTENTION SPANS)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((preset) => {
            const isSelected = totalDuration === preset.mins * 60;
            return (
              <button
                key={preset.mins}
                onClick={() => onSelectPreset(preset.mins)}
                className={`py-2 px-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-sm'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm">{preset.label}</span>
                  {preset.isHighlight && <Zap className="w-3 h-3 text-amber-400" />}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">{preset.tag}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
