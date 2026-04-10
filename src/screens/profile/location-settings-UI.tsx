import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Linking, // Used to open System Settings
  Platform,
  AppState, // Used to detect when user returns from settings
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location"; // Ensure you have expo-location installed

export default function LocationSettingsScreen() {
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check actual device permission status
  const checkLocationStatus = async () => {
    try {
      // Check if the physical GPS toggle is ON
      const isProviderEnabled = await Location.hasServicesEnabledAsync();

      // Check if the App has permission to use that GPS
      const { status } = await Location.getForegroundPermissionsAsync();

      // The toggle should only be "ON" if both are true
      setIsLocationEnabled(isProviderEnabled && status === "granted");
    } catch (error) {
      console.error("Error checking location status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check permission on mount
  useEffect(() => {
    checkLocationStatus();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setLoading(true);
        // Small timeout ensures the OS has updated the internal state
        setTimeout(() => {
          checkLocationStatus();
        }, 500);
      }
    });

    return () => subscription.remove();
  }, []);

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
                  {isLocationEnabled
                      ? "Your location is currently being shared."
                      : "Location sharing is disabled in system settings."}
                </Text>
              </View>

              <Switch
                  value={isLocationEnabled}
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