/**
  **LOGIN ROUTE**
 * This file handles the login UI logic. It checks the user's email 
 * and password and makes sure their account is verified before 
 * letting them into the main app.
 */
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { getFriendlyError, loginUser, resendVerificationEmail } from "@/services/authService";
import { LoginScreen } from "@/screens/auth/login-screen";

export default function LoginRoute() {
  /**
 * Sets up the logic for the login UI.
 * * Outcome: 
 * Prepares the login process and navigation, then shows the 
 * login screen UI to the user.
 */
  
  const router = useRouter();                    // Stores the navigation tool  to allow moving between screens.  
  const [loading, setLoading] = useState(false); // Stores a true/false value, to track if the app is trying to sign user in.
  const handleLogin = async (email: string, password: string) => {
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
    
    if (loading) return;                           // Prevent multiple simultaneous login attempts
    const cleanEmail = email.trim().toLowerCase(); // Stores the email address after removing extra spaces and making it lowercase.

    // Validate inputs
    if (!cleanEmail || !password) {
      Alert.alert("Error", "Please enter email and password.");
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
      
      // Handles login errors
    } catch (e) {
      Alert.alert("Login Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };
  
  // Passes login logic,current state and navigation handlers to the UI screen.
  return (
    <LoginScreen 
      onLogin={handleLogin} 
      onRegisterPress={() => router.push("/register" as any)}
      onForgotPress={() => router.push("/forgot-password" as any)}
      loading={loading}
    />
  );
}