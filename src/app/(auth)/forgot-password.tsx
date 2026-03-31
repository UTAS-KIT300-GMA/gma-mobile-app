/**
 * FORGOT PASSWORD ROUTE
 * This file handles the logic for the forgot passsword UI. It checks the email address
 * and tells Firebase to send the user a link to change their password.
 */
import { ForgotPasswordScreen } from "@/screens/auth/forgot-password-screen";
import { getFriendlyError, sendPasswordReset } from "@/services/authService";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

/**
   * @summary Sets up the logic for the forgot password UI.
   * @description Prepares the loading status and the navigation tools, then shows the forgot-password-UI to the user.
   * */
export default function ForgotPassword() {
  
  const [loading, setLoading] = useState(false); // Stores true/false value to track if the Firebase reset request is loading.
  const router = useRouter(); // Stores the navigation tool to allow moving between screens.
  
  /**
     * @summary Checks the user's email and sends the password reset link.
     * @param email The email address the user typed in.
     * @description Sends the reset email and shows a success message. Once the user clicks "OK," it takes them back to the login screen.
     */
  const handleSendReset = async (email: string) => {
  

    // Checks if email exists or if it does not include a "@".
    if (!email || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true); // Changes the loading state to true to tell the app a background task has started.

    try {
      // Sends the user's email to Firebase Auth, to trigger reset email.
      await sendPasswordReset(email);
      Alert.alert(
        "Link Sent",
        "Check your inbox for instructions to reset your password.",
      );

      // Converts any Firebase errors into user-friendly messages
    } catch (error: any) {
      const message = getFriendlyError(error);
      Alert.alert("Reset Error", message);

      // Changes the loading state to false as the reset request is complete.
    } finally {
      setLoading(false);
    }
  };

  // Passes reset logic and current state to the forgot password UI.
  return (
    <ForgotPasswordScreen onSendReset={handleSendReset} loading={loading} />
  );
}
