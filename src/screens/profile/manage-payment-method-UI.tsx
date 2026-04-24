import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
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

/**
 * @summary Renders one selectable payment option row.
 * @param label - Payment method label.
 * @param selected - Whether the row is currently selected.
 * @param onPress - Callback when row is pressed.
 * @throws {never} Pure render helper does not throw.
 * @Returns {React.JSX.Element} Payment method option row.
 */
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

/**
 * @summary Renders payment-method preference screen and saves selected option.
 * @throws {never} Save and navigation actions are handled via alerts/callbacks.
 * @Returns {React.JSX.Element} Manage payment method screen.
 */
export default function ManagePaymentMethodScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
    "Credit / Debit Card",
  );

  /**
   * @summary Saves the currently selected payment method preference.
   * @throws {never} Uses alert feedback only.
   * @Returns {void} Displays save confirmation.
   */
  const handleSave = () => {
    Alert.alert("Saved", `Preferred payment method: ${selectedMethod}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
    {/* Header */}
      <AppHeader title="Payment Methods" showBack={true} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Select your preferred payment method</Text>

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

          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
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
    backgroundColor: colors.textOnPrimary,
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
    shadowColor: colors.saveBtnTextColor,
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
    backgroundColor: colors.textOnPrimary,
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    color: colors.textOnPrimary,
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
    color: colors.saveBtnTextColor,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.darkGrey,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
