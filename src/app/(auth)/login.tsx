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
 * or prompts for email verification if the account is not yet verified,
 * or be reedirected to forgot password screen if they forgotten thir password.
 */
  
  // Stores the navigation object from Expo Router in router var to allow moving between the (auth) screens.
  const router = useRouter();
  
  // Stores a boolean value (true/false) in loading var to track if the Firebase login request is currently loading.
  const [loading, setLoading] = useState(false);

  // Stores the function instructions in handleLogin var.
  const handleLogin = async (email: string, password: string) => {
  /**
 * Starts login process by validating user's email/password 
 * and checking verification status.
 * 
 * Parameters:
 * email - User's inputted email.
 * password - user's inputted password.
 * 
 * Outcome: 
 * User logs in, user fail to login or is unverified and directed to resend verification email. 
 */
    if (loading) return;
    
    // Sanitize the email string stored in the cleanEmail var.
    const cleanEmail = email.trim().toLowerCase();
    
    // Check that both the email and password var's are not empty. 
    // if so display error and stop function, otherwise continue.
    if (!cleanEmail || !password) {
   
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      // stores the user's cleaned email and password in the verified boolean var.
      const { verified } = await loginUser(cleanEmail, password);
      
      
      // login is successful but user isn't verified.
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
      Alert.alert("Login Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    // Passes the values of handleLogin, loading and the navigation instructions to login-screen.
  <LoginScreen 
  onLogin={handleLogin} 
  onRegisterPress={() => router.push("/(auth)/register" as any)}
  onForgotPress={() => router.push("/(auth)/forgot-password" as any)}
  loading={loading}
    />
  );
}