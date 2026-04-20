import { AppHeader } from "@/components/AppHeader";
import { useAppLocation } from "@/context/GlobalContext";
import { colors } from "@/theme/ThemeProvider";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Linking,
  Platform,
  AppState,
  type AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LocationSettingsScreen() {
  const { isLocationOn, locationError, refreshLocation } = useAppLocation();

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastResumeRefreshRef = useRef(0);

  /** Keeps global `isLocationOn` in sync with Discovery. */
  const syncGlobalLocation = useCallback(() => {
    void refreshLocation();
  }, [refreshLocation]);

  useFocusEffect(
    useCallback(() => {
      syncGlobalLocation();
    }, [syncGlobalLocation]),
  );

  /**
   * After changing system location, some devices never emit background → active;
   * they only fire active again. Refresh whenever we become active (debounced).
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (next !== "active") return;

      const now = Date.now();
      if (now - lastResumeRefreshRef.current < 700) return;
      lastResumeRefreshRef.current = now;

      const wasBackgrounded = /inactive|background/.test(prev);
      const delay = wasBackgrounded ? 450 : 250;
      setTimeout(() => {
        syncGlobalLocation();
      }, delay);
    });

    return () => subscription.remove();
  }, [syncGlobalLocation]);

  const handleLocationToggle = async () => {
    if (Platform.OS === "ios") {
      // iOS: Take them directly to the app settings
      Linking.openURL("app-settings:");
    } else {
      // Android: Take them to location provider settings
      Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
    }
  };

  return (
      <SafeAreaView style={styles.safe}>
        <AppHeader title="Location Settings" showBack />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Permissions</Text>

            <View style={styles.rowCard}>
              <View style={styles.labelContainer}>
                <Text style={styles.rowLabel}>Share My Location</Text>
                <Text style={styles.subLabel}>
                  {isLocationOn
                    ? "Your location is available for distance sorting and nearby features."
                    : locationError
                      ? locationError
                      : "Location sharing is disabled or unavailable. Open system settings to enable it."}
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

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {"To protect your privacy, you must manage location permissions\n" +
                  "directly within your device's system settings."}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  content: { paddingHorizontal: 20, paddingTop: 24, gap: 28 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.textOnSecondary },
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
    borderColor: "#E9ECEF"
  },
  infoText: { fontSize: 14, color: "#666", lineHeight: 20, textAlign: "center" }
});