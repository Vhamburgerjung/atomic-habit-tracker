import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Habit } from "../store/useHabitStore";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleHabitReminder(habit: Habit): Promise<string> {
  if (Platform.OS === "web" || !habit.reminderTime) return "";
  const [hours, minutes] = habit.reminderTime.split(":").map(Number);
  const titleEmoji = habit.emoji ? `${habit.emoji} ` : "";
  const cueText = habit.cue || "Tippe zum Abhaken";
  const rewardSuffix = habit.reward ? ` · Belohnung: ${habit.reward}` : "";
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${titleEmoji}Zeit für ${habit.name}`,
      body: habit.identityStatement
        ? `I am someone who ${habit.identityStatement} · ${cueText}${rewardSuffix}`
        : `${cueText}${rewardSuffix}`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
  return id;
}

export async function cancelHabitReminder(notificationId: string): Promise<void> {
  if (Platform.OS === "web" || !notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
