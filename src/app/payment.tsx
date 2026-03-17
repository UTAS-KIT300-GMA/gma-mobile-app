import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useStripe, CardField } from "@stripe/stripe-react-native";
import { Link } from "expo-router";
import { colors } from "../../theme/ThemeProvider";

const API_URL = "https://your-backend-url.example.com"; // Replace with your backend URL

export default function PaymentScreen() {
  const { confirmPayment } = useStripe();
  const [amount, setAmount] = useState("10.00");
  const [loading, setLoading] = useState(false);

  const handlePayPress = async () => {
    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount greater than 0.");
      return;
    }

    try {
      setLoading(true);

      // 1. Create a PaymentIntent on your backend
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(numericAmount * 100), // convert dollars to cents
          currency: "usd",
        }),
      });

      const { clientSecret, error: backendError } = await response.json();

      if (backendError || !clientSecret) {
        Alert.alert("Backend error", backendError ?? "No client secret returned.");
        return;
      }

      // 2. Confirm the payment on the client
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
      });

      if (error) {
        Alert.alert("Payment failed", error.message);
        return;
      }

      if (paymentIntent) {
        Alert.alert(
          "Payment successful",
          `Status: ${paymentIntent.status}\nAmount: $${(paymentIntent.amount / 100).toFixed(2)}`
        );
      }
    } catch (error) {
      Alert.alert("Unexpected error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Test Payment</Text>
        <Text style={styles.description}>
          Enter an amount and pay with a Stripe test card (e.g. 4242 4242 4242
          4242).
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Amount (USD)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholder="10.00"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Card details</Text>
          <CardField
            postalCodeEnabled={false}
            style={styles.cardField}
            cardStyle={{
              backgroundColor: "#ffffff",
              textColor: "#000000",
            }}
          />
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.payButtonText}>Pay</Text>
          )}
        </TouchableOpacity>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back to Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  box: {
    width: 300,
    backgroundColor: colors.secondary,
    alignSelf: "center",
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#c4c4c4",
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#f5f5f5",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  cardField: {
    width: "100%",
    height: 50,
    marginTop: 4,
  },
  payButton: {
    backgroundColor: "#635bff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  backLink: {
    marginTop: 24,
    alignItems: "center",
  },
  backLinkText: {
    color: "#c4c4c4",
    fontSize: 14,
  },
});

