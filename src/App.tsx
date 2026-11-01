/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Timer } from './components/Timer';
import { DoomscrollShield } from './components/DoomscrollShield';
import { TodoList } from './components/TodoList';
import { SoundBar } from './components/SoundBar';
import { CheckInModal } from './components/CheckInModal';
import { LootBoxModal } from './components/LootBoxModal';
import { TrophyShelfModal } from './components/TrophyShelfModal';
import { SettingsModal } from './components/SettingsModal';
import { GroundingResetModal } from './components/GroundingResetModal';
import { audioService } from './services/audioService';
import { notificationService } from './services/notificationService';
import { DailyGoalProgress } from './components/DailyGoalProgress';
import { Task, UserStats, AppSettings, AmbientSoundType } from './types';
import { Shield, Sparkles, Flame, Coffee, Minimize2 } from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  {
    id: 'starter-1',
    title: 'First 20-min deep study session (phone face down)',
    estimatedMinutes: 20,
    completed: false,
    subtasks: [
      { id: 'sub-1', title: 'Put phone 10 feet away or face down', completed: false },
      { id: 'sub-2', title: 'Skim 2 pages or solve 1 practice question', completed: false },
    ],
  },
  {
    id: 'starter-2',
    title: 'Review lecture notes & write 3 key takeaways',
    estimatedMinutes: 15,
    completed: false,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  checkInIntervalMinutes: 5,
  enableCheckInAlarms: true,
  enableTabShield: true,
  enableVoiceReminder: true,
  voiceText: 'Are you studying right now? Put your phone down and lock in!',
  alarmSound: 'radar',
  alarmVolume: 0.8,
  ambientVolume: 0.35,
  defaultFocusDuration: 20, // 20 minutes specifically for user's attention span
  dailyFocusGoalMinutes: 60, // Default daily focus goal: 60 minutes
  themeMode: 'dark',
};

const DEFAULT_STATS: UserStats = {
  auraPoints: 120,
  focusMinutesToday: 0,
  tasksCompleted: 0,
  distractionTrapsDodged: 0,
  unlockedStickers: ['academic-weapon'],
  currentStreakDays: 1,
  lastStudyDate: new Date().toISOString().slice(0, 10),
};

export default function App() {
  // Load state from localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('lockin_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('lockin_stats');
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('lockin_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeTaskId, setActiveTaskId] = useState<string>(() => {
    return tasks.find((t) => !t.completed)?.id || '';
  });

  // Timer states
  const [focusDurationMinutes, setFocusDurationMinutes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Check-In Alarm tracking
  const [secondsSinceLastCheckIn, setSecondsSinceLastCheckIn] = useState(0);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  // Loot Box & Modals
  const [isLootBoxOpen, setIsLootBoxOpen] = useState(false);
  const [lootBoxTriggerTaskTitle, setLootBoxTriggerTaskTitle] = useState<string>('');
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGroundingOpen, setIsGroundingOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ambient sound
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [ambientVolume, setAmbientVolume] = useState(0.35);

  // Notifications permission state
  const [hasNotifPermission, setHasNotifPermission] = useState(() => {
    return notificationService.getPermission() === 'granted';
  });

  // Tab title flash ref
  const titleFlashIntervalRef = useRef<number | null>(null);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('lockin_tasks', JSON.stringify(tasks));
    } catch {
      // Ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('lockin_stats', JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('lockin_settings', JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Streak calculation on mount
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (stats.lastStudyDate !== today) {
      const lastDate = new Date(stats.lastStudyDate);
      const currentDate = new Date(today);
      const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        setStats((prev) => ({
          ...prev,
          currentStreakDays: prev.currentStreakDays + 1,
          lastStudyDate: today,
          focusMinutesToday: 0,
        }));
      } else if (diffDays > 1) {
        setStats((prev) => ({
          ...prev,
          currentStreakDays: 1,
          lastStudyDate: today,
          focusMinutesToday: 0,
        }));
      }
    }
  }, [stats.lastStudyDate]);

  // Tab switch detection (Doomscroll Shield)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!settings.enableTabShield || !isRunning) return;

      if (document.hidden) {
        // User switched away from the app!
        // Start flashing title immediately
        let isAlt = false;
        if (titleFlashIntervalRef.current) clearInterval(titleFlashIntervalRef.current);
        titleFlashIntervalRef.current = window.setInterval(() => {
          document.title = isAlt
            ? '🚨 ARE YOU STUDYING RIGHT NOW?'
            : '⚠️ DO NOT DOOMSCROLL!';
          isAlt = !isAlt;
        }, 800);

        // Send desktop notification
        notificationService.sendDoomscrollWarning();

        // Increment traps dodged
        setStats((prev) => ({
          ...prev,
          distractionTrapsDodged: prev.distractionTrapsDodged + 1,
        }));
      } else {
        // User came back!
        if (titleFlashIntervalRef.current) {
          clearInterval(titleFlashIntervalRef.current);
          titleFlashIntervalRef.current = null;
        }

        // Trigger alarm check-in when returning
        triggerCheckInAlarm();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (titleFlashIntervalRef.current) clearInterval(titleFlashIntervalRef.current);
    };
  }, [settings.enableTabShield, isRunning]);

  // Helper to trigger "Are you studying right now?" check-in
  const triggerCheckInAlarm = useCallback(() => {
    setIsCheckInOpen(true);
    audioService.playAlarm(settings.alarmSound, settings.alarmVolume);
    if (settings.enableVoiceReminder) {
      audioService.speakMotivation(settings.voiceText);
    }
    notificationService.sendFocusAlarm();
  }, [settings.alarmSound, settings.alarmVolume, settings.enableVoiceReminder, settings.voiceText]);

  // Timer Tick Interval
  useEffect(() => {
    let interval: number | null = null;

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Sprint Finished!
            handleSprintComplete();
            return 0;
          }
          return prev - 1;
        });

        // Update document title with remaining time
        const mins = Math.floor((timeLeft - 1) / 60);
        const secs = (timeLeft - 1) % 60;
        document.title = `(${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}) Locked In | LockIn`;

        // Check-in alarm timer
        if (settings.enableCheckInAlarms) {
          setSecondsSinceLastCheckIn((sec) => {
            const nextSec = sec + 1;
            const threshold = settings.checkInIntervalMinutes * 60;
            if (nextSec >= threshold) {
              triggerCheckInAlarm();
              return 0;
            }
            return nextSec;
          });
        }
      }, 1000);
    } else if (!isRunning) {
      document.title = 'LockIn - Study Alarm & Loot Box';
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, settings.enableCheckInAlarms, settings.checkInIntervalMinutes, triggerCheckInAlarm]);

  // When a sprint naturally completes
  const handleSprintComplete = () => {
    setIsRunning(false);
    audioService.playFanfare();
    notificationService.sendSprintCompleteNotification();

    // Add stats & check daily focus goal
    const minutesCompleted = focusDurationMinutes;
    const goal = settings.dailyFocusGoalMinutes || 60;
    const hitGoalNow = stats.focusMinutesToday < goal && (stats.focusMinutesToday + minutesCompleted) >= goal;
    const goalBonus = hitGoalNow ? 150 : 0;

    if (hitGoalNow) {
      notificationService.sendFocusAlarm(
        "🔥 Daily Focus Goal Smashed!",
        `You completed your ${goal}-minute study goal today! +150 bonus Aura points unlocked!`,
        'goal-smashed'
      );
    }

    setStats((prev) => ({
      ...prev,
      focusMinutesToday: prev.focusMinutesToday + minutesCompleted,
      auraPoints: prev.auraPoints + 50 + goalBonus,
    }));

    // Trigger Loot Box cracking modal
    const activeTask = tasks.find((t) => t.id === activeTaskId);
    setLootBoxTriggerTaskTitle(activeTask ? activeTask.title : `${focusDurationMinutes}-min Focus Sprint`);
    setIsLootBoxOpen(true);
  };

  // Timer Controls
  const handleToggleTimer = () => {
    if (!isRunning) {
      // Starting timer - initialize audio context
      audioService.playCheckSound();
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(focusDurationMinutes * 60);
    setSecondsSinceLastCheckIn(0);
  };

  const handleSelectPreset = (minutes: number) => {
    setFocusDurationMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    setSecondsSinceLastCheckIn(0);
  };

  const handleFinishSprintEarly = () => {
    setIsRunning(false);
    const activeTask = tasks.find((t) => t.id === activeTaskId);
    setLootBoxTriggerTaskTitle(activeTask ? activeTask.title : 'Study Focus Sprint');
    setIsLootBoxOpen(true);
  };

  // Check-In Modal responses
  const handleCheckInLockedIn = () => {
    setIsCheckInOpen(false);
    audioService.playCheckSound();
    setStats((prev) => ({ ...prev, auraPoints: prev.auraPoints + 10 }));
    setSecondsSinceLastCheckIn(0);
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handleCheckInCaughtSlacking = () => {
    setIsCheckInOpen(false);
    setIsGroundingOpen(true);
    setStats((prev) => ({
      ...prev,
      distractionTrapsDodged: prev.distractionTrapsDodged + 1,
    }));
    setSecondsSinceLastCheckIn(0);
  };

  const handleCheckInTakeBreak = () => {
    setIsCheckInOpen(false);
    setIsRunning(false);
    setTimeLeft(3 * 60); // 3-minute breather
    setFocusDurationMinutes(3);
    setSecondsSinceLastCheckIn(0);
  };

  // Task Handlers
  const handleAddTask = (title: string, estimatedMinutes = 15, subtasks?: { id: string; title: string; completed: boolean }[]) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      estimatedMinutes,
      completed: false,
      subtasks,
    };
    setTasks((prev) => [newTask, ...prev]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
  };

  const handleToggleTask = (taskId: string) => {
    audioService.playCheckSound();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            // Task completed! Open Loot Box reward modal!
            setLootBoxTriggerTaskTitle(t.title);
            setIsLootBoxOpen(true);
            setStats((s) => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
          }
          return { ...t, completed: nextCompleted, completedAt: nextCompleted ? Date.now() : undefined };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    audioService.playCheckSound();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          return {
            ...t,
            subtasks: t.subtasks.map((sub) => (sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub)),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
      const remaining = tasks.filter((t) => t.id !== taskId && !t.completed);
      setActiveTaskId(remaining[0]?.id || '');
    }
  };

  // Loot Box Reward Claimed
  const handleLootBoxClose = (earnedAura: number, stickerId: string) => {
    setIsLootBoxOpen(false);
    setStats((prev) => {
      const unlocked = prev.unlockedStickers.includes(stickerId)
        ? prev.unlockedStickers
        : [...prev.unlockedStickers, stickerId];
      return {
        ...prev,
        auraPoints: prev.auraPoints + earnedAura,
        unlockedStickers: unlocked,
      };
    });
  };

  // Ambient sound handler
  const handleSelectAmbient = (sound: AmbientSoundType) => {
    setAmbientSound(sound);
    audioService.setAmbientSound(sound, ambientVolume);
  };

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const activeSessionElapsedMinutes = isRunning ? Math.floor(((focusDurationMinutes * 60) - timeLeft) / 60) : 0;
  const secondsUntilNextAlarm = Math.max(0, (settings.checkInIntervalMinutes * 60) - secondsSinceLastCheckIn);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Zen Fullscreen Banner (if fullscreen active) */}
      {isFullscreen && (
        <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ZEN FULLSCREEN MODE (Zero distractions, purely your objective)</span>
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen Mode</span>
          </button>
        </div>
      )}

      {/* Main Top Header */}
      {!isFullscreen && (
        <Header
          stats={stats}
          isFocusing={isRunning}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(true)}
          onOpenTrophyShelf={() => setIsTrophyOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onTriggerCheckIn={triggerCheckInAlarm}
          activeTaskTitle={activeTask?.title}
          alarmIntervalMinutes={settings.checkInIntervalMinutes}
          onSelectAlarmInterval={(mins) => {
            setSettings((prev) => ({ ...prev, checkInIntervalMinutes: mins }));
            setSecondsSinceLastCheckIn(0);
          }}
          secondsUntilNextAlarm={secondsUntilNextAlarm}
        />
      )}

      {/* Main Content Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Anti-Slop Minimal Kicker */}
        {!isFullscreen && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 text-xs text-neutral-400 border-b border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 font-semibold">SESSION GOAL</span>
              <span>·</span>
              <span>20-minute dopamine resets for short attention spans</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Alarms: {settings.enableCheckInAlarms ? `Every ${settings.checkInIntervalMinutes}m` : 'Off'}</span>
              <span>·</span>
              <span>Shield: {settings.enableTabShield ? 'Active' : 'Off'}</span>
            </div>
          </div>
        )}

        {/* Circular Progress Bar: Daily Focus Minutes Goal */}
        {!isFullscreen && (
          <DailyGoalProgress
            focusMinutesToday={stats.focusMinutesToday}
            dailyGoalMinutes={settings.dailyFocusGoalMinutes || 60}
            isSessionActive={isRunning}
            activeSessionElapsedMinutes={activeSessionElapsedMinutes}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onQuickSetGoal={(mins) =>
              setSettings((prev) => ({ ...prev, dailyFocusGoalMinutes: mins }))
            }
          />
        )}

        {/* Core Study Dashboard Grid */}
        <div className={`grid grid-cols-1 ${isFullscreen ? 'max-w-xl mx-auto' : 'lg:grid-cols-12'} gap-6`}>
          {/* Left Column: Timer & Ambient Sound */}
          <div className={isFullscreen ? 'w-full space-y-6' : 'lg:col-span-7 space-y-6'}>
            <Timer
              timeLeft={timeLeft}
              totalDuration={focusDurationMinutes * 60}
              isRunning={isRunning}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onSelectPreset={handleSelectPreset}
              onFinishSprintEarly={handleFinishSprintEarly}
              activeTaskTitle={activeTask?.title}
              alarmIntervalMinutes={settings.checkInIntervalMinutes}
              onSelectAlarmInterval={(mins) => {
                setSettings((prev) => ({ ...prev, checkInIntervalMinutes: mins }));
                setSecondsSinceLastCheckIn(0);
              }}
              isAlarmEnabled={settings.enableCheckInAlarms}
              onToggleAlarmEnabled={() =>
                setSettings((prev) => ({ ...prev, enableCheckInAlarms: !prev.enableCheckInAlarms }))
              }
              secondsUntilNextAlarm={secondsUntilNextAlarm}
              onTriggerTestAlarm={triggerCheckInAlarm}
            />

            {/* Ambient Noise Bar */}
            <SoundBar
              currentSound={ambientSound}
              volume={ambientVolume}
              onSelectSound={handleSelectAmbient}
              onVolumeChange={setAmbientVolume}
            />
          </div>

          {/* Right Column: Doomscroll Shield & Tasks */}
          {!isFullscreen && (
            <div className="lg:col-span-5 space-y-6">
              {/* Doomscroll Shield */}
              <DoomscrollShield
                trapsDodged={stats.distractionTrapsDodged}
                isShieldEnabled={settings.enableTabShield}
                onToggleShield={() =>
                  setSettings((prev) => ({ ...prev, enableTabShield: !prev.enableTabShield }))
                }
                onEmergencyReset={() => setIsGroundingOpen(true)}
                notificationsEnabled={hasNotifPermission}
                onRequestNotifications={async () => {
                  const perm = await notificationService.requestPermission();
                  if (perm === 'granted') setHasNotifPermission(true);
                }}
              />

              {/* Micro Study Tasks */}
              <TodoList
                tasks={tasks}
                activeTaskId={activeTaskId}
                onSelectActiveTask={(id) => setActiveTaskId(id)}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onToggleSubtask={handleToggleSubtask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      {!isFullscreen && (
        <footer className="border-t border-neutral-900 py-6 px-4 text-center text-xs text-neutral-500">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>LockIn · Minimalist Study Alarm & Anti-Doomscroll Shield</span>
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <button
                onClick={() => setIsGroundingOpen(true)}
                className="hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Dopamine Reset
              </button>
              <span>·</span>
              <button
                onClick={() => setIsTrophyOpen(true)}
                className="hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Trophy Shelf ({stats.unlockedStickers.length})
              </button>
              <span>·</span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Settings
              </button>
            </div>
          </div>
        </footer>
      )}

      {/* Interactive Modals */}
      {/* 1. "Are you studying right now?" Pop-Up Check-in Alarm */}
      <CheckInModal
        isOpen={isCheckInOpen}
        onLockedIn={handleCheckInLockedIn}
        onCaughtSlacking={handleCheckInCaughtSlacking}
        onTakeBreak={handleCheckInTakeBreak}
        currentSound={settings.alarmSound}
        activeTaskTitle={activeTask?.title}
      />

      {/* 2. Crackable Mystery Loot Box / Egg Modal */}
      <LootBoxModal
        isOpen={isLootBoxOpen}
        onClose={handleLootBoxClose}
        triggerTaskTitle={lootBoxTriggerTaskTitle}
        unlockedStickerIds={stats.unlockedStickers}
      />

      {/* 3. Trophy Shelf & Rewards Modal */}
      <TrophyShelfModal
        isOpen={isTrophyOpen}
        onClose={() => setIsTrophyOpen(false)}
        stats={stats}
      />

      {/* 4. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onNotificationPermitted={() => setHasNotifPermission(true)}
      />

      {/* 5. 30-Second Grounding & Dopamine Detox Modal */}
      <GroundingResetModal
        isOpen={isGroundingOpen}
        onClose={() => setIsGroundingOpen(false)}
      />
    </div>
  );
}
