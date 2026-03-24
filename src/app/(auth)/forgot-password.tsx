import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ForgotPasswordScreen } from '@/screens/auth/forgot-password-screen';
import { sendPasswordReset, getFriendlyError } from "@/services/authService"

export default function ForgotPassword() {
  /**
  * Logic for the forgot-password-screen.
  * 
  * Outcome: 
  * Sends password reset email and navigates the user back to the login screen if successful,
  * otherwise an error message is displayed.
  */

  // Stores a boolean value (true/false) in loading var to track if the Firebase reset request is currently loading.
  const [loading, setLoading] = useState(false);
  
  // Stores the navigation object from Expo Router in router var to allow moving between the (auth) screens.
  const router = useRouter();

  // Stores the function instructions in handleSendReset var.
  const handleSendReset = async (email: string) => {
    /**
    * Checks if email is correct and then passes it to Firebase Auth to send a password reset email.
    * 
    * Parameters:
    * email - User's inputted email
    * 
    * Outcome:
    * User receives a password reset email, otherwise errors are displayed.
    */

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