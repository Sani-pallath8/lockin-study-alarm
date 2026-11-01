import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Check, ArrowRight } from 'lucide-react';
import { audioService } from '../services/audioService';
import { StickerReward } from '../types';
import { ALL_REWARDS, GENZ_AFFIRMATIONS } from '../data/rewardsData';

interface LootBoxModalProps {
  isOpen: boolean;
  onClose: (earnedAura: number, stickerId: string) => void;
  triggerTaskTitle?: string;
  unlockedStickerIds: string[];
}

export const LootBoxModal: React.FC<LootBoxModalProps> = ({
  isOpen,
  onClose,
  triggerTaskTitle,
  unlockedStickerIds,
}) => {
  const [crackStep, setCrackStep] = useState(0); // 0 = intact, 1 = cracked 1, 2 = cracked 2, 3 = shattered open
  const [shaking, setShaking] = useState(false);
  const [reward, setReward] = useState<StickerReward | null>(null);
  const [affirmation, setAffirmation] = useState('');
  const [auraEarned, setAuraEarned] = useState(100);

  useEffect(() => {
    if (isOpen) {
      setCrackStep(0);
      setShaking(false);

      // Pick a random affirmation
      const aff = GENZ_AFFIRMATIONS[Math.floor(Math.random() * GENZ_AFFIRMATIONS.length)];
      setAffirmation(aff);

      // Pick a reward - prioritize ones not yet unlocked, or random
      const lockedPool = ALL_REWARDS.filter((r) => !unlockedStickerIds.includes(r.id));
      const pool = lockedPool.length > 0 ? lockedPool : ALL_REWARDS;
      const selected = pool[Math.floor(Math.random() * pool.length)];
      setReward(selected);

      // Aura reward based on rarity
      const baseAura = selected.rarity === 'Legendary' ? 250 : selected.rarity === 'Epic' ? 150 : selected.rarity === 'Rare' ? 100 : 75;
      setAuraEarned(baseAura);
    }
  }, [isOpen, unlockedStickerIds]);

  if (!isOpen) return null;

  const handleCrackTap = () => {
    if (crackStep >= 3) return;

    const nextStep = crackStep + 1;
    setCrackStep(nextStep);
    setShaking(true);
    setTimeout(() => setShaking(false), 380);

    audioService.playCrackSound(nextStep);

    if (nextStep === 3) {
      // Final crack: fanfare + confetti explosion
      audioService.playFanfare();
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    } catch {
      // Ignore confetti failure
    }
  };

  const handleFinish = () => {
    if (reward) {
      onClose(auraEarned, reward.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700/80 p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Decorative backdrop glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

        {/* Header kicker */}
        <div className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
          {crackStep < 3 ? 'TASK CRUSHED REWARD' : 'MYSTERY REWARD UNLOCKED'}
        </div>
        <h3 className="text-2xl font-bold text-white tracking-tight">
          {crackStep < 3 ? 'Crack Open Your Mystery Reward!' : 'You Are Doing Great!'}
        </h3>
        {triggerTaskTitle && (
          <p className="text-xs text-neutral-400 mt-1 truncate max-w-xs mx-auto">
            Completed: <span className="text-neutral-200 font-medium">"{triggerTaskTitle}"</span>
          </p>
        )}

        {/* The Interactive Cracking Egg / Gift Box */}
        <div className="my-8 flex flex-col items-center justify-center">
          {crackStep < 3 ? (
            <div
              onClick={handleCrackTap}
              className={`relative cursor-pointer select-none group transition-transform active:scale-95 ${
                shaking ? 'animate-egg-shake' : 'animate-float'
              }`}
              title="Click or tap to crack!"
            >
              {/* Glowing Aura Behind Box/Egg */}
              <div
                className={`absolute inset-0 rounded-full blur-2xl transition-all duration-300 ${
                  crackStep === 0
                    ? 'bg-amber-500/20 scale-90'
                    : crackStep === 1
                    ? 'bg-amber-400/35 scale-100'
                    : 'bg-emerald-400/50 scale-110 animate-pulse'
                }`}
              />

              {/* Egg / Box Graphic */}
              <div className="relative w-40 h-44 rounded-[50%_50%_46%_46%] bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border-4 border-amber-100/80 shadow-2xl flex items-center justify-center overflow-hidden">
                {/* Surface Sheen */}
                <div className="absolute top-3 left-6 w-10 h-16 rounded-full bg-white/40 blur-xs -rotate-20 pointer-events-none" />

                {/* Cracks SVG Overlay */}
                {crackStep >= 1 && (
                  <svg
                    className="absolute inset-0 w-full h-full text-neutral-900 pointer-events-none"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    {/* Crack 1 */}
                    <path d="M 50 15 L 47 35 L 56 48 L 48 65" className="animate-in fade-in duration-100" />
                    <path d="M 47 35 L 36 40" />
                  </svg>
                )}

                {crackStep >= 2 && (
                  <svg
                    className="absolute inset-0 w-full h-full text-emerald-950 pointer-events-none"
                    viewBox="0 0 100 100"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    {/* Crack 2: deep spiderweb fissures with glow */}
                    <path d="M 56 48 L 72 54 L 80 70" />
                    <path d="M 48 65 L 53 82" />
                    <path d="M 36 40 L 22 52" />
                    <path d="M 50 15 L 62 28" />
                  </svg>
                )}

                {/* Light burst leaking out at step 2 */}
                {crackStep === 2 && (
                  <div className="absolute inset-0 bg-emerald-300/30 blur-md pointer-events-none animate-pulse" />
                )}

                {/* Center Badge Icon */}
                <div className="relative z-10 text-center">
                  <span className="text-3xl sm:text-4xl filter drop-shadow">
                    {crackStep === 0 ? '🎁' : crackStep === 1 ? '⚡' : '✨'}
                  </span>
                </div>
              </div>

              {/* Tap feedback indicator */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-mono text-neutral-300">
                <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                  Tap {3 - crackStep} more {3 - crackStep === 1 ? 'time' : 'times'} to crack!
                </span>
              </div>
            </div>
          ) : (
            /* Shattered / Revealed Reward Screen */
            <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
              {/* Unlocked Sticker Card */}
              {reward && (
                <div className="w-full p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-center relative overflow-hidden">
                  {/* Collectible Emoji Sticker */}
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center text-4xl shadow-lg mb-3">
                    {reward.emoji}
                  </div>

                  {/* Rarity & Title */}
                  <div className="flex items-center justify-center gap-2 text-xs text-neutral-400 mb-1">
                    <span className="font-mono text-amber-400 font-semibold">{reward.rarity} Badge</span>
                    <span>·</span>
                    <span>{reward.category}</span>
                  </div>

                  <h4 className="text-xl font-extrabold text-white">{reward.title}</h4>
                  <p className="text-xs text-neutral-300 mt-1 italic leading-relaxed">
                    "{reward.tagline}"
                  </p>

                  {/* Affirmation Box */}
                  <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium">
                    {affirmation}
                  </div>

                  {/* Aura Gained */}
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-mono text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold">+{auraEarned} Aura Points Added</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {crackStep < 3 ? (
          <button
            onClick={handleCrackTap}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>TAP TO CRACK ({3 - crackStep} LEFT)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>CLAIM REWARD & KEEP COOKING</span>
          </button>
        )}
      </div>
    </div>
  );
};
