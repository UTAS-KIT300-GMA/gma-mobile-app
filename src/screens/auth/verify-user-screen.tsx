import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";

interface VerifyUIProps {
  onResend: () => void;
  onLogout: () => void;
  email: string;
  loading?: boolean;
}

/**
 * @summary Renders the email verification holding screen with resend and cancel actions.
 * @param onResend - Callback for requesting a new verification email.
 * @param onLogout - Callback for cancel/logout action.
 * @param email - User email displayed in the verification message.
 * @param loading - Loading state for async verification actions.
 * @throws {never} Action handlers are delegated to parent callbacks.
 * @Returns {React.JSX.Element} Verification waiting screen.
 */
export const VerifyUI: React.FC<VerifyUIProps> = ({
  onResend,
  onLogout,
  email,
  loading,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.vignetteWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 412 917">
          <Defs>
            <RadialGradient id="vignette" cx="50%" cy="38%" rx="75%" ry="70%">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.00" />
              <Stop offset="45%" stopColor="#000000" stopOpacity="0.05" />
              <Stop offset="75%" stopColor="#5E0A3D" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#4A0830" stopOpacity="0.45" />
            </RadialGradient>
          </Defs>

          <Rect width="412" height="917" fill="url(#vignette)" />
        </Svg>
      </View>
      <SafeAreaView style={styles.topSection} edges={["top"]}>
        {/* Logout Button in Top Left */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={onLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.textOnPrimary} />
          <Text style={styles.logoutText}>Cancel</Text>
        </TouchableOpacity>

        <Ionicons name="paper-plane-outline" size={80} color={colors.textOnPrimary} />
        <Text style={styles.title}>Check your email</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" size="large" />
            <Text style={styles.loadingText}>Verifying link...</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>
            A verification link has been sent to {"\n"}
            <Text style={styles.boldEmail}>{email}</Text>
          </Text>
        )}
        <TouchableOpacity onPress={onResend} disabled={loading}>
          <Text style={styles.resendLink}>Resend link</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  // Vignette overlay fills the entire screen and is positioned absolutely
  vignetteWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingBottom: 70,
  },
  logoutBtn: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: { color: colors.textOnPrimary, marginLeft: 5, fontWeight: "600" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textOnPrimary,
    marginTop: 20,
  },
  loadingContainer: { marginTop: 20, alignItems: "center" },
  loadingText: { color: colors.textOnPrimary, marginTop: 10, fontSize: 14, opacity: 0.9 },
  subtitle: {
    color: colors.textOnPrimary,
    textAlign: "center",
    marginTop: 20,
    opacity: 0.8,
    fontSize: 16,
  },
  boldEmail: { fontWeight: "bold", opacity: 1 },
  resendLink: {
    color: colors.saveBtnColor,
    textDecorationLine: "underline",
    marginTop: 20,
  },
});
