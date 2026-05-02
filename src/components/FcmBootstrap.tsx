/**
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
import messaging from "@react-native-firebase/messaging";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";

function alertText(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;
  if (value == null || value === "") return fallback;
  return String(value);
}

/** FCM `data.kind` values that deep-link to event details when `eventId` is set. */
const KINDS_NAVIGATE_TO_EVENT: ReadonlySet<NotificationKind> = new Set([
  "event_cancelled",
  "event_date_changed",
  "event_approval_result",
  "event_recommended",
]);

/** Foreground Alert gets Dismiss + View event (same UX as cancel). */
const KINDS_ALERT_WITH_VIEW_EVENT: ReadonlySet<NotificationKind> = new Set([
  "event_cancelled",
  "event_date_changed",
  "event_recommended",
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

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const uid = user?.uid;
    const ready =
      !!uid && user.emailVerified && isProfileValidated === true;

    if (!ready || notifLoading) {
      return;
    }

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

    const unsubRefresh = messaging().onTokenRefresh(async () => {
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
    if (Platform.OS !== "android") return;

    const unsubOpen = messaging().onNotificationOpenedApp((remoteMessage) => {
      navigateFromPushData(
        remoteMessage?.data as Record<string, string> | undefined,
      );
    });

    void messaging()
      .getInitialNotification()
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
    if (Platform.OS !== "android") return;

    const unsub = messaging().onMessage(async (remoteMessage) => {
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

      if (
        kind === "event_recommended" &&
        !prefsRef.current.specialOffers
      ) {
        return;
      }

      const eventId = data?.eventId;

      const open = () => navigateFromPushData(data);

      if (
        kind &&
        eventId &&
        KINDS_ALERT_WITH_VIEW_EVENT.has(kind)
      ) {
        Alert.alert(title, body, [
          { text: "Dismiss", style: "cancel" },
          { text: "View event", onPress: open },
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
