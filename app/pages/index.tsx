import DateTimePicker from "@react-native-community/datetimepicker";
import { Redirect } from "expo-router";
import React, { useRef, useState } from "react";
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
import { useAuth } from "../src/hooks/useAuth";
import {
  getFriendlyError,
  loginUser,
  registerUser,
  resendVerificationEmail,
} from "../src/services/authService";

// ─── Password Hint ────────────────────────────────────────────────────────────

function PasswordStrengthHint({ password }: { password: string }) {
  if (!password) return null;
  const isValid = password.length >= 8;
  return (
    <Text style={[styles.passwordHint, isValid ? styles.passwordHintValid : styles.passwordHintInvalid]}>
      {isValid ? "✓ Password looks good" : `${8 - password.length} more characters needed`}
    </Text>
  );
}



// ─── Component ────────────────────────────────────────────────────────────────

export default function AuthScreen() {
  const { user, initializing } = useAuth();

  if (!initializing && user?.emailVerified) {
    return <Redirect href="/home" />;
  }

  return <AuthForm />;
}

function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [firstName,     setFirstName]     = useState("");
  const [lastName,      setLastName]      = useState("");
  const [gender,        setGender]        = useState<"male" | "female" | "other" | "">("");
  const [dateOfBirth,   setDateOfBirth]   = useState<Date>(new Date());
  const [showPicker,    setShowPicker]    = useState(false);
  const [loading,       setLoading]       = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef    = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const resetForm = () => {
    setEmail(""); setPassword(""); setFirstName("");
    setLastName(""); setGender(""); setDateOfBirth(new Date());
    setIsRegistering(false);
  };

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (loading) return;
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const { verified } = await loginUser(email.trim().toLowerCase(), password);
      if (!verified) {
        Alert.alert(
          "Verify Email",
          "Please verify your email before logging in.",
          [
            { text: "Resend Email", onPress: resendVerificationEmail },
            { text: "OK" },
          ]
        );
      }
      // If verified, useAuth hook detects change and Redirect handles navigation
    } catch (e) {
      Alert.alert("Login Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };



  const handleRegister = async () => {
    if (loading) return;
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
        firstName, lastName,
        gender: gender as "male" | "female" | "other",
        dateOfBirth,
      });
      Alert.alert("Success", "Account created! Please verify your email.");
      resetForm();
    } catch (e) {
      Alert.alert("Registration Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>{isRegistering ? "Create Account" : "Welcome Back"}</Text>

        {isRegistering && (
          <>
            <TextInput
              style={styles.input} placeholder="First Name"
              value={firstName} onChangeText={setFirstName}
              returnKeyType="next" onSubmitEditing={() => lastNameRef.current?.focus()}
              editable={!loading}
            />
            <TextInput
              ref={lastNameRef} style={styles.input} placeholder="Last Name"
              value={lastName} onChangeText={setLastName}
              returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
              editable={!loading}
            />

            <View style={styles.genderRow}>
              {(["male", "female", "other"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderButton, gender === g && styles.genderSelected]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
              <Text style={{ fontSize: 16, color: "#000" }}>
                DOB: {dateOfBirth.toLocaleDateString("en-CA")}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={dateOfBirth} mode="date" display="default" maximumDate={new Date()}
                onChange={(event, selected) => {
                  if (Platform.OS === "android") setShowPicker(false);
                  if (event.type === "set" && selected) setDateOfBirth(selected);
                }}
              />
            )}
            {showPicker && Platform.OS === "ios" && (
              <TouchableOpacity style={styles.dateConfirmButton} onPress={() => setShowPicker(false)}>
                <Text style={styles.dateConfirmText}>Confirm Date</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TextInput
          ref={emailRef} style={styles.input} placeholder="Email"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
          returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />
        <TextInput
          ref={passwordRef} style={styles.input} placeholder="Password (8+ characters)"
          value={password} onChangeText={setPassword}
          secureTextEntry autoCapitalize="none" returnKeyType="done"
          onSubmitEditing={isRegistering ? handleRegister : handleLogin}
          editable={!loading}
        />

        {isRegistering && <PasswordStrengthHint password={password} />}

        {loading ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={isRegistering ? handleRegister : handleLogin}>
              <Text style={styles.buttonText}>{isRegistering ? "Register" : "Log In"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
              <Text style={styles.toggleText}>
                {isRegistering ? "Already have an account? Log in" : "Don't have an account? Register"}
              </Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:           { flexGrow: 1, justifyContent: "center", padding: 24 },
  title:               { fontSize: 28, fontWeight: "700", marginBottom: 24, textAlign: "center" },
  input:               { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, justifyContent: "center" },
  button:              { backgroundColor: "#2563eb", borderRadius: 8, padding: 14, alignItems: "center", marginBottom: 10, marginTop: 8 },
  buttonText:          { color: "#fff", fontWeight: "600", fontSize: 16 },
  spinner:             { marginTop: 12 },
  toggleText:          { textAlign: "center", color: "#2563eb", marginTop: 8, fontSize: 14 },
  genderRow:           { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  genderButton:        { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, alignItems: "center", marginHorizontal: 4 },
  genderSelected:      { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  genderText:          { textTransform: "capitalize", color: "#000" },
  genderTextSelected:  { color: "#fff" },
  passwordHint:        { fontSize: 13, marginTop: -8, marginBottom: 12, marginLeft: 4 },
  passwordHintValid:   { color: "#16a34a" },
  passwordHintInvalid: { color: "#dc2626" },
  dateConfirmButton:   { alignItems: "center", padding: 10, marginBottom: 12 },
  dateConfirmText:     { color: "#2563eb", fontWeight: "600", fontSize: 15 },
});