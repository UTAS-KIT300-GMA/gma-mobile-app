import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme/ThemeProvider";
import { getFriendlyError, sendPasswordReset } from "../services/authService";

export default function ForgotPasswordStepOneScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (loading) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(normalizedEmail);
      Alert.alert(
        "Check your email",
        "We sent a password reset link. Open it to choose a new password.",
        [{ text: "OK", onPress: () => router.replace("/") }],
      );
    } catch (e) {
      Alert.alert("Couldn’t send reset email", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>GMA Connect</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.sendButtonText}>Send reset link</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/">
            <Text style={styles.footerLink}>Login</Text>
          </Link>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New here? </Text>
          <Link href="/">
            <Text style={styles.footerLink}>Create new account</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  box: {
    width: 300,
    backgroundColor: colors.secondary,
    alignSelf: "center",
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textOnSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.textOnSecondary,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#a64d79",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  footerText: {
    color: "#c4c4c4",
    fontSize: 14,
  },
  footerLink: {
    color: "#007bff",
    fontSize: 14,
  },
});
