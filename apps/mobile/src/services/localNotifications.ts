import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const REMINDER_NOTIFICATION_IDS_KEY = "atomic.localReminderNotificationIds";
const HABIT_REMINDER_CHANNEL_ID = "habit-reminders";

type NotificationsModule = typeof import("expo-notifications");

type NotificationIdsByHabit = Record<string, string[]>;

export type LocalNotificationPermissionStatus = {
  supported: boolean;
  granted: boolean;
  status: string;
  canAskAgain: boolean;
};

export type LocalReminderSummary = {
  habitCount: number;
  notificationCount: number;
};

export type HabitReminderScheduleInput = {
  habitId: string;
  habitName: string;
  enabled: boolean;
  triggerTime: string;
  daysOfWeek: number[];
  body: string;
};

export type HabitReminderScheduleResult =
  | { status: "scheduled"; count: number }
  | { status: "disabled" | "denied" | "unsupported" | "invalid_time" };

export function configureNotificationHandler() {
  if (Platform.OS === "web") {
    return;
  }

  void getNotificationsModule().then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  });
}

export async function scheduleHabitReminder(
  input: HabitReminderScheduleInput,
): Promise<HabitReminderScheduleResult> {
  await cancelHabitReminder(input.habitId);

  if (!input.enabled) {
    return { status: "disabled" };
  }

  if (Platform.OS === "web") {
    return { status: "unsupported" };
  }

  const time = parseTime(input.triggerTime);
  if (!time) {
    return { status: "invalid_time" };
  }

  const permissionGranted = await ensureNotificationPermission();
  if (!permissionGranted) {
    return { status: "denied" };
  }

  const Notifications = await getNotificationsModule();
  await ensureAndroidReminderChannel(Notifications);

  const days = input.daysOfWeek.length ? input.daysOfWeek : [1, 2, 3, 4, 5, 6, 7];
  const identifiers: string[] = [];

  for (const day of days) {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: input.habitName,
        body: input.body,
        data: {
          type: "habit_reminder",
          habitId: input.habitId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        channelId: HABIT_REMINDER_CHANNEL_ID,
        weekday: toExpoWeekday(day),
        hour: time.hour,
        minute: time.minute,
      },
    });

    identifiers.push(identifier);
  }

  await saveHabitReminderNotificationIds(input.habitId, identifiers);

  return {
    status: "scheduled",
    count: identifiers.length,
  };
}

export async function getLocalNotificationPermissionStatus(): Promise<LocalNotificationPermissionStatus> {
  if (Platform.OS === "web") {
    return {
      supported: false,
      granted: false,
      status: "unsupported",
      canAskAgain: false,
    };
  }

  const Notifications = await getNotificationsModule();
  const permissions = await Notifications.getPermissionsAsync();

  return {
    supported: true,
    granted: permissions.granted,
    status: permissions.status,
    canAskAgain: permissions.canAskAgain,
  };
}

export async function requestLocalNotificationPermission(): Promise<LocalNotificationPermissionStatus> {
  if (Platform.OS === "web") {
    return getLocalNotificationPermissionStatus();
  }

  const Notifications = await getNotificationsModule();
  const permissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });

  return {
    supported: true,
    granted: permissions.granted,
    status: permissions.status,
    canAskAgain: permissions.canAskAgain,
  };
}

export async function getLocalReminderSummary(): Promise<LocalReminderSummary> {
  const allIdentifiers = await getHabitReminderNotificationIds();
  const identifiersByHabit = Object.values(allIdentifiers).filter((identifiers) => identifiers.length > 0);

  return {
    habitCount: identifiersByHabit.length,
    notificationCount: identifiersByHabit.reduce((total, identifiers) => total + identifiers.length, 0),
  };
}

export async function clearAllLocalHabitReminders() {
  const allIdentifiers = await getHabitReminderNotificationIds();

  if (Platform.OS !== "web") {
    const Notifications = await getNotificationsModule();
    const identifiers = Object.values(allIdentifiers).flat();
    await Promise.all(
      identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)),
    );
  }

  await AsyncStorage.removeItem(REMINDER_NOTIFICATION_IDS_KEY);
}

export async function cancelHabitReminder(habitId: string) {
  const allIdentifiers = await getHabitReminderNotificationIds();
  const identifiers = allIdentifiers[habitId] ?? [];

  if (Platform.OS !== "web") {
    const Notifications = await getNotificationsModule();
    await Promise.all(
      identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)),
    );
  }

  delete allIdentifiers[habitId];
  await AsyncStorage.setItem(REMINDER_NOTIFICATION_IDS_KEY, JSON.stringify(allIdentifiers));
}

async function ensureNotificationPermission() {
  const Notifications = await getNotificationsModule();
  const currentPermissions = await Notifications.getPermissionsAsync();
  if (currentPermissions.granted) {
    return true;
  }

  const nextPermissions = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });

  return nextPermissions.granted;
}

async function ensureAndroidReminderChannel(Notifications: NotificationsModule) {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(HABIT_REMINDER_CHANNEL_ID, {
    name: "Habit reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function getNotificationsModule() {
  return import("expo-notifications");
}

async function getHabitReminderNotificationIds(): Promise<NotificationIdsByHabit> {
  const raw = await AsyncStorage.getItem(REMINDER_NOTIFICATION_IDS_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as NotificationIdsByHabit;
  } catch {
    return {};
  }
}

async function saveHabitReminderNotificationIds(habitId: string, identifiers: string[]) {
  const allIdentifiers = await getHabitReminderNotificationIds();
  allIdentifiers[habitId] = identifiers;
  await AsyncStorage.setItem(REMINDER_NOTIFICATION_IDS_KEY, JSON.stringify(allIdentifiers));
}

function parseTime(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function toExpoWeekday(day: number) {
  return day === 7 ? 1 : day + 1;
}
