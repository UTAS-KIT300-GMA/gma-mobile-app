import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationSettings = {
  emailNotification: boolean;
  pushNotification: boolean;
  smsNotification: boolean;
  specialOffers: boolean;
  productUpdate: boolean;
  paymentReminder: boolean;
};

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.rowCard}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#D9D9D9", true: colors.primary }}
        thumbColor="#ffffff"
        ios_backgroundColor="#D9D9D9"
      />
    </View>
  );
}

const defaultSettings: NotificationSettings = {
  emailNotification: true,
  pushNotification: true,
  smsNotification: false,
  specialOffers: true,
  productUpdate: false,
  paymentReminder: true,
};

export default function NotificationSettingsScreen() {
  const [settings, setSettings] =
    useState<NotificationSettings>(defaultSettings);

  const [savedSettings, setSavedSettings] =
    useState<NotificationSettings>(defaultSettings);

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    setSavedSettings(settings);
    Alert.alert("Success", "Notification settings saved.");
  };

  const handleReset = () => {
    setSettings(savedSettings);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Notifications Setting" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>

          <ToggleRow
            label="Email Notification"
            value={settings.emailNotification}
            onValueChange={(value) => handleToggle("emailNotification", value)}
          />

          <ToggleRow
            label="Push Notification"
            value={settings.pushNotification}
            onValueChange={(value) => handleToggle("pushNotification", value)}
          />

          <ToggleRow
            label="SMS Notification"
            value={settings.smsNotification}
            onValueChange={(value) => handleToggle("smsNotification", value)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotional Notifications</Text>

          <ToggleRow
            label="Special Offers Notification"
            value={settings.specialOffers}
            onValueChange={(value) => handleToggle("specialOffers", value)}
          />

          <ToggleRow
            label="Product Update"
            value={settings.productUpdate}
            onValueChange={(value) => handleToggle("productUpdate", value)}
          />

          <ToggleRow
            label="Payment Reminder"
            value={settings.paymentReminder}
            onValueChange={(value) => handleToggle("paymentReminder", value)}
          />
        </View>

        <View style={styles.actionContainer}>
          <Pressable
            style={[
              styles.saveButton,
              !hasChanges && styles.saveButtonDisabled,
            ]}
            onPress={hasChanges ? handleSave : undefined}
          >
            <Text
              style={[
                styles.saveButtonText,
                !hasChanges && styles.saveButtonTextDisabled,
              ]}
            >
              Save Changes
            </Text>
          </Pressable>

          <Pressable onPress={hasChanges ? handleReset : undefined}>
            <Text
              style={[styles.resetText, !hasChanges && styles.actionDisabled]}
            >
              Reset
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textOnSecondary,
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
  actionContainer: {
    marginTop: 8,
    alignItems: "center",
    gap: 14,
  },
  saveButton: {
  width: "100%",
  backgroundColor: colors.saveBtnColor,
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
  justifyContent: "center",
},
  saveButtonDisabled: {
    backgroundColor: "#D9D9D9",
  },
  saveButtonText: {
  color: colors.saveBtnTextColor,
  fontSize: 16,
  fontWeight: "700",
},
  saveButtonTextDisabled: {
    color: "#F5F5F5",
  },
  resetText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  actionDisabled: {
    opacity: 0.4,
  },
});
