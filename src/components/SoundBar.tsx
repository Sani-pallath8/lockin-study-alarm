import React from 'react';
import { Volume2, VolumeX, CloudRain, Waves, Radio } from 'lucide-react';
import { AmbientSoundType } from '../types';
import { audioService } from '../services/audioService';

interface SoundBarProps {
  currentSound: AmbientSoundType;
  volume: number;
  onSelectSound: (sound: AmbientSoundType) => void;
  onVolumeChange: (vol: number) => void;
}

export const SoundBar: React.FC<SoundBarProps> = ({
  currentSound,
  volume,
  onSelectSound,
  onVolumeChange,
}) => {
  const soundOptions: { type: AmbientSoundType; label: string; icon: React.ReactNode; desc: string }[] = [
    { type: 'none', label: 'Off', icon: <VolumeX className="w-3.5 h-3.5" />, desc: 'Silent' },
    { type: 'brown', label: 'Brown Noise', icon: <Waves className="w-3.5 h-3.5" />, desc: 'ADHD favorite' },
    { type: 'rain', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" />, desc: 'Cozy drizzle' },
    { type: 'pink', label: 'Pink Noise', icon: <Waves className="w-3.5 h-3.5" />, desc: 'Smooth hum' },
    { type: 'binaural', label: '40Hz Gamma', icon: <Radio className="w-3.5 h-3.5" />, desc: 'Deep focus' },
  ];

  return (
    <div className="w-full rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs sm:text-sm text-neutral-100">Ambient Focus Sound</span>
        </div>

        {/* Volume slider */}
        {currentSound !== 'none' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-neutral-400">{Math.round(volume * 100)}%</span>
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onVolumeChange(val);
                audioService.setAmbientVolume(val);
              }}
              className="w-20 accent-emerald-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Selector pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {soundOptions.map((opt) => {
          const isSelected = currentSound === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => onSelectSound(opt.type)}
              className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                  : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                {opt.icon}
                <span className="truncate">{opt.label}</span>
              </div>
              <div className="text-[10px] text-neutral-500 truncate mt-0.5">{opt.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
