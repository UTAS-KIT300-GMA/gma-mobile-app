import { colors } from "@/theme/ThemeProvider";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export function ResetPasswordScreen({ oobCode, resetEmail, checkingCode, loading, onSave, modalVisible, modalMessage, onCloseModal }: any) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [codeInput, setCodeInput] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>GMA Connect</Text>

        {checkingCode ? (
          <ActivityIndicator style={{ marginBottom: 10 }} />
        ) : resetEmail ? (
          <Text style={styles.helperText}>Resetting for: {resetEmail}</Text>
        ) : !oobCode && (
          <TextInput 
            style={styles.input} 
            placeholder="Paste code from email" 
            onChangeText={setCodeInput}
          />
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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Password</Text>}
        </TouchableOpacity>

        <Link href={"/" as any} style={styles.footerLink}>Back to Login</Link>
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
  container: { flexGrow: 1, backgroundColor: colors.primary, justifyContent: 'center', padding: 24 },
  box: { backgroundColor: colors.secondary, borderRadius: 12, padding: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: 20 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 12 },
  saveButton: { backgroundColor: "#a64d79", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  helperText: { color: "#fff", textAlign: "center", marginBottom: 10 },
  footerLink: { color: "#007bff", textAlign: "center", marginTop: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "80%", alignItems: "center" },
  modalMessage: { textAlign: "center", marginBottom: 15 },
  modalButton: { backgroundColor: "#a64d79", padding: 10, borderRadius: 8, width: "100%", alignItems: "center" },
  modalButtonText: { color: "#fff" }
});