import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { Reminder } from '../types';

// FIX: The 'vibrate' property is valid for notifications but not recognized by the current TypeScript type definitions.
// Extend NotificationOptions to include the 'vibrate' property for proper type checking.
interface NotificationOptionsWithVibrate extends NotificationOptions {
  vibrate?: number | number[];
}

const useReminderScheduler = () => {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('reminders', []);

  useEffect(() => {
    const checkReminders = () => {
      if (Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      const updatedReminders = [...reminders];
      let hasChanges = false;

      reminders.forEach((reminder, index) => {
        const reminderTime = new Date(reminder.dateTime);
        if (!reminder.triggered && now >= reminderTime) {
          navigator.serviceWorker.ready.then(registration => {
            const notificationOptions: NotificationOptionsWithVibrate = {
              body: reminder.title,
              icon: '/icon-192.png',
              vibrate: [200, 100, 200],
            };
            registration.showNotification('Nhắc nhở thai kỳ', notificationOptions);
          });
          updatedReminders[index] = { ...reminder, triggered: true };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setReminders(updatedReminders);
      }
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [reminders, setReminders]);
};

export default useReminderScheduler;
