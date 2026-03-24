import { RegisterScreen } from "@/screens/auth/register-screen";
import {
  getFriendlyError,
  RegisterData,
  registerUser,
} from "@/services/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export default function RegisterRoute() {
  /**
   * Is the logic for the register-screen
   *
   * Outcome:
   * Validates user input, creates a FirebaseAuth account, creates a profile collection on Firestore,
   * and navigates to the verification screen if successful.
   */

  // Stores the navigation object from Expo Router in router var to allow moving between the (auth) screens.
  const router = useRouter();

  // Stores booleen of false in loading var and creates the setLoading function to update the boolen of value of loading var.
  const [loading, setLoading] = useState(false);

  // Function to check if a value is a valid Date object.
  const isValidDate = (value: unknown): value is Date => {
    return value instanceof Date && !isNaN(value.getTime());
  };

  // Stores the function instructions in validateRegister var.
  const validateRegister = (
    email: string,
    password: string,
    profile: RegisterData,
  ) => {
    /**
     * Checks if the user has inputted all required details for to register an account
     *
     * Parameters:
     * email - User's inputted email
     * password - User's inputted password
     * profile - The users profie (firstname,lastname,gender,dateofbirth)
     */

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

    // Optional defensive check: reject dates in the future.
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

    // Checks if pass var has at least 8 characters, otherwise output error message.
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };;

  // Stores the function instructions in handleRegister var.
  const handleRegister = async (
    email: string,
    password: string,
    profile: RegisterData,
  ) => {
    /**
     * Starts the registration process by validating data and calling Firebase.
     *
     * Parameters:
     * email - User's inputted email
     * password - User's inputted password
     * profile - The users profile (firstname,lastname,gender,dateofbrith)
     *
     * Outcome:
     * User account is created and directed to verification screen,
     * otherwise display an error due to validation of data failing.
     */

    // Stores result of the validation check in error var
    const error = validateRegister(email, password, profile);

    // If error var has an value, display it and stop function.
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    // Stores true value in the loading var via setLoading function.
    setLoading(true);
    try {
      // Passes var's to registerUser service to create account.
      await registerUser(email, password, profile);

      // Redirects user to verify user screen after account being created.
      Alert.alert("Account Created", "Check your inbox!", [
        { text: "Continue", onPress: () => router.replace("/verify-user") },
      ]);
    } catch (e) {
      // Stores error in e var and displays it via getFreiendlyError function.
      Alert.alert("Registration Error", getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    // Passes the values of handleRegister, loading and
    // the navigation instructions down to the register-screen.
    <RegisterScreen
      onRegisterPress={handleRegister}
      onLoginPress={() => router.push("/login" as any)}
      loading={loading}
    />
  );
}
