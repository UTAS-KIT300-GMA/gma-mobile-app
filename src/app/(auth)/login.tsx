import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { getFriendlyError, loginUser, resendVerificationEmail } from "@/services/authService";
import { LoginScreen } from "@/screens/auth/login-screen";

export default function LoginRoute() {
  /**
   * Logic for the login route
   * 
   * Outcome: 
   * Authenticates the user and navigates them to the home page if successful, 
   * or prompts for email verification if the account is not yet verified.
   */

  // Stores the navigation object from Expo Router in router var to allow moving between screens.
  const router = useRouter();

  // Tracks if a Firebase login request is currently processing.
  const [loading, setLoading] = useState(false);

  /** 
   * Handles user login.
   * 
   * Parameters:
   * email - user's email
   * password - user's password
   * 
   * Outcome:
   * Logs in user, shows verification prompt if not verified, or shows errors.
   */
  const handleLogin = async (email: string, password: string) => {
    // Prevent multiple simultaneous login attempts
    if (loading) return;

    // Sanitize email
    const cleanEmail = email.trim().toLowerCase();

    // Validate inputs
    if (!cleanEmail || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      // Attempt login
      const { verified } = await loginUser(cleanEmail, password);

      // Email is not verified
      if (!verified) {
        Alert.alert(
          "Verify Email", 
          "Your email isn't verified yet. Check your inbox!", 
          [
            { 
              text: "Resend Email", 
              onPress: async () => {
                try {
                  // Sends a new verification email using authService
                  await resendVerificationEmail();
                  Alert.alert("Sent", "Verification email resent.");
                } catch (e) {
                  Alert.alert("Error", getFriendlyError(e));
                }
              } 
            },
            { 
              text: "Check Status", 
              onPress: () => router.push("/verify-user" as any) 
            },
          ]
        );
      }

    } catch (e) {
      // Handles login errors
      Alert.alert("Login Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    // Passes the login handler, loading state, and navigation actions to the login screen component
    <LoginScreen 
      onLogin={handleLogin} 
      onRegisterPress={() => router.push("/register" as any)}
      onForgotPress={() => router.push("/forgot-password" as any)}
      loading={loading}
    />
  );
}