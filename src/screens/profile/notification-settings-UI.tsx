import { AppHeader } from "@/components/AppHeader";
import { useAppLocation } from "@/context/GlobalContext";
import { useAuth } from "@/hooks/useAuth";
import { useUserNotificationSettings } from "@/hooks/useUserNotificationSettings";
import { db, doc } from "@/services/authService";
import { colors } from "@/theme/ThemeProvider";
import type { NotificationSettings } from "@/types/notificationSettings";
import { updateDoc } from "@react-native-firebase/firestore";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

function ToggleRow({
  label,
  value,
  onValueChange,
  disabled,
}: ToggleRowProps) {
  return (
    <View style={styles.rowCard}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: "#D9D9D9", true: colors.primary }}
        thumbColor="#ffffff"
        ios_backgroundColor="#D9D9D9"
      />
    </View>
  );
}

/**
 * @summary Renders location-permission status and quick link to system settings.
 */
export function LocationSettingsScreen() {
  const { isLocationOn, locationError, refreshLocation } = useAppLocation();

  useFocusEffect(
    useCallback(() => {
      refreshLocation();
    }, [refreshLocation]),
  );

  const handleLocationToggle = () => {
    Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
  };

  return (
    <View>
      <View style={Lstyles.section}>
        <Text style={Lstyles.sectionTitle}>Privacy & Permissions</Text>

        <View style={Lstyles.rowCard}>
          <View style={Lstyles.labelContainer}>
            <Text style={Lstyles.rowLabel}>Share My Location</Text>
            <Text style={Lstyles.subLabel}>
              {isLocationOn
                ? "Your location is available for distance sorting."
                : locationError ||
                  "Location sharing is disabled in system settings."}
            </Text>
          </View>

          <Switch
            value={isLocationOn}
            onValueChange={handleLocationToggle}
            trackColor={{ false: "#D9D9D9", true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <View style={Lstyles.infoBox}>
        <Text style={Lstyles.infoText}>
          To protect your privacy, manage location permissions directly in system
          settings.
        </Text>
      </View>
    </View>
  );
}

/**
 * @summary Notification preferences stored on `users/{uid}.notificationSettings`.
 */
export default function NotificationSettingsScreen() {
  const { user } = useAuth();
  const uid = user?.uid;
  const { settings, loading } = useUserNotificationSettings();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const persist = async (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    if (!uid) {
      Alert.alert("Sign in required", "Sign in to change notification settings.");
      return;
    }
    const next: NotificationSettings = { ...settings, [key]: value };
    setSavingKey(key);
    try {
      await updateDoc(doc(db, "users", uid), {
        notificationSettings: next,
      });
    } catch (e) {
      console.warn("[notificationSettings] save failed:", e);
      Alert.alert("Error", "Could not save your preference. Try again.");
    } finally {
      setSavingKey(null);
    }
  };

  const busy = loading || savingKey !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Settings" showBack />

      {!uid ? (
        <View style={styles.centered}>
          <Text style={styles.hint}>
            Sign in to manage notification preferences.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Loading preferences…</Text>
            </View>
          ) : null}

          <LocationSettingsScreen />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>General Notifications</Text>
            <Text style={styles.syncHint}>
              Changes save to your account automatically.
            </Text>

            <ToggleRow
              label="Email Notification"
              value={settings.emailNotification}
              disabled={busy}
              onValueChange={(v) => void persist("emailNotification", v)}
            />

            <ToggleRow
              label="Push Notification"
              value={settings.pushNotification}
              disabled={busy}
              onValueChange={(v) => void persist("pushNotification", v)}
            />

            <ToggleRow
              label="SMS Notification"
              value={settings.smsNotification}
              disabled={busy}
              onValueChange={(v) => void persist("smsNotification", v)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promotional Notifications</Text>

            <ToggleRow
              label="Special Offers Notification"
              value={settings.specialOffers}
              disabled={busy}
              onValueChange={(v) => void persist("specialOffers", v)}
            />

            <ToggleRow
              label="Product Update"
              value={settings.productUpdate}
              disabled={busy}
              onValueChange={(v) => void persist("productUpdate", v)}
            />

            <ToggleRow
              label="Payment Reminder"
              value={settings.paymentReminder}
              disabled={busy}
              onValueChange={(v) => void persist("paymentReminder", v)}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 28,
  },
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  hint: {
    fontSize: 15,
    color: colors.darkGrey,
    textAlign: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.darkGrey,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textOnSecondary,
    marginBottom: 4,
  },
  syncHint: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  rowCard: {
    minHeight: 58,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textOnSecondary,
    paddingRight: 16,
  },
});

const Lstyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textOnSecondary,
  },
  rowCard: {
    minHeight: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  labelContainer: { flex: 1, paddingRight: 10 },
  rowLabel: { fontSize: 16, fontWeight: "600", color: colors.textOnSecondary },
  subLabel: { fontSize: 13, color: "#666", marginTop: 4 },
  infoBox: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
  },
});
