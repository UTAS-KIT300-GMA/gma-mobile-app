import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { auth, resendVerificationEmail, logoutUser, getFriendlyError } from "@/services/authService";
import { VerifyUI } from "@/screens/auth/verify-user-screen"; // Adjust this import to match your folder structure

export default function VerifyUserRoute() {
  /**
   * Logic for the verify-user screen
   * * Outcome:
   * - Displays the user's registered email
   * - Handles manually resending the default Firebase verification email
   * - Handles logging out (canceling verification)
   * - Automatically unmounts when RootLayout detects emailVerified === true
   */

  const router = useRouter();
  
  // Stores a boolean in the loading var to track network requests.
  const [loading, setLoading] = useState(false);

  // Safely extracts the user's email to pass to the UI.
  const userEmail = auth.currentUser?.email ?? "your email address";

  /** * Handles resending the verification email.
   * * Outcome:
   * Triggers the Firebase function to send a new email and shows a success alert.
   */
  const handleResend = async () => {
    setLoading(true);
    try {
      // Sends the default web link (Intercepted by our Android Manifest)
      await resendVerificationEmail();
      Alert.alert("Email Sent", "A new verification link has been sent to your email.");
    } catch (e: any) {
      console.error("Resend error:", e);
      Alert.alert("Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  /** * Handles logging the user out.
   * * Outcome:
   * Ends the Firebase session. The RootLayout's Navigation Guard will 
   * detect the state change and automatically boot the user back to the landing screen.
   */
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      // No router.replace() needed here! 
      // RootLayout is watching, and will automatically redirect when user === null.
    } catch (e: any) {
      console.error("Logout error:", e);
      Alert.alert("Error", getFriendlyError(e));
      setLoading(false);
    }
  };

  return (
    <VerifyUI 
      email={userEmail}
      onResend={handleResend}
      onLogout={handleLogout}
      loading={loading}
    />
  );
}