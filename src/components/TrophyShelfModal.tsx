import React from 'react';
import { X, Sparkles, Flame, ShieldCheck, Trophy, Lock } from 'lucide-react';
import { UserStats } from '../types';
import { ALL_REWARDS } from '../data/rewardsData';

interface TrophyShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export const TrophyShelfModal: React.FC<TrophyShelfModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  // Rank calculation based on Aura
  const getRank = (aura: number) => {
    if (aura >= 2000) return { title: 'Academic Demigod', level: 5 };
    if (aura >= 1200) return { title: 'Supreme Weapon', level: 4 };
    if (aura >= 600) return { title: 'Deep Work Monk', level: 3 };
    if (aura >= 250) return { title: 'Doomscroll Survivor', level: 2 };
    return { title: 'Focus Initiate', level: 1 };
  };

  const rank = getRank(stats.auraPoints);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-700/80 p-6 sm:p-8 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Trophy Shelf & Rewards</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Lv. {rank.level} {rank.title}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cracked loot rewards and stickers from completed study sprints.
            </p>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-mono mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AURA</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">{stats.auraPoints}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-mono mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>STREAK</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">{stats.currentStreakDays} days</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400 text-xs font-mono mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TRAPS DODGED</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">{stats.distractionTrapsDodged}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 text-center">
            <div className="flex items-center justify-center gap-1 text-purple-400 text-xs font-mono mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>TASKS CRUSHED</span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">{stats.tasksCompleted}</div>
          </div>
        </div>

        {/* Stickers Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              COLLECTED STICKERS ({stats.unlockedStickers.length}/{ALL_REWARDS.length})
            </span>
            <span className="text-xs text-neutral-500">
              Complete tasks & sprints to crack more
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ALL_REWARDS.map((reward) => {
              const isUnlocked = stats.unlockedStickers.includes(reward.id);

              return (
                <div
                  key={reward.id}
                  className={`p-3.5 rounded-xl border transition-all text-left relative ${
                    isUnlocked
                      ? 'bg-neutral-950/90 border-neutral-700/80'
                      : 'bg-neutral-950/40 border-neutral-900 opacity-55'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl filter drop-shadow">
                      {isUnlocked ? reward.emoji : '🔒'}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                        reward.rarity === 'Legendary'
                          ? 'bg-amber-500/20 text-amber-300'
                          : reward.rarity === 'Epic'
                          ? 'bg-purple-500/20 text-purple-300'
                          : reward.rarity === 'Rare'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {reward.rarity}
                    </span>
                  </div>

                  <div className="font-bold text-xs text-neutral-100 truncate">
                    {isUnlocked ? reward.title : 'Locked Mystery Reward'}
                  </div>
                  <div className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                    {isUnlocked ? reward.tagline : 'Crack open loot boxes by completing 20m sprints or tasks.'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
