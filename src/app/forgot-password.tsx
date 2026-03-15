import { Link } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme/ThemeProvider";

export default function ForgotPasswordStepOneScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

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
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Reset password code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="Enter code"
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send/Ok</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login">
            <Text style={styles.footerLink}>Login</Text>
          </Link>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New here? </Text>
          <Link href="/register">
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

