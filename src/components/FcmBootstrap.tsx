/**
 * FcmBootstrap.tsx
 * Registers Android FCM after auth + profile gate, handles opens and foreground alerts.
 */
import { useAuth } from "@/hooks/useAuth";
import { useUserNotificationSettings } from "@/hooks/useUserNotificationSettings";
import {
  registerUserFcmToken,
  unregisterUserFcmToken,
} from "@/services/fcmService";
import {
  parseNotificationKind,
  type NotificationKind,
} from "@/types/notificationKinds";
import {
  getMessaging,
  hasPermission,
  requestPermission,
  onTokenRefresh,
  onNotificationOpenedApp,
  getInitialNotification,
  onMessage,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

/** Once set, we never show the custom pre-prompt again (OS prompt only if user taps Allow). */
const NOTIF_PREPROMPT_SHOWN_KEY = "notif_preprompt_shown_v1";

function alertText(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;
  if (value == null || value === "") return fallback;
  return String(value);
}

/** Kinds that deep-link to event details when `eventId` is present. */
const KINDS_NAVIGATE_TO_EVENT: ReadonlySet<NotificationKind> = new Set([
  "event_cancelled",
  "event_date_changed",
  "event_recommended",
  "event_reminder_2days",
  "event_reminder_1day",
  "event_details_changed",
]);

/** Kinds that deep-link to booked-events (booking/subscription confirmations). */
const KINDS_NAVIGATE_TO_BOOKINGS: ReadonlySet<NotificationKind> = new Set([
  "event_booking_confirmed",

]);

/** Kinds that deep-link to payment history. */
const KINDS_NAVIGATE_TO_PAYMENT_HISTORY: ReadonlySet<NotificationKind> = new Set([
  "subscription_confirmed",
  "subscription_cancelled",
]);

/** Foreground Alert shows Dismiss + View Event button. */
const KINDS_ALERT_WITH_VIEW_EVENT: ReadonlySet<NotificationKind> = new Set([
  "event_cancelled",
  "event_date_changed",
  "event_recommended",
  "event_reminder_2days",
  "event_reminder_1day",
  "event_details_changed",
]);

/** Foreground Alert shows Dismiss + View Bookings button. */
const KINDS_ALERT_WITH_VIEW_BOOKINGS: ReadonlySet<NotificationKind> = new Set([
  "event_booking_confirmed",
  "subscription_confirmed",
  "subscription_cancelled",
]);

function navigateFromPushData(data: Record<string, string> | undefined) {
  if (!data) return;
  const kind = parseNotificationKind(data.kind);
  const eventId = typeof data.eventId === "string" ? data.eventId : undefined;

  if (kind && eventId && KINDS_NAVIGATE_TO_EVENT.has(kind)) {
    router.push({
      pathname: "/event/event-details",
      params: { id: eventId },
    } as any);
    return;
  }

  if (kind && KINDS_NAVIGATE_TO_BOOKINGS.has(kind)) {
    router.push("/(profile)/booked-events" as any);
  }

  // NOTE: We currently don't have any notification that deep-links to a single payment history, 
  // but will include this after payment is done
  if (kind && KINDS_NAVIGATE_TO_PAYMENT_HISTORY.has(kind)) {
    router.push("/(profile)/payment-history" as any);
  }
}

/**
 * @summary Wires FCM token registration and message routing for Android.
 * @Returns {null} Non-rendering side-effect component.
 */
export function FcmBootstrap() {
  const { user, isProfileValidated } = useAuth();
  const { settings: notifSettings, loading: notifLoading } =
    useUserNotificationSettings();

  const prefsRef = useRef(notifSettings);
  prefsRef.current = notifSettings;

  const pushOn =
    !notifLoading && notifSettings.pushNotification === true;
  const pushOnRef = useRef(pushOn);
  pushOnRef.current = pushOn;

  // ── Effect 1: Permission ──────────────────────────────────────────────────
  // Uses messaging().hasPermission / requestPermission — works on Android
  // (all API levels) and iOS without any version gate.
  useEffect(() => {
    const uid = user?.uid;
    const ready = !!uid && !!user.emailVerified && isProfileValidated === true;
    if (!ready) return;

    void (async () => {
      try {
        // hasPermission: 1=AUTHORIZED, 2=PROVISIONAL, 3=EPHEMERAL — all mean granted.
        const messaging = getMessaging();
        const status = await hasPermission(messaging);
        if (status > 0) return;

        const prepromptShown = await AsyncStorage.getItem(
          NOTIF_PREPROMPT_SHOWN_KEY,
        );
        if (prepromptShown === "1") return;

        await new Promise<void>((resolve) => {
          Alert.alert(
            "Stay in the loop",
            "Allow GMA Connect to send you notifications about event bookings, upcoming events, and important updates.",
            [
              {
                text: "Not Now",
                style: "cancel",
                onPress: () => {
                  void AsyncStorage.setItem(NOTIF_PREPROMPT_SHOWN_KEY, "1").finally(
                    () => resolve(),
                  );
                },
              },
              {
                text: "Allow",
                onPress: () => {
                  void (async () => {
                    await AsyncStorage.setItem(NOTIF_PREPROMPT_SHOWN_KEY, "1");
                    await requestPermission(messaging);
                  })()
                    .catch((e) => {
                      console.warn("[FCM] permission request failed:", e);
                    })
                    .finally(() => resolve());
                },
              },
            ],
          );
        });
      } catch (e) {
        console.warn("[FCM] permission preprompt failed:", e);
      }
    })();
  }, [user?.uid, user?.emailVerified, isProfileValidated]);

  // ── Effect 2: Token registration ─────────────────────────────────────────
  useEffect(() => {
    const uid = user?.uid;
    const ready = !!uid && !!user.emailVerified && isProfileValidated === true;

    if (!ready || notifLoading) return;

    void (async () => {
      try {
        if (pushOn) {
          await registerUserFcmToken(uid);
        } else {
          await unregisterUserFcmToken(uid);
        }
      } catch (e) {
        console.warn("[FCM] register/unregister failed:", e);
      }
    })();

    const messaging = getMessaging();

    const unsubRefresh = onTokenRefresh(messaging, async () => {
      if (!uid || !pushOnRef.current) return;
      try {
        await registerUserFcmToken(uid);
      } catch (e) {
        console.warn("[FCM] onTokenRefresh save failed:", e);
      }
    });

    return () => {
      unsubRefresh();
    };
  }, [
    user?.uid,
    user?.emailVerified,
    isProfileValidated,
    notifLoading,
    pushOn,
  ]);

  useEffect(() => {
    const messaging = getMessaging();
    const unsubOpen = onNotificationOpenedApp(messaging, (remoteMessage) => {
      navigateFromPushData(
        remoteMessage?.data as Record<string, string> | undefined,
      );
    });

    void getInitialNotification(getMessaging())
      .then((remoteMessage) => {
        if (remoteMessage?.data) {
          setTimeout(() => {
            navigateFromPushData(
              remoteMessage.data as Record<string, string>,
            );
          }, 0);
        }
      });

    return () => {
      unsubOpen();
    };
  }, []);

  useEffect(() => {
    const messaging = getMessaging();
    const unsub = onMessage(messaging, async (remoteMessage) => {
      if (!prefsRef.current.pushNotification) return;

      const title = alertText(
        remoteMessage.notification?.title ?? remoteMessage.data?.title,
        "Notification",
      );
      const body = alertText(
        remoteMessage.notification?.body ?? remoteMessage.data?.body,
        "",
      );

      const data = remoteMessage.data as Record<string, string> | undefined;
      const kind = data ? parseNotificationKind(data.kind) : null;

      if (kind === "event_recommended" && !prefsRef.current.specialOffers) {
        return;
      }

      if (
        (kind === "event_reminder_2days" || kind === "event_reminder_1day") &&
        !prefsRef.current.upcomingEventReminders
      ) {
        return;
      }

      const eventId = data?.eventId;
      const open = () => navigateFromPushData(data);

      if (kind && eventId && KINDS_ALERT_WITH_VIEW_EVENT.has(kind)) {
        Alert.alert(title, body, [
          { text: "Dismiss", style: "cancel" },
          { text: "View event", onPress: open },
        ]);
        return;
      }

      if (kind && KINDS_ALERT_WITH_VIEW_BOOKINGS.has(kind)) {
        Alert.alert(title, body, [
          { text: "Dismiss", style: "cancel" },
          { text: "View bookings", onPress: open },
        ]);
        return;
      }

      if (body) {
        Alert.alert(title, body);
      }
    });

    return () => unsub();
  }, []);

  return null;
}
