/**
 **LOGIN ROUTE**
 * This file handles the login UI logic. It checks the user's email
 * and password and makes sure their account is verified before
 * letting them into the main app.
 */
import { LoginScreen } from "@/screens/auth/login-screen";
import {
  ensureGoogleUserFirestoreProfile,
  getFriendlyError,
  loginUser,
  resendVerificationEmail,
  signInWithGoogleIdToken,
} from "@/services/authService";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const webClientId = Constants.expoConfig?.extra?.googleWebClientId;

function getGoogleIdToken(signInResult: unknown): string | undefined {
  const r = signInResult as {
    data?: { idToken?: string };
    idToken?: string;
  };
  return r?.data?.idToken ?? r?.idToken;
}

function getGoogleUserProfile(signInResult: unknown) {
  const r = signInResult as {
    data?: { user?: GoogleSignInUser };
    user?: GoogleSignInUser;
  };
  const u = r?.data?.user ?? r?.user;
  if (!u) return undefined;
  return {
    givenName: u.givenName,
    familyName: u.familyName,
    name: u.name,
    photo: u.photo,
  };
}

type GoogleSignInUser = {
  givenName?: string | null;
  familyName?: string | null;
  name?: string | null;
  photo?: string | null;
};

/**
 * Sets up the logic for the login screen.
 * * Outcome:
 * Prepares the login process and navigation, then shows the
 * login screen UI to the user.
 */
export default function LoginRoute() {
  const router = useRouter(); // Stores the navigation tool  to allow moving between screens.

  const [loading, setLoading] = useState(false); // Stores a true/false value, to track if the app is trying to sign user in.

  useEffect(() => {
    if (webClientId) {
      GoogleSignin.configure({
        webClientId,
      });
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (loading) return;
    if (!webClientId) {
      Alert.alert(
        "Google Sign-In misconfigured",
        "Set expo.extra.googleWebClientId in app.json (Web client ID from Firebase).",
      );
      return;
    }

    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      console.log(signInResult);

      const idToken = getGoogleIdToken(signInResult);
      if (!idToken) {
        throw new Error(
          "Google Sign-In did not return an idToken. Check Web client ID configuration.",
        );
      }

      await signInWithGoogleIdToken(idToken);

      const googleProfile = getGoogleUserProfile(signInResult);
      await ensureGoogleUserFirestoreProfile(googleProfile);

      // RootLayout navigates to (tabs) or (onboarding) from auth + Firestore state.
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : String(error ?? "Unknown error");
      Alert.alert("Google Error", message);
    } finally {
      setLoading(false);
    }
  };

  /**
   *  Handles the login button and checks if the user is verified.
   *
   ** Parameters:
   * email - The email the user typed in.
   * password - The password the user typed in.
   *
   ** Outcome:
   * Signs the user in. If they haven't verified their email, it
   * shows a popup with options to resend the link or check their status.
   */
  const handleLogin = async (email: string, password: string) => {
    if (loading) return; // Prevent multiple simultaneous login attempts

    const cleanEmail = email.trim().toLowerCase(); // Stores the email address after removing extra spaces and making it lowercase.

    // Validate inputs
    if (!cleanEmail || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password.",
      );
      return;
    }

    // Changes var to true to tell app, a background task has started.
    setLoading(true);
    try {
      // Attempt login
      const { verified } = await loginUser(cleanEmail, password);

      // Email is not verified
      if (!verified) {
        Alert.alert(
          "Verify Email",
          "Please verify your email before logging in. Check your inbox for the verification link.",
          [
            {
              text: "Resend Email",
              onPress: async () => {
                try {
                  // Sends a new verification email using authService
                  await resendVerificationEmail();
                  Alert.alert("Email Sent", "Verification email resent.");
                } catch (e) {
                  Alert.alert("Something went wrong", getFriendlyError(e));
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
      // Handles login errors
    } catch (e) {
      Alert.alert(
        "Login Failed",
        "Invalid email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Passes login logic,current state and navigation handlers to the UI screen.
  return (
    <LoginScreen
      onLogin={handleLogin}
      onGoogleLogin={handleGoogleLogin}
      onRegisterPress={() => router.push("/register" as any)}
      onForgotPress={() => router.push("/forgot-password" as any)}
      loading={loading}
    />
  );
}
