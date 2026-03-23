import DateTimePicker from "@react-native-community/datetimepicker";
import { Link, Redirect, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "@/hooks/useAuth";
import {
  getFriendlyError,
  loginUser,
  registerUser,
  resendVerificationEmail,
} from "@/services/authService";

// --- Password Hint Component ---
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

export default function AuthScreen() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  if (!initializing && user?.emailVerified) {
    return <Redirect href="/home" />;
  }

  const handleAuth = async () => {
    if (loading) return;

    if (isRegistering) {
      if (!email || !password || !firstName || !lastName || !gender) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
      }
      if (password.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters.");
        return;
      }
      setLoading(true);
      try {
        await registerUser(email.trim().toLowerCase(), password, {
          firstName,
          lastName,
          gender: gender as "male" | "female" | "other",
          dateOfBirth,
        });
        Alert.alert("Success", "Account created! Please verify your email.");
        setIsRegistering(false);
      } catch (e) {
        Alert.alert("Registration Error", getFriendlyError(e));
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        Alert.alert("Error", "Please enter email and password.");
        return;
      }
      setLoading(true);
      try {
        const { verified } = await loginUser(
          email.trim().toLowerCase(),
          password,
        );
        if (!verified) {
          Alert.alert("Verify Email", "Please verify your email first.", [
            { text: "Resend", onPress: resendVerificationEmail },
            { text: "OK" },
          ]);
        }
      } catch (e) {
        Alert.alert("Login Error", getFriendlyError(e));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>GMA Connect</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? "Join our community" : "Connect - Grow - Thrive"}
        </Text>

        <View style={styles.box}>
          <Text style={styles.formHeader}>
            {isRegistering ? "Create Account" : "Welcome Back"}
          </Text>

          {isRegistering && (
            <>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                onSubmitEditing={() => lastNameRef.current?.focus()}
                editable={!loading}
              />
              <TextInput
                ref={lastNameRef}
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                onSubmitEditing={() => emailRef.current?.focus()}
                editable={!loading}
              />

              <View style={styles.genderRow}>
                {(["male", "female", "other"] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      gender === g && styles.genderSelected,
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === g && styles.genderTextSelected,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowPicker(true)}
              >
                <Text style={{ color: "#555" }}>
                  DOB: {dateOfBirth.toLocaleDateString("en-CA")}
                </Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  onChange={(event, selected) => {
                    if (Platform.OS === "android") setShowPicker(false);
                    if (selected) setDateOfBirth(selected);
                  }}
                />
              )}
            </>
          )}

          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {isRegistering && <PasswordStrengthHint password={password} />}

          {loading ? (
            <ActivityIndicator color="#a64d79" style={{ marginVertical: 20 }} />
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
              <Text style={styles.primaryButtonText}>
                {isRegistering ? "Register" : "Login"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => router.push("/forgot-password")}>
              <Text style={styles.linkText}>Forgot password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.toggleText}>
              {isRegistering
                ? "Already have an account? Log in"
                : "New here? Create account"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a64d79",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  box: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FAF0E4",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.8,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: "600",
    color: "#25292e",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    color: "#000",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#25292e",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggleText: {
    marginTop: 16,
    color: "#a64d79",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  guestText: {
    marginTop: 12,
    color: "#666",
    fontSize: 13,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  genderSelected: {
    backgroundColor: "#a64d79",
    borderColor: "#a64d79",
  },
  genderText: {
    textTransform: "capitalize",
    color: "#555",
    fontSize: 12,
  },
  genderTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  passwordHint: {
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  hintValid: { color: "#16a34a" },
  hintInvalid: { color: "#dc2626" },
  linkRow: {
    alignItems: "center",
    marginTop: 8,
  },
  linkText: {
    color: "#007dff",
    fontSize: 14,
  },
});
