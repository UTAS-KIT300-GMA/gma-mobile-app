/**
 * LOGIN MANAGER
 * This file handles the login screen. It checks the user's email
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
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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
          error instanceof Error ? error.message : String(error ?? "Unknown error");
      Alert.alert("Google Error", message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the login button and checks if the user is verified.
   */
  const handleLogin = async (email: string, password: string) => {
    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const { verified } = await loginUser(cleanEmail, password);

      if (!verified) {
        Alert.alert(
            "Verify Email",
            "Your email isn't verified yet. Check your inbox!",
            [
              {
                text: "Resend Email",
                onPress: async () => {
                  try {
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
      Alert.alert("Login Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

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