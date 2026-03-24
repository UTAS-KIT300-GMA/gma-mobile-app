import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PaymentMethod =
  | "Credit / Debit Card"
  | "Apple Pay"
  | "Google Pay"
  | "Afterpay"
  | "Visa";

const PAYMENT_OPTIONS: PaymentMethod[] = [
  "Credit / Debit Card",
  "Apple Pay",
  "Google Pay",
  "Afterpay",
  "Visa",
];

function PaymentOptionRow({
  label,
  selected,
  onPress,
}: {
  label: PaymentMethod;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionRow,
        selected ? styles.optionRowSelected : styles.optionRowUnselected,
      ]}
    >
      <Text
        style={[
          styles.optionText,
          selected ? styles.optionTextSelected : styles.optionTextUnselected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function ManagePaymentMethodScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("Credit / Debit Card");

  const handleSave = () => {
    Alert.alert("Saved", `Preferred payment method: ${selectedMethod}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerIconButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Payment Methods</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>
          Select your preferred payment method
        </Text>

        <View style={styles.optionsList}>
          {PAYMENT_OPTIONS.map((option) => (
            <PaymentOptionRow
              key={option}
              label={option}
              selected={selectedMethod === option}
              onPress={() => setSelectedMethod(option)}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
  header: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#400F32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  headerIconButton: {
    padding: 4,
    borderRadius: 999,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    color: colors.textOnSecondary,
    marginBottom: 24,
    maxWidth: 240,
  },
  optionsList: {
    gap: 14,
    marginBottom: 100,
  },
  optionRow: {
    minHeight: 50,
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 14,
    shadowColor: "#400F32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  optionRowSelected: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  optionRowUnselected: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    color: "#ffffff",
    fontWeight: "500",
  },
  optionTextUnselected: {
    color: colors.primary,
    fontWeight: "400",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.saveBtnColor,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: colors.textOnSecondary,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#C0C0C0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});