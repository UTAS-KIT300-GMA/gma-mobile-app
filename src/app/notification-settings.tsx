import { AppHeader } from "@/src/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
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

export default function NotificationSettingsScreen() {
  const router = useRouter();

  const [emailNotification, setEmailNotification] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);
  const [smsNotification, setSmsNotification] = useState(false);

  const [specialOffers, setSpecialOffers] = useState(true);
  const [productUpdate, setProductUpdate] = useState(false);
  const [paymentReminder, setPaymentReminder] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Notifications Setting"
        showBack
        showActions={false}
        onPressBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>

          <ToggleRow
            label="Email Notification"
            value={emailNotification}
            onValueChange={setEmailNotification}
          />

          <ToggleRow
            label="Push Notification"
            value={pushNotification}
            onValueChange={setPushNotification}
          />

          <ToggleRow
            label="SMS Notification"
            value={smsNotification}
            onValueChange={setSmsNotification}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotional notifications</Text>

          <ToggleRow
            label="Special Offers Notification"
            value={specialOffers}
            onValueChange={setSpecialOffers}
          />

          <ToggleRow
            label="Product Update"
            value={productUpdate}
            onValueChange={setProductUpdate}
          />

          <ToggleRow
            label="Payment Reminder"
            value={paymentReminder}
            onValueChange={setPaymentReminder}
          />
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
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 32,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textOnSecondary,
    marginBottom: 4,
  },
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.textOnSecondary,
    paddingRight: 16,
  },
  divider: {
    height: 28,
  },
});
