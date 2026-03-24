/**
 * PASSWORD RECOVERY MANAGER
 * This file handles the "Forgot Password" process. 
 * It checks the email address and tells Firebase to send the user 
 * a link to change their password.
 */
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ForgotPasswordScreen } from '@/screens/auth/forgot-password-screen';
import { sendPasswordReset, getFriendlyError } from "@/services/authService"
  
/**
 * Sets up the logic for the forgot password screen.
 * * Outcome: 
 * Prepares the loading status and the navigation tools, then shows 
 * the forgot-password screen to the user.
 */
export default function ForgotPassword() {

  // Stores a boolean value (true/false) in loading var to track if the Firebase reset request is currently loading.
  const [loading, setLoading] = useState(false);
  
  // Stores the navigation object from Expo Router in router var to allow moving between the (auth) screens.
  const router = useRouter();

    /**
 * Checks the user's email and sends the password reset link.
 * * Parameters:
 * email - The email address the user typed in.
 * * Outcome:
 * Sends the reset email and shows a success message. Once the user clicks 
 * "OK," it takes them back to the login screen.
 */
  // Stores the function instructions in handleSendReset var.
  const handleSendReset = async (email: string) => {
  
    // Checks if email var exists or if it does not include a "@".
    if (!email || !email.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    
    try {
      // Sends the user's email to Firebase Auth, which sends the reset email.
      await sendPasswordReset(email);

      Alert.alert(
        "Link Sent",
        "Check your inbox for instructions to reset your password.",
        [{ text: "OK", onPress: () => router.back() }]
      );

    } catch (error: any) {
      // Converts any Firebase errors into user-friendly messages
      const message = getFriendlyError(error);
      Alert.alert("Reset Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Passes the values of handleSendReset and loading to the forgot-password screen
    <ForgotPasswordScreen 
      onSendReset={handleSendReset} 
      loading={loading} 
    />
  );
}