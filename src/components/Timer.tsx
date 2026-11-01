import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Gift, Zap, Bell, BellRing, Sparkles, Check } from 'lucide-react';

interface TimerProps {
  timeLeft: number; // in seconds
  totalDuration: number; // in seconds
  isRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSelectPreset: (minutes: number) => void;
  onFinishSprintEarly: () => void;
  activeTaskTitle?: string;
  // "Are you studying right now?" Alarm timer props
  alarmIntervalMinutes: number;
  onSelectAlarmInterval: (minutes: number) => void;
  isAlarmEnabled: boolean;
  onToggleAlarmEnabled: () => void;
  secondsUntilNextAlarm: number;
  onTriggerTestAlarm: () => void;
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
  alarmIntervalMinutes,
  onSelectAlarmInterval,
  isAlarmEnabled,
  onToggleAlarmEnabled,
  secondsUntilNextAlarm,
  onTriggerTestAlarm,
}) => {
  const [customSprintMins, setCustomSprintMins] = useState('');
  const [isEditingCustomSprint, setIsEditingCustomSprint] = useState(false);

  const [customAlarmMins, setCustomAlarmMins] = useState('');
  const [isEditingCustomAlarm, setIsEditingCustomAlarm] = useState(false);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Next alarm formatted time
  const alarmMinsLeft = Math.floor(secondsUntilNextAlarm / 60);
  const alarmSecsLeft = secondsUntilNextAlarm % 60;
  const formattedNextAlarm = `${String(alarmMinsLeft).padStart(2, '0')}:${String(alarmSecsLeft).padStart(2, '0')}`;

  // Progress percentage (0 to 100)
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  // Presets with 5m, 15m, 20m, 25m as requested by user
  const sprintPresets = [
    { label: '5m Micro', mins: 5, tag: 'Ultra quick' },
    { label: '15m Sprint', mins: 15, tag: 'Bite-sized' },
    { label: '20m Sweet Spot', mins: 20, tag: 'Recommended', isHighlight: true },
    { label: '25m Standard', mins: 25, tag: 'Classic' },
  ];

  // Alarm interval options: 5min, 15min, 20min, 25min
  const alarmPresets = [
    { label: '5 min', mins: 5, desc: 'Frequent nudge' },
    { label: '15 min', mins: 15, desc: 'Balanced' },
    { label: '20 min', mins: 20, desc: 'Match sprint' },
    { label: '25 min', mins: 25, desc: 'Deep work' },
  ];

  const handleCustomSprintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customSprintMins, 10);
    if (!isNaN(val) && val > 0 && val <= 180) {
      onSelectPreset(val);
      setIsEditingCustomSprint(false);
    }
  };

  const handleCustomAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAlarmMins, 10);
    if (!isNaN(val) && val > 0 && val <= 120) {
      onSelectAlarmInterval(val);
      setIsEditingCustomAlarm(false);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl space-y-6">
      {/* Background ambient glow when running */}
      <div
        className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isRunning ? 'bg-emerald-500/15 opacity-100' : 'bg-transparent opacity-0'
        }`}
      />

      {/* Target Task Notice */}
      <div className="w-full">
        <div className="flex items-center justify-center gap-2 mb-2 text-xs font-mono text-neutral-400">
          <span className={`inline-block w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
          <span>CURRENT OBJECTIVE</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-neutral-100 max-w-md mx-auto truncate">
          {activeTaskTitle || 'Pick or type a study micro-task below'}
        </h2>
      </div>

      {/* Timer Display with Circular Ring */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
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
      <div className="flex flex-wrap items-center justify-center gap-3">
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

      {/* 1. FOCUS SPRINT DURATION PRESETS (5m, 15m, 20m, 25m, or Custom) */}
      <div className="w-full max-w-lg text-left pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
            STUDY SPRINT DURATION ({Math.round(totalDuration / 60)}m active)
          </span>
          <button
            onClick={() => setIsEditingCustomSprint(!isEditingCustomSprint)}
            className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
          >
            {isEditingCustomSprint ? 'Close Custom' : 'Custom Time...'}
          </button>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sprintPresets.map((preset) => {
            const isSelected = totalDuration === preset.mins * 60;
            return (
              <button
                key={preset.mins}
                onClick={() => {
                  onSelectPreset(preset.mins);
                  setIsEditingCustomSprint(false);
                }}
                className={`py-2 px-3 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-sm'
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

        {/* Custom Sprint Input Form */}
        {isEditingCustomSprint && (
          <form onSubmit={handleCustomSprintSubmit} className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400">Custom sprint duration:</span>
            <input
              type="number"
              min="1"
              max="180"
              placeholder="e.g. 12"
              value={customSprintMins}
              onChange={(e) => setCustomSprintMins(e.target.value)}
              className="w-20 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-neutral-400">mins</span>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500 text-neutral-950 hover:bg-emerald-400 cursor-pointer"
            >
              Set
            </button>
          </form>
        )}
      </div>

      {/* 2. "ARE YOU STUDYING RIGHT NOW?" CHECK-IN ALARM TIMER SETUP & TEST ALARM */}
      <div className="w-full max-w-lg rounded-xl bg-neutral-950/80 border border-amber-500/30 p-4 text-left space-y-3">
        {/* Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <BellRing className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>"Are You Studying Right Now?" Alarm Timer</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Pops up with an audio alert to pull you out of Instagram or phone distraction.
              </div>
            </div>
          </div>

          {/* Quick Alarm Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleAlarmEnabled}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                isAlarmEnabled
                  ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 font-bold'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-500'
              }`}
            >
              {isAlarmEnabled ? 'ALARM ON' : 'PAUSED'}
            </button>
          </div>
        </div>

        {/* Alarm Timer Options (5min, 15min, 20min, 25min, or custom) */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-neutral-400">
            <span>Ring alarm every:</span>
            <button
              onClick={() => setIsEditingCustomAlarm(!isEditingCustomAlarm)}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              {isEditingCustomAlarm ? 'Close Custom' : 'Custom Interval...'}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {alarmPresets.map((opt) => {
              const isSelected = alarmIntervalMinutes === opt.mins;
              return (
                <button
                  key={opt.mins}
                  onClick={() => {
                    onSelectAlarmInterval(opt.mins);
                    setIsEditingCustomAlarm(false);
                  }}
                  className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold font-mono">{opt.label}</div>
                  <div className="text-[9px] text-neutral-400 truncate">{opt.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Custom Alarm Interval Input */}
          {isEditingCustomAlarm && (
            <form onSubmit={handleCustomAlarmSubmit} className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-neutral-900 border border-neutral-800">
              <span className="text-xs text-neutral-400">Alarm rings every:</span>
              <input
                type="number"
                min="1"
                max="120"
                placeholder="e.g. 7"
                value={customAlarmMins}
                onChange={(e) => setCustomAlarmMins(e.target.value)}
                className="w-16 bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-neutral-400">mins</span>
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 cursor-pointer"
              >
                Set
              </button>
            </form>
          )}
        </div>

        {/* Live Alarm Status & Integrated Test Alarm Button */}
        <div className="pt-2 border-t border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
            <span className={`w-2 h-2 rounded-full ${isRunning && isAlarmEnabled ? 'bg-amber-400 animate-ping' : 'bg-neutral-600'}`} />
            <span>
              {isAlarmEnabled
                ? isRunning
                  ? `Next alarm in: ${formattedNextAlarm}`
                  : `Armed for every ${alarmIntervalMinutes}m (start sprint)`
                : 'Alarm disabled'}
            </span>
          </div>

          {/* Prominent Test Alarm Button */}
          <button
            onClick={onTriggerTestAlarm}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-all shadow-md shadow-amber-400/20 cursor-pointer active:scale-95 shrink-0"
            title="Test what the 'Are you studying right now?' alarm sound & pop-up looks like"
          >
            <Bell className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Test Alarm Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
