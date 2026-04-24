import { colors } from "@/theme/ThemeProvider";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";

/**
 * @summary Renders the reset-password UI where users enter a new password using the action code from their reset email.
 * @param oobCode - The action code from the password reset email link; if absent, a manual code input is shown.
 * @param resetEmail - The email address associated with the reset code, displayed for user confirmation.
 * @param checkingCode - When true, shows a loading indicator while the action code is being verified.
 * @param loading - When true, shows an activity indicator on the save button.
 * @param onSave - Callback invoked with the new password, confirmation password, and manual code input when save is pressed.
 * @param modalVisible - Controls the visibility of the result feedback modal.
 * @param modalMessage - The message to display inside the feedback modal.
 * @param onCloseModal - Callback invoked when the modal OK button is pressed.
 * @throws {never} UI delegates save/error handling to parent callbacks.
 * @Returns {React.JSX.Element} Reset-password form and result modal.
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
  // Stores reset-password input values for submission.
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

      <Text style={styles.title}>Reset Password</Text>
      <View style={styles.box}>
        {checkingCode ? (
          <ActivityIndicator style={{ marginBottom: 10 }} />
        ) :(
          !oobCode && (
            <TextInput
              style={styles.input}
              placeholder="Paste code from email"
              onChangeText={setCodeInput}
            />
          )
        )}
        <View style={styles.fieldGroup}>
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
        </View>
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
    height: "auto",
    backgroundColor: colors.background,
    alignSelf: "center",
    paddingHorizontal: 20,
    borderRadius: 14,
    paddingVertical: 32,
    marginTop: 28,
    marginBottom: 50,
    gap: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "600",
    color: colors.textOnPrimary,
    textAlign: "center",
    marginBottom: 40,
  },

  fieldGroup: {
    marginBottom: 10,
    gap: 25,
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

  saveButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  footerLink: {
    color: colors.saveBtnTextColor,
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.textOnPrimary,
    padding: 32,
    borderRadius: 12,
    width: "75%",
    alignItems: "center",
  },

  modalMessage: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
  },

  modalButton: {
    backgroundColor: colors.primary,
    padding: 10,
    marginTop: 8,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },

  modalButtonText: {
    color: colors.textOnPrimary,
  },
});
