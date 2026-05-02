import { useAuth } from "@/hooks/useAuth";
import { db, doc } from "@/services/authService";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  mergeNotificationSettings,
  type NotificationSettings,
} from "@/types/notificationSettings";
import { onSnapshot } from "@react-native-firebase/firestore";
import { useEffect, useMemo, useState } from "react";

type State = {
  settings: NotificationSettings;
  loading: boolean;
};

/**
 * Live `users/{uid}.notificationSettings` for the signed-in user (defaults until Firestore loads).
 */
export function useUserNotificationSettings(): State {
  const { user } = useAuth();
  const uid = user?.uid;

  const [settings, setSettings] = useState<NotificationSettings>({
    ...DEFAULT_NOTIFICATION_SETTINGS,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(db, "users", uid);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        const raw = snap.exists()
          ? (snap.data() as Record<string, unknown>)?.notificationSettings
          : undefined;
        setSettings(mergeNotificationSettings(raw));
        setLoading(false);
      },
      () => {
        setSettings({ ...DEFAULT_NOTIFICATION_SETTINGS });
        setLoading(false);
      },
    );

    return () => unsub();
  }, [uid]);

  return useMemo(() => ({ settings, loading }), [settings, loading]);
}
