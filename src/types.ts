export interface Task {
  id: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: number;
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export type AlarmSoundType = 'radar' | 'gentle' | 'urgent' | 'bell' | 'retro';

export type AmbientSoundType = 'none' | 'brown' | 'pink' | 'rain' | 'binaural';

export interface StickerReward {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  category: string;
  unlockedAt?: number;
}

export interface UserStats {
  auraPoints: number;
  focusMinutesToday: number;
  tasksCompleted: number;
  distractionTrapsDodged: number;
  unlockedStickers: string[]; // IDs of unlocked stickers
  currentStreakDays: number;
  lastStudyDate: string;
}

export interface AppSettings {
  checkInIntervalMinutes: number; // e.g. 5, 10, 15, 20
  enableCheckInAlarms: boolean;
  enableTabShield: boolean; // detect switching tabs
  enableVoiceReminder: boolean;
  voiceText: string;
  alarmSound: AlarmSoundType;
  alarmVolume: number; // 0 to 1
  ambientVolume: number; // 0 to 1
  defaultFocusDuration: number; // in minutes (e.g. 15, 20, 25)
  dailyFocusGoalMinutes: number; // in minutes (e.g. 60, 90, 120)
  themeMode: 'dark' | 'light';
}
