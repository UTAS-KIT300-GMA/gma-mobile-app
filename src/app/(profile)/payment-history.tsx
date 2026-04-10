import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const paymentHistory = [
  { id: 1, plan: "GMA Premium Plan", amount: "$10", date: "15/3/26", status: "Successful" },
  { id: 2, plan: "GMA Premium Plan", amount: "$10", date: "15/4/26", status: "Successful" },
  { id: 3, plan: "GMA Premium Plan", amount: "$10", date: "15/5/26", status: "Successful" },
  { id: 4, plan: "GMA Premium Plan", amount: "$10", date: "15/6/26", status: "Successful" },
  { id: 5, plan: "GMA Premium Plan", amount: "$10", date: "15/7/26", status: "Successful" },
  { id: 6, plan: "GMA Premium Plan", amount: "$10", date: "15/8/26", status: "Successful" },
];

export default function PaymentHistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Payment History"
        showBack={true}
        onPressBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {paymentHistory.map((item) => (
          <View key={item.id} style={styles.paymentRow}>
            <View>
              <Text style={styles.planText}>{item.plan}</Text>
              <Text style={styles.dateText}>Paid on {item.date}</Text>
            </View>

            <View style={styles.rightSide}>
              <Text style={styles.amountText}>{item.amount}</Text>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))}
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
    paddingBottom: 40,
  },
  paymentRow: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  planText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#555",
  },
  rightSide: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 13,
    color: "green",
    fontWeight: "600",
  },
});