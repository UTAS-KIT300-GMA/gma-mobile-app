/** 
  **REGISTER ROUTE**
 * This file handles the logic of registration UI. It makes sure new users 
 * provide all their info, creates their account, and starts the 
 * email verification process.
 */

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { getFriendlyError, RegisterData, registerUser } from "@/services/authService";
import { RegisterScreen } from "@/screens/auth/register-screen";

/**
* @summary Validates user input, creates a FirebaseAuth account, creates a profile collection on Firestore, and navigates to the verification screen if successful.
* @throws {never} Errors are handled through validation and alerts.
* @Returns {React.JSX.Element} Registration UI container with submit handlers.
*/
export default function RegisterRoute() {

  const router = useRouter();                     // Stores the navigation tool to allow moving between screens.
  const [loading, setLoading] = useState(false); // Stores true/false value to track if app is trying to register user.

  // Checks if value is a valid Date object.
  /**
   * @summary Validates whether a value is a real Date instance.
   * @param value - Value to validate as a date.
   * @throws {never} Pure validation does not throw.
   * @Returns {boolean} True when the value is a valid date.
   */
  const isValidDate = (value: unknown): value is Date => {
    return value instanceof Date && !isNaN(value.getTime());
  };

  /**
   * @summary Checks if the user has inputted all required details for to register an account
   * @param email - User's inputted email.
   * @param password - User's inputted password.
   * @param profile - The user's profile (firstName, lastName, gender, dateOfBirth).
   * @throws {never} Validation returns messages instead of throwing.
   * @Returns {string | null} Validation message or null when input is valid.
   */
  const validateRegister = (email: string,password: string,profile: RegisterData,) => {
  
    // Checks if any required details for account are empty.
    if (
      !email ||
      !password ||
      !profile.firstName ||
      !profile.lastName ||
      !profile.gender ||
      !profile.dateOfBirth
    ) {
      return "Please fill in all required fields.";
    }

    // Ensures dateOfBirth is a real valid Date object.
    if (!isValidDate(profile.dateOfBirth)) {
      return "Please enter a valid date of birth.";
    }

    // Reject dates in the future.
    if (profile.dateOfBirth > new Date()) {
      return "Date of birth cannot be in the future.";
    }

    // Checks if user is at least 16 years old, otherwise output error message.
    const today = new Date();
    const birthDate = profile.dateOfBirth;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if the current month/day is before the birth month/day.
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // If user is younger than 16, return error message.
    if (age < 16) {
      return "You must be at least 16 years old to register.";
    }

    // Checks if email var includes "@", otherwise ouput error message.
    if (!email.includes("@")) return "Please enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };;
  
  /**
   * @summary User account is created and directed to verification screen, otherwise display an error due to validation of data failing.
   * @param email - User's inputted email.
   * @param password - User's inputted password.
   * @param profile - The user's profile (firstName, lastName, gender, dateOfBirth).
   * @throws {never} Errors are handled and shown through alerts.
   * @Returns {Promise<void>} Resolves when registration flow completes.
   */
  const handleRegister = async (email: string,password: string,profile: RegisterData, ) => {
  
  
    const error = validateRegister(email, password, profile); // Stores result of the validation check.

    // If error present, display them and stop function.
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    setLoading(true);
    try {
      await registerUser(email, password, profile);
      router.replace("/(auth)/verify-user");
    } catch (e) {
      Alert.alert("Registration Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };
  
  // Passes register Logic, current state and navigation handlers to Register's UI.
  return (
    <RegisterScreen
      onRegisterPress={handleRegister}
      onLoginPress={() => router.push("/login" as any)}
      loading={loading}
    />
  );
}
