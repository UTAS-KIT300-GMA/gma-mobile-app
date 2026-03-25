import { colors } from "@/theme/ThemeProvider";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";

/* Reset Password Screen Component 

- This screen allows users to reset their password using a code from their email. 
- It handles the input of the new password, confirmation, and displays feedback through modals. 
- The component is styled to match the app's theme and provides a link back to the login screen.
*/

export function ResetPasswordScreen({
  oobCode,
  resetEmail,
  checkingCode,
  loading,
  onSave,
  modalVisible,
  modalMessage,
  onCloseModal,
}: any) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [codeInput, setCodeInput] = useState("");

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

      <View style={styles.box}>
        {checkingCode ? (
          <ActivityIndicator style={{ marginBottom: 10 }} />
        ) : resetEmail ? (
          <Text style={styles.helperText}>Resetting for: {resetEmail}</Text>
        ) : (
          !oobCode && (
            <TextInput
              style={styles.input}
              placeholder="Paste code from email"
              onChangeText={setCodeInput}
            />
          )
        )}

        <TextInput
          style={styles.input}
          placeholder="New password"
          secureTextEntry
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          onChangeText={setConfirmNewPassword}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave(newPassword, confirmNewPassword, codeInput)}
        >
          {loading ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.buttonText}>Save Password</Text>
          )}
        </TouchableOpacity>

        <Link href={"/login" as any} style={styles.footerLink}>
          Back to Login
        </Link>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={onCloseModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    padding: 24,
  },
  // Vignette overlay fills the entire screen and is positioned absolutely
  vignetteWrapper: {
    ...StyleSheet.absoluteFillObject,
  },

  box: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textOnPrimary,
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: colors.textOnPrimary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  saveButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontWeight: "600",
  },
  helperText: {
    color: colors.textOnPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  footerLink: {
    color: colors.saveBtnTextColor,
    textAlign: "center",
    marginTop: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },

  modalMessage: {
    textAlign: "center",
    marginBottom: 15,
  },

  modalButton: {
    backgroundColor: "#a64d79",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
  },
});
