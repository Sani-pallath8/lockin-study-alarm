import React from 'react';
import { Target, Flame, Sparkles, CheckCircle2, Sliders } from 'lucide-react';

interface DailyGoalProgressProps {
  focusMinutesToday: number;
  dailyGoalMinutes: number;
  isSessionActive: boolean;
  activeSessionElapsedMinutes: number;
  onOpenSettings: () => void;
  onQuickSetGoal?: (minutes: number) => void;
}

export const DailyGoalProgress: React.FC<DailyGoalProgressProps> = ({
  focusMinutesToday,
  dailyGoalMinutes,
  isSessionActive,
  activeSessionElapsedMinutes,
  onOpenSettings,
  onQuickSetGoal,
}) => {
  // Total including any current active session
  const totalMinutes = focusMinutesToday + (isSessionActive ? activeSessionElapsedMinutes : 0);
  const goal = Math.max(1, dailyGoalMinutes || 60);
  const rawPercentage = Math.round((totalMinutes / goal) * 100);
  const cappedPercentage = Math.min(100, Math.max(0, rawPercentage));
  const isGoalReached = totalMinutes >= goal;
  const minutesRemaining = Math.max(0, goal - totalMinutes);

  // SVG circular math
  // Radius = 40, circumference = 2 * Math.PI * 40 = 251.327
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * cappedPercentage) / 100;

  // Approximate sprints count (e.g. 20-minute sessions)
  const sprintsEstimated = Math.ceil(minutesRemaining / 20);

  return (
    <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all">
      {/* Background radial glow */}
      <div
        className={`absolute -top-16 -left-16 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
          isGoalReached
            ? 'bg-emerald-500/20 opacity-100'
            : 'bg-emerald-500/10 opacity-70'
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Circular Progress Bar & Central Metrics */}
        <div className="flex items-center gap-5 sm:gap-6 w-full md:w-auto">
          {/* Circular SVG Progress Bar */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-neutral-800"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`transition-all duration-700 ease-out ${
                  isGoalReached
                    ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                    : 'text-emerald-500'
                }`}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Center percentage & status */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {rawPercentage}%
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 -mt-0.5">
                {isGoalReached ? 'SMASHED' : 'OF GOAL'}
              </span>
            </div>
          </div>

          {/* Details & Target Text */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Daily Focus Goal</span>
              </div>
              {isGoalReached && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400/30" />
                  <span>Target Hit!</span>
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                {totalMinutes}
              </span>
              <span className="text-xs sm:text-sm text-neutral-400 font-mono">
                / {goal} min goal
              </span>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed max-w-sm">
              {isGoalReached ? (
                <span className="text-emerald-300 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
                  <span>Daily quota achieved! Every extra minute is bonus aura.</span>
                </span>
              ) : (
                <span>
                  <strong className="text-white font-semibold">{minutesRemaining} mins</strong> left today
                  {sprintsEstimated > 0 && ` (approx. ${sprintsEstimated} × 20m sprint${sprintsEstimated > 1 ? 's' : ''})`}.
                </span>
              )}
            </p>

            {isSessionActive && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Active session: +{activeSessionElapsedMinutes}m in progress</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Goal Selector & Customization */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-neutral-800/80">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>Quick Goal Presets:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[40, 60, 80, 100].map((mins) => {
              const isSelected = goal === mins;
              return (
                <button
                  key={mins}
                  onClick={() => onQuickSetGoal?.(mins)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/80 border-emerald-500/70 text-emerald-300 font-bold shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                  title={`Set daily goal to ${mins} minutes`}
                >
                  {mins}m
                </button>
              );
            })}

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-neutral-950/60 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Customize daily goal in Settings"
              aria-label="Customize daily goal in Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Hitting daily goal awards +150 bonus Aura</span>
          </div>
        </div>
      </div>
    </div>
  );
};
