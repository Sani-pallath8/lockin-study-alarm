class NotificationService {
  isSupported(): boolean {
    return 'Notification' in window;
  }

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch {
      return 'denied';
    }
  }

  sendFocusAlarm(title = "🚨 Are you studying right now?", body = "Put the phone down! Get back to your focus session.", tag = 'study-alarm') {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const notif = new Notification(title, {
        body,
        tag,
        requireInteraction: true, // stays on screen until dismissed
        icon: 'https://api.iconify.design/lucide:shield-alert.svg?color=%2310b981',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return notif;
    } catch {
      return null;
    }
  }

  sendDoomscrollWarning() {
    return this.sendFocusAlarm(
      "⚠️ Tab Switch Detected!",
      "Are you studying right now? Don't let Instagram suck you into the doomscroll trap! Click to return.",
      'tab-switch'
    );
  }

  sendSprintCompleteNotification() {
    return this.sendFocusAlarm(
      "🎉 Sprint Complete!",
      "You survived the sprint! Click here to crack your mystery reward loot box.",
      'sprint-done'
    );
  }
}

export const notificationService = new NotificationService();
