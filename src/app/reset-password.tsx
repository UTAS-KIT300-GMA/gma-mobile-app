import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { colors } from "../../theme/ThemeProvider";
import {
  getFriendlyError,
  getPasswordResetEmail,
  resetPasswordWithCode,
} from "../services/authService";

export default function ForgotPasswordStepTwoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ oobCode?: string }>();
  const oobCode = useMemo(() => {
    const raw = params?.oobCode;
    return typeof raw === "string" ? raw : undefined;
  }, [params?.oobCode]);
  const [codeInput, setCodeInput] = useState("");
  const effectiveCode = (oobCode ?? codeInput.trim()) || undefined;

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState(
    "Password saved successfully!",
  );
  const [success, setSuccess] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!effectiveCode) return;

    setCheckingCode(true);
    getPasswordResetEmail(effectiveCode)
      .then((email) => {
        if (!cancelled) setResetEmail(email);
      })
      .catch((e) => {
        if (!cancelled) {
          setResetEmail(null);
          setSuccess(false);
          setModalMessage(getFriendlyError(e));
          setModalVisible(true);
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingCode(false);
      });

    return () => {
      cancelled = true;
    };
  }, [effectiveCode]);

  const handleSave = async () => {
    if (loading) return;

    if (!effectiveCode) {
      setModalMessage(
        "Open the password reset link from your email (or paste the reset code) to set a new password.",
      );
      setSuccess(false);
      setModalVisible(true);
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setModalMessage("Please enter and confirm your new password.");
      setSuccess(false);
      setModalVisible(true);
      return;
    }

    if (newPassword.length < 8) {
      setModalMessage("Password must be at least 8 characters.");
      setSuccess(false);
      setModalVisible(true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setModalMessage("Passwords do not match.");
      setSuccess(false);
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithCode(effectiveCode, newPassword);
      setModalMessage("Password saved successfully!");
      setSuccess(true);
      setModalVisible(true);
    } catch (e) {
      setModalMessage(getFriendlyError(e));
      setSuccess(false);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    if (success) {
      router.replace("/");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>GMA Connect</Text>

        {!effectiveCode ? (
          <Text style={styles.helperText}>
            Please open the password reset link from your email. This screen
            needs the reset code from that link (you can also paste it below).
          </Text>
        ) : checkingCode ? (
          <View style={styles.inlineRow}>
            <ActivityIndicator />
            <Text style={styles.helperText}>Validating reset link…</Text>
          </View>
        ) : resetEmail ? (
          <Text style={styles.helperText}>
            Resetting password for: {resetEmail}
          </Text>
        ) : null}

        {!oobCode && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Reset code</Text>
            <TextInput
              style={styles.input}
              value={codeInput}
              onChangeText={setCodeInput}
              placeholder="Paste code from reset link"
              placeholderTextColor="#888"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
        )}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>New password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor="#888"
            secureTextEntry
            editable={!loading}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm new password</Text>
          <TextInput
            style={styles.input}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#888"
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Password</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Link href="/">
            <Text style={styles.footerLink}>Login</Text>
          </Link>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notification</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseModal}
            >
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
    color: "#ffffff",
    marginBottom: 24,
    textAlign: "center",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#f5f5f5",
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
  saveButton: {
    backgroundColor: "#a64d79",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerRow: {
    alignItems: "center",
    marginTop: 4,
  },
  footerLink: {
    color: "#007bff",
    fontSize: 14,
  },
  helperText: {
    color: "#f5f5f5",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
    opacity: 0.9,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#a64d79",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
