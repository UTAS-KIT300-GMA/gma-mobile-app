import { colors } from "@/theme/ThemeProvider";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";

interface Props {
  onSendReset: (email: string) => void;
  loading: boolean;
}

export function ForgotPasswordScreen({ onSendReset, loading }: Props) {
  const [email, setEmail] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Vignette overlay */}
      <View style={styles.vignetteWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 412 917">
          <Defs>
            <RadialGradient id="vignette" cx="50%" cy="38%" rx="75%" ry="55%">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.00" />
              <Stop offset="45%" stopColor="#000000" stopOpacity="0.05" />
              <Stop offset="75%" stopColor="#5E0A3D" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#4A0830" stopOpacity="0.45" />
            </RadialGradient>
          </Defs>

          <Rect width="412" height="917" fill="url(#vignette)" />
        </Svg>
      </View>

      <Text style={styles.title}>Reset Password</Text>
      <View style={styles.box}>
        <View style={styles.fieldGroup}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.darkGrey}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={() => onSendReset(email)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.sendButtonText}>Send reset link</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Link href={"/login" as any}>
            <Text style={styles.footerText}>
              Already have an account? Login
            </Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  // Vignette overlay fills the entire screen and is positioned absolutely
  vignetteWrapper: {
    ...StyleSheet.absoluteFillObject,
  },

  box: {
    width: 300,
    height: 250,
    backgroundColor: colors.background,
    alignSelf: "center",
    paddingHorizontal: 20,
    borderRadius: 14,
    paddingTop: 45,
    marginTop: 28,
    marginBottom: 50,
    gap: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "600",
    color: colors.textOnPrimary,
    marginBottom: 24,
    textAlign: "center",
  },

  fieldGroup: {
    marginBottom: 16,
  },

  input: {
    backgroundColor: colors.textOnPrimary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    elevation: 2,
    height: 50,
  },

  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  sendButtonDisabled: {
    opacity: 0.7,
  },

  sendButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },

  footerText: {
    color: colors.saveBtnTextColor,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
