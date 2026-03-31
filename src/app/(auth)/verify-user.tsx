/**
 **VERIFICATION ROUTE**
 * Manages the logic for the verification UI.
 * Handles user interactions for resending verification emails and logging out,
 * holding the user in place until their email status is confirmed.
 */
import { VerifyUI } from "@/screens/auth/verify-user-screen"; // Adjust this import to match your folder structure
import {
  auth,
  getFriendlyError,
  logoutUser,
  resendVerificationEmail,
} from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * Logic for the verify user UI.
 *
 ** Outcome:
 * Manages the user's email display and verification resends.
 * Handles logout sessions to safely exit the verification flow.
 * Holds user until their email is confirmed.
 */
export default function VerifyUserRoute() {
  const router = useRouter(); // Router for navigation, if needed in the future.

  const [loading, setLoading] = useState(false); // Stores true/false value to track network requests.
  const userEmail = auth.currentUser?.email ?? "your email address"; // Safely extracts the user's email to pass to the UI.

  const handleResend = async () => {
    /** Handles resending the verification email.
     *
     ** Outcome:
     * Triggers the Firebase function to send a new email and shows a success alert.
     */
    if (!auth.currentUser) {
      Alert.alert("Session ended", "Please log in again.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/landing"),
        },
      ]);
      return;
    }

    setLoading(true); // Shows the loading spinner for the resend process.

    // Sends the verification link and notifies user of result.
    try {
      await resendVerificationEmail();
      Alert.alert(
        "Email Sent",
        "A new verification link has been sent to your email.",
      );
    } catch (e: any) {
      console.error("Resend error:", e);
      Alert.alert("Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    /** * Handles logging the user out.
     *
     **Outcome:
     *Ends the Firebase session. The Layout will
     *detect the state change and automatically boot the user back to landing screen.
     */
    setLoading(true); // Shows the loading spinner for the logout process.

    try {
      if (auth.currentUser) {
        await logoutUser();
      }

      router.replace("/(auth)/landing");
    } catch (e: any) {
      if (e?.code === "auth/no-current-user") {
        router.replace("/(auth)/landing");
        return;
      }

      console.error("Logout Failed:", e);
      Alert.alert("Logout Failed", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  // Passes verification logic, current state  and user state to the verification UI.
  return (
    <VerifyUI
      email={userEmail}
      onResend={handleResend}
      onLogout={handleLogout}
      loading={loading}
    />
  );
}
