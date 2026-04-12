import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MembershipPlansScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">("premium");

const handleSubscribe = () => {
  if (selectedPlan === "premium") {
    router.push({
      pathname: "/event/payment",
      params: {
        type: "membership",
        title: "Premium Plan",
        price: "9.99",
        ticketType: "Membership",
        benefits:
          "Early access to selected events|Event discounts|Priority booking|Exclusive content",
      },
    } as any);
  } else {
    Alert.alert("Plan Updated", "You are now on the Free plan");
    router.back();
  }
};
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Membership Plans"
        showBack={true}
        onPressBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Free Plan */}
        <Pressable
          style={[
            styles.planCard,
            selectedPlan === "free" && styles.selectedCard,
          ]}
          onPress={() => setSelectedPlan("free")}
        >
          <Text style={styles.planName}>Free Plan</Text>
          <Text style={styles.planPrice}>Free</Text>
          <Text style={styles.planDesc}>Browse events</Text>
          <Text style={styles.planDesc}>RSVP to events</Text>
          <Text style={styles.planDesc}>Access learning content</Text>
        </Pressable>

        {/* Premium Plan */}
        <Pressable
          style={[
            styles.planCard,
            selectedPlan === "premium" && styles.selectedCard,
          ]}
          onPress={() => setSelectedPlan("premium")}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Premium Plan</Text>
            <Text style={styles.badge}>Current plan</Text>
          </View>

          <Text style={styles.planPrice}>$9.99/month</Text>
          <Text style={styles.planDesc}>Early access to selected events</Text>
          <Text style={styles.planDesc}>Event discounts</Text>
          <Text style={styles.planDesc}>Priority booking</Text>
          <Text style={styles.planDesc}>Exclusive content</Text>
        </Pressable>

        {/* Subscribe Button */}
        <Pressable style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeText}>
            {selectedPlan === "premium"
              ? "Subscribe to Premium"
              : "Switch to Free Plan"}
          </Text>
        </Pressable>

        {/* Learn More */}
        <Pressable
          onPress={() =>
            Alert.alert(
              "Plan Details",
              "Premium gives you early access, discounts, and priority booking."
            )
          }
        >
          <Text style={styles.learnMore}>Learn more</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  content: {
    padding: 20,
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  badge: {
    backgroundColor: "#E9C34F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  planPrice: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
  },
  planDesc: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
  },
  subscribeButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  subscribeText: {
    color: "#fff",
    fontWeight: "700",
  },
  learnMore: {
    marginTop: 12,
    textAlign: "center",
    color: colors.primary,
    textDecorationLine: "underline",
  },
});