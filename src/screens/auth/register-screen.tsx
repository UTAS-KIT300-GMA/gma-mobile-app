import { RegisterData } from "@/services/authService";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";

/** Placeholder until GMA publishes live legal pages. Replace with production URLs. */
export const GMA_TERMS_AND_CONDITIONS_URL =
  "https://example.com/gma-terms-and-conditions";
export const GMA_PRIVACY_POLICY_URL =
  "https://example.com/gma-privacy-policy";

async function openExternalUrl(url: string) {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert("Unable to open link", "Please try again later.");
  }
}

/**
 * @summary Displays a password strength hint indicating whether the password meets the minimum length requirement.
 * @param password - The current password string entered by the user.
 * @throws {never} Pure display helper does not throw.
 * @Returns {React.JSX.Element | null} Password strength hint or null when empty.
 */
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

/**
 * @summary Renders the registration form with fields for name, date of birth, gender, email, password, and terms agreement.
 * @param onRegisterPress - Callback invoked with the collected email, password, and profile data when the register button is pressed.
 * @param onLoginPress - Callback to navigate back to the login screen.
 * @param loading - When true, disables submission and shows an activity indicator.
 * @throws {never} Validation feedback is handled in UI alerts.
 * @Returns {React.JSX.Element} Registration form screen.
 */
export function RegisterScreen({
  onRegisterPress,
  onLoginPress,
  loading,
}: RegisterUIProps) {
  // Stores registration form field state and validation flags.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [agreed, setAgreed] = useState(false);

  // Date Picker States
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [dateOfBirthError, setDateOfBirthError] = useState("");

  /**
   * @summary Validates registration inputs and forwards normalized payload to parent handler.
   * @throws {never} Validation errors are shown through alerts/messages.
   * @Returns {void} Submits form when valid.
   */
  const handleSubmit = () => {
    if (!firstName || !lastName || !email || !password || !gender) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (!dateOfBirth) {
      setDateOfBirthError("Please select your date of birth.");
      return;
    }

    if (!agreed) {
      Alert.alert(
        "Required",
        "Please confirm you agree to GMA's Terms and Conditions and Privacy Policy.",
      );
      return;
    }

    onRegisterPress(email.trim().toLowerCase(), password, {
      firstName,
      lastName,
      gender: gender.toLowerCase() as "male" | "female" | "other",
      dateOfBirth: dateOfBirth,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Vignette overlay fills the entire screen and is positioned absolutely */}
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

      <ScrollView
        contentContainerStyle={styles.formScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Registration Form */}
        <View style={styles.registerBox}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={colors.darkGrey}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor={colors.darkGrey}
            value={lastName}
            onChangeText={setLastName}
          />

          {/* Date of Birth Picker Menu Trigger */}
          <Pressable
            style={[styles.input, { justifyContent: "center" }]}
            onPress={() => setShowPicker(true)}
          >
            <Text
              style={{
                color: dateOfBirth ? colors.saveBtnTextColor : colors.darkGrey,
                fontSize: 14,
              }}
            >
              {dateOfBirth
                ? dateOfBirth.toLocaleDateString("en-GB")
                : "Date of Birth (DD/MM/YYYY)"}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={dateOfBirth ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                  setDateOfBirthError("");
                }
              }}
            />
          )}

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
            placeholderTextColor={colors.darkGrey}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.darkGrey}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <PasswordStrengthHint password={password} />

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreed }}
            >
              <Ionicons
                name={agreed ? "checkbox" : "square-outline"}
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.checkboxText}>
              I agree to GMA's{" "}
              <Text
                style={styles.linkText}
                onPress={() => void openExternalUrl(GMA_TERMS_AND_CONDITIONS_URL)}
              >
                Terms and Conditions
              </Text>{" "}
              and{" "}
              <Text
                style={styles.linkText}
                onPress={() => void openExternalUrl(GMA_PRIVACY_POLICY_URL)}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

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
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },

  logo: {
    width: 200,
    height: 120,
  },

  formScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 220,
    paddingBottom: 40,
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
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.textOnPrimary,
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
    minHeight: 48,
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
    alignSelf: "flex-start",
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
    width: "100%",
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
    alignItems: "flex-start",
    margin: 10,
    gap: 10,
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
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});