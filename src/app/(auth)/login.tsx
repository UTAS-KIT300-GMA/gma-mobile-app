/**
 * LOGIN MANAGER
 * This file handles the login screen. It checks the user's email
 * and password and makes sure their account is verified before
 * letting them into the main app.
 */
import { LoginScreen } from "@/screens/auth/login-screen";
import {
  getFriendlyError,
  loginUser,
  resendVerificationEmail,
} from "@/services/authService";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

/**
 * Sets up the logic for the login screen.
 * * Outcome:
 * Prepares the login process and navigation, then shows the
 * login screen UI to the user.
 */
export default function LoginRoute() {
  // Stores the navigation tool in the router var to allow moving between the (auth) screens.
  const router = useRouter();

  // Stores a true/false value in the loading var to track if the app is currently trying to sign the user in.
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // Now send userInfo.idToken to your backend/service
      console.log("Google User:", userInfo);

      // Example: await loginWithGoogle(userInfo.idToken);
      // router.replace("/home");
    } catch (error: any) {
      Alert.alert("Google Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    console.log("webClientId", webClientId);

    if (!webClientId) {
      console.error("Google Web Client ID is missing! Check your .env file.");
      return;
    }

    GoogleSignin.configure({
      webClientId: webClientId,
    });
  }, []);

  /**
   * Handles the login button and checks if the user is verified.
   * * Parameters:
   * email - The email the user typed in.
   * password - The password the user typed in.
   * * Outcome:
   * Signs the user in. If they haven't verified their email, it
   * shows a popup with options to resend the link or check their status.
   */
  const handleLogin = async (email: string, password: string) => {
    // Prevent multiple simultaneous login attempts
    if (loading) return;

    // Stores the email address in the cleanEmail var after removing extra spaces and making it lowercase.
    const cleanEmail = email.trim().toLowerCase();

    // Validate inputs
    if (!cleanEmail || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    // Changes the loading var to true to tell the app a background task has started.
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
                },
              },
              {
                text: "Check Status",
                onPress: () => router.push("/verify-user" as any),
              },
            ],
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
          onGoogleLogin={handleGoogleLogin}
          onRegisterPress={() => router.push("/register" as any)}
          onForgotPress={() => router.push("/forgot-password" as any)}
          loading={loading}
      />
  );
}