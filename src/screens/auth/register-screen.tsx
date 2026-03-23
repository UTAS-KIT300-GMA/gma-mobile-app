import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import { RegisterData } from "@/services/authService";


function PasswordStrengthHint({ password }: { password: string }) {
  if (!password) return null;
  const isValid = password.length >= 8;
  return (
    <Text
      style={[
        styles.passwordHint,
        isValid ? styles.hintValid : styles.hintInvalid,
      ]}
    >
      {isValid
        ? "✓ Password strong"
        : `${8 - password.length} more characters needed`}
    </Text>
  );
}


interface RegisterUIProps {
  onRegisterPress: (email: string, pass: string, profile: RegisterData) => void;
  onLoginPress: () => void;
  loading?: boolean;
}

export function RegisterScreen({ onRegisterPress, onLoginPress, loading }: RegisterUIProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());

  const handleSubmit = () => {
    onRegisterPress(email.trim().toLowerCase(), password, {
      firstName,
      lastName,
      gender: gender.toLowerCase() as "male" | "female" | "other",
      dateOfBirth,
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.title}>GMA Connect</Text>
        
        <View style={styles.box}>
          <Text style={styles.formHeader}>Create Account</Text>

        <TextInput 
          style={styles.input} 
          placeholder="First Name" 
          placeholderTextColor="#999" 
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Last Name" 
          placeholderTextColor="#999" 
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          keyboardType="email-address" 
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />
        <PasswordStrengthHint password={password} />

          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
            <TouchableOpacity 
              key={g} 
              style={[styles.genderButton, gender === g && styles.genderButtonSelected]}
              onPress={() => setGender(g as any)}
            >
              <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
          onPress={handleSubmit}
            disabled={loading}
          >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Register</Text>
          )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onLoginPress}>
            <Text style={styles.toggleText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#a64d79" },
  scrollContent: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40, paddingHorizontal: 24 },
  box: { width: "100%", maxWidth: 340, backgroundColor: "#FAF0E4", borderRadius: 12, padding: 24, elevation: 5 },
  title: { fontSize: 32, fontWeight: "800", color: "#ffffff", marginBottom: 32, textAlign: "center" },
  formHeader: { fontSize: 20, fontWeight: "600", color: "#25292e", marginBottom: 20, textAlign: "center" },
  input: { width: "100%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12 },
  primaryButton: { backgroundColor: "#25292e", width: "100%", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  toggleText: { marginTop: 16, color: "#a64d79", fontSize: 14, textAlign: "center", fontWeight: "500" },
  genderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, gap: 8 },
  genderButton: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingVertical: 10, alignItems: "center", backgroundColor: "#fff" },
  genderButtonSelected: { borderColor: "#a64d79", backgroundColor: "#fdf0f5" },
  genderText: { color: "#555", fontSize: 12 },
  genderTextSelected: { color: "#a64d79", fontWeight: "600" },
  passwordHint: { fontSize: 12, marginBottom: 12, marginTop: -8, marginLeft: 4 },
  hintValid: { color: "green" },
  hintInvalid: { color: "#a64d79" },
});