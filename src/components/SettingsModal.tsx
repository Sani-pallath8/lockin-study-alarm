import React from 'react';
import { X, Bell, Volume2, Mic, ShieldAlert, Monitor, Check, Target } from 'lucide-react';
import { AppSettings, AlarmSoundType } from '../types';
import { audioService } from '../services/audioService';
import { notificationService } from '../services/notificationService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onNotificationPermitted: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onNotificationPermitted,
}) => {
  if (!isOpen) return null;

  const alarmSounds: { id: AlarmSoundType; label: string }[] = [
    { id: 'radar', label: 'Radar Sonar' },
    { id: 'gentle', label: 'Gentle Chime' },
    { id: 'urgent', label: 'Urgent Alert' },
    { id: 'bell', label: 'Zen Bell Bowl' },
    { id: 'retro', label: '8-Bit Retro' },
  ];

  const intervals = [
    { value: 3, label: 'Every 3 min (Strict)' },
    { value: 5, label: 'Every 5 min' },
    { value: 10, label: 'Every 10 min' },
    { value: 15, label: 'Every 15 min' },
    { value: 20, label: 'Every 20 min' },
  ];

  const handleRequestNotif = async () => {
    const perm = await notificationService.requestPermission();
    if (perm === 'granted') {
      onNotificationPermitted();
      notificationService.sendFocusAlarm("LockIn Notifications Active", "You'll now receive laptop alerts if you drift from your study session!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-900 border border-neutral-700/80 p-6 sm:p-7 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-lg font-bold text-white">Study Alarm & Focus Settings</h3>
            <p className="text-xs text-neutral-400">Customize intervals, alarms, and anti-doomscroll triggers</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Daily Focus Minutes Goal */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                Daily Focus Minutes Goal
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {settings.dailyFocusGoalMinutes || 60} mins/day
            </span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Sets the target for your circular progress bar on the dashboard.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
            {[30, 40, 60, 80, 100, 120].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => onUpdateSettings({ dailyFocusGoalMinutes: mins })}
                className={`py-1.5 px-2 rounded-xl border text-xs font-mono font-semibold text-center transition-all cursor-pointer ${
                  (settings.dailyFocusGoalMinutes || 60) === mins
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-neutral-400 shrink-0">Custom goal:</span>
            <input
              type="number"
              min="10"
              max="600"
              step="5"
              value={settings.dailyFocusGoalMinutes || 60}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) {
                  onUpdateSettings({ dailyFocusGoalMinutes: val });
                }
              }}
              className="w-24 bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs text-neutral-500">minutes</span>
          </div>
        </div>

        {/* 1. Periodic Check-In Alarm Interval */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                "Are you studying right now?" Check-in Frequency
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableCheckInAlarms}
                onChange={(e) => onUpdateSettings({ enableCheckInAlarms: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Periodically pops up with a sound alarm and asks if you are still locked in or got sidetracked by Instagram.
          </p>

          {settings.enableCheckInAlarms && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {intervals.map((int) => (
                <button
                  key={int.value}
                  type="button"
                  onClick={() => onUpdateSettings({ checkInIntervalMinutes: int.value })}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                    settings.checkInIntervalMinutes === int.value
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Alarm Sound Picker */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-semibold text-neutral-200">Alarm Sound Tone</span>
            </div>
            <button
              type="button"
              onClick={() => audioService.playAlarm(settings.alarmSound, settings.alarmVolume)}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
            >
              Test Tone
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {alarmSounds.map((snd) => (
              <button
                key={snd.id}
                type="button"
                onClick={() => {
                  onUpdateSettings({ alarmSound: snd.id });
                  audioService.playAlarm(snd.id, settings.alarmVolume);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-left transition-all cursor-pointer ${
                  settings.alarmSound === snd.id
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-400'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Spoken Voice Reminder */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                Spoken Voice Motivation
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableVoiceReminder}
                onChange={(e) => onUpdateSettings({ enableVoiceReminder: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <p className="text-xs text-neutral-400">
            Speaks aloud through your laptop speakers: "Are you studying right now? Put the phone down!"
          </p>

          {settings.enableVoiceReminder && (
            <div className="space-y-2">
              <input
                type="text"
                value={settings.voiceText}
                onChange={(e) => onUpdateSettings({ voiceText: e.target.value })}
                placeholder="Spoken phrase..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => audioService.speakMotivation(settings.voiceText)}
                className="text-xs text-blue-400 hover:text-blue-300 underline font-mono cursor-pointer"
              >
                Test Voice Speech
              </button>
            </div>
          )}
        </div>

        {/* 4. Tab Switch Shield Guard */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm font-semibold text-neutral-200">
                Tab Switch Doomscroll Trap
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableTabShield}
                onChange={(e) => onUpdateSettings({ enableTabShield: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
          <p className="text-xs text-neutral-400">
            Alerts you if you minimize the tab or switch away to Instagram, YouTube, or social media while your sprint is running.
          </p>
        </div>

        {/* 5. Desktop Notifications */}
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-neutral-200">System Desktop Notifications</div>
              <div className="text-[11px] text-neutral-400">
                Allows alerts even if your browser is in the background.
              </div>
            </div>
          </div>
          {notificationService.getPermission() === 'granted' ? (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Allowed
            </span>
          ) : (
            <button
              type="button"
              onClick={handleRequestNotif}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors cursor-pointer"
            >
              Enable
            </button>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
