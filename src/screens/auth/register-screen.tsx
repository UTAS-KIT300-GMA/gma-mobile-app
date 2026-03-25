import { RegisterData } from "@/services/authService";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";

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

export function RegisterScreen({
  onRegisterPress,
  onLoginPress,
  loading,
}: RegisterUIProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [agreed, setAgreed] = useState(false);

  // Store DOB as text while user is typing
  const [dateOfBirthText, setDateOfBirthText] = useState("");
  const [dateOfBirthError, setDateOfBirthError] = useState("");

  const parseDateOfBirth = (text: string): Date | null => {
    const trimmed = text.trim();

    // Must match YYYY-MM-DD exactly
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return null;
    }

    const [yearString, monthString, dayString] = trimmed.split("-");
    const year = Number(yearString);
    const month = Number(monthString);
    const day = Number(dayString);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const parsedDate = new Date(year, month - 1, day);

    // Reject impossible dates like 2025-02-31
    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      return null;
    }

    return parsedDate;
  };

  const handleSubmit = () => {
    const parsedDateOfBirth = parseDateOfBirth(dateOfBirthText);

    if (!parsedDateOfBirth) {
      setDateOfBirthError("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    setDateOfBirthError("");

    if (!agreed) {
      Alert.alert(
        "Required",
        "You must agree to the terms and privacy policy.",
      );
      return;
    }

    onRegisterPress(email.trim().toLowerCase(), password, {
      firstName,
      lastName,
      gender: gender.toLowerCase() as "male" | "female" | "other",
      dateOfBirth: parsedDateOfBirth,
    });
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

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/gma-in-app-white-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Registration Form */}
        <View style={styles.registerBox}>
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
            placeholder="Date of Birth (YYYY-MM-DD)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={dateOfBirthText}
            onChangeText={(text) => {
              setDateOfBirthText(text);
              if (dateOfBirthError) {
                setDateOfBirthError("");
              }
            }}
          />

          {dateOfBirthError ? (
            <Text style={styles.errorText}>{dateOfBirthError}</Text>
          ) : null}

          <View style={styles.genderRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderButton,
                  gender === g && styles.genderButtonSelected,
                ]}
                onPress={() => setGender(g as any)}
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

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreed(!agreed)}
          >
            <Ionicons
              name={agreed ? "checkbox" : "square-outline"}
              size={20}
              color={colors.primary}
            />

            {/*The text next to the checkbox includes links to the terms and privacy policy, to be updated */}
            <Text style={styles.checkboxText}>
              I agree to <Text style={styles.linkText}>GMA Terms</Text> &{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onLoginPress}>
            <Text style={styles.redirectionText}>
              Already have an account? Log in
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
    backgroundColor: colors.primary,
  },

  // Vignette overlay fills the entire screen and is positioned absolutely
  vignetteWrapper: {
    ...StyleSheet.absoluteFillObject,
  },

  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
    transform: [{ translateY: -40 }],
  },

  logo: {
    width: 200,
    height: 120,
    padding: 0,
    margin: 0,
    transform: [{ translateY: 20 }],
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  registerBox: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 30,
    alignItems: "center",
    elevation: 5,
    transform: [{ translateY: -20 }],
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 32,
    textAlign: "center",
  },

  input: {
    width: "100%",
    backgroundColor: colors.textOnPrimary,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    elevation: 2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    width: "100%",
    height: 48,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    color: "#B00020",
    fontSize: 13,
    marginTop: -6,
    marginBottom: 12,
    marginLeft: 2,
  },

  redirectionText: {
    marginTop: 16,
    color: colors.saveBtnTextColor,
    textDecorationLine: "underline",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
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
    borderColor: colors.lightGrey,
    borderRadius: 8,
    elevation: 2,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.textOnPrimary,
  },

  genderButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: "#fdf0f5",
  },

  genderText: {
    color: colors.darkGrey,
    fontSize: 12,
  },

  genderTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },

  passwordHint: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: -8,
    alignSelf: "flex-start",
  },

  hintValid: {
    color: "green",
    alignSelf: "flex-start",
  },

  hintInvalid: {
    color: colors.primary,
    alignSelf: "flex-start",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
    gap: 8,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.saveBtnTextColor,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: colors.saveBtnTextColor,
  },

  linkText: {
    color: colors.saveBtnTextColor,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
