import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * @summary Displays active membership details and provides plan management actions.
 * @throws {never} User actions are handled with alerts/navigation.
 * @Returns {React.JSX.Element} Membership management screen.
 */
export default function MembershipScreen() {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);

  /**
   * @summary Confirms subscription cancellation and navigates back.
   * @throws {never} Alert flow handles user interaction without throwing.
   * @Returns {void} Closes modal and processes cancellation flow.
   */
  const handleCancelSave = () => {
    setShowCancelModal(false);
    Alert.alert(
      "Subscription Cancelled",
      "Your plan has been cancelled. A confirmation email will be sent.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="My Membership"
        showBack={true}
        onPressBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Current Plan: GMA Premium</Text>
          <Text style={styles.planMeta}>Status: Active</Text>
          <Text style={styles.planMeta}>Next Renewal: 10/06/2026</Text>
        </View>

        <View style={styles.benefitsCard}>
          <Text style={styles.sectionTitle}>Your Benefits</Text>
          <Text style={styles.benefitItem}>☑ Early event access</Text>
          <Text style={styles.benefitItem}>☑ Discount Tickets</Text>
          <Text style={styles.benefitItem}>☑ Priority Booking</Text>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(profile)/membership-plans")}
        >
          <Text style={styles.primaryButtonText}>Change plan</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => setShowCancelModal(true)}
        >
          <Text style={styles.secondaryButtonText}>Cancel subscription</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.push("/(profile)/payment-history")}
        >
          <Text style={styles.secondaryButtonText}>View payment history</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Premium Plan?</Text>
            <Text style={styles.modalText}>
              We’re sorry to see you go. Cancelling your premium plan will
              result in the loss of all premium features.
            </Text>

            <Text style={styles.modalSubTitle}>What you will be missing out on:</Text>
            <Text style={styles.modalList}>• Early bird access to events</Text>
            <Text style={styles.modalList}>• Priority customer support</Text>
            <Text style={styles.modalList}>• Exclusive member events</Text>
            <Text style={styles.modalList}>• Unlimited access to courses</Text>

            <View style={styles.modalButtons}>
              <Pressable style={styles.saveButton} onPress={handleCancelSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>

              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },
  planCard: {
    backgroundColor: "#E9C34F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F1F1F",
    marginBottom: 8,
  },
  planMeta: {
    fontSize: 14,
    color: "#1F1F1F",
    marginBottom: 4,
  },
  benefitsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 15,
    color: colors.primary,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 14,
    lineHeight: 20,
  },
  modalSubTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  modalList: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#E9C34F",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#1F1F1F",
    fontWeight: "700",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#d9d9d9",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "700",
  },
});