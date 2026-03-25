/** 
 * REGISTER MANAGER
 * This file handles the registration screen. It makes sure new users 
 * provide all their info, creates their account, and starts the 
 * email verification process.
 */
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { getFriendlyError, RegisterData, registerUser } from "@/services/authService";
import { RegisterScreen } from "@/screens/auth/register-screen";

/**
 * Sets up the logic for the signup screen.
 * * Outcome: 
 * Prepares the account creation process and navigation, then 
 * shows the registration screen UI to the user.
 */
export default function RegisterRoute() {
  
  // Stores the navigation tool in the router var to allow moving between the (auth) screens.
  const router = useRouter();

  // Stores a true/false value in the loading var to track if the app is currently creating the new account.
  const [loading, setLoading] = useState(false);

  /**
 * Checks the signup form for mistakes.
 * * Parameters:
 * email - The email typed in.
 * password - The password typed in.
 * profile - The user's name, gender, and birthday.
 * * Outcome:
 * Returns an error message if a field is empty, the email is 
 * missing an "@", or the password is too short.
 */
  const validateRegister = (email: string, password: string, profile: RegisterData) => {
    
    if (!email || !password || !profile.firstName || !profile.lastName || !profile.gender || !profile.dateOfBirth) {
      return "Please fill in all required fields.";
    }
    if (!email.includes("@")) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  /**
 * Handles the create account button and saves the user.
 * * Parameters:
 * email - The new user's email.
 * password - The new user's password.
 * profile - The new user's personal details.
 * * Outcome:
 * Checks for errors first. If it's all good, it creates the account, 
 * shows a success popup, and sends the user to the verify screen.
 */
  const handleRegister = async (email: string, password: string, profile: RegisterData) => {
    
    const error = validateRegister(email, password, profile);
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    setLoading(true);
    try {
      
      
      await registerUser(email, password, profile);

      Alert.alert("Account Created", "Check your inbox for the verification email!", [
        { text: "Continue", onPress: () => router.replace("/verify-user") },
      ]);

    } catch (e) {
      console.error("Registration error:", e);
      Alert.alert("Registration Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterScreen 
      onRegisterPress={handleRegister}
      onLoginPress={() => router.push("/login" as any)}
      loading={loading}
    />
  );
}
