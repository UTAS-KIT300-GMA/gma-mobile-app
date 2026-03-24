import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { getFriendlyError, RegisterData, registerUser } from "@/services/authService";
import { RegisterScreen } from "@/screens/auth/register-screen";

export default function RegisterRoute() {
  /**
   * Logic for the register-screen
   * * Outcome: 
   * - Validates user input
   * - Creates FirebaseAuth account
   * - Creates Firestore profile
   * - Sends default email verification link (intercepted natively)
   * - Navigates to verification screen
   */

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /** * Validates user registration input.
   * * Parameters:
   * email - user's email
   * password - user's password
   * profile - user's profile data
   * * Outcome:
   * Returns an error string if validation fails, otherwise null.
   */
  const validateRegister = (email: string, password: string, profile: RegisterData) => {
    if (!email || !password || !profile.firstName || !profile.lastName || !profile.gender || !profile.dateOfBirth) {
      return "Please fill in all required fields.";
    }
    if (!email.includes("@")) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  /** * Handles registration process.
   * * Parameters:
   * email - user's email
   * password - user's password
   * profile - user's profile data
   * * Outcome:
   * Registers user and sends verification email, then navigates to verify screen.
   */
  const handleRegister = async (email: string, password: string, profile: RegisterData) => {
    const error = validateRegister(email, password, profile);
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    setLoading(true);
    try {
      // Calls registerUser with only the 3 required arguments.
      // Firebase will use the default web link, and Android will intercept it.
      await registerUser(email, password, profile);

      Alert.alert("Account Created", "Check your inbox for the verification email!", [
        { text: "Continue", onPress: () => router.replace("/verify-user") },
      ]);

    } catch (e) {
      console.error("Registration error:", e);
      Alert.alert("Registration Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterScreen 
      onRegisterPress={handleRegister}
      onLoginPress={() => router.push("/login" as any)} 
      loading={loading} 
    />
  );
}