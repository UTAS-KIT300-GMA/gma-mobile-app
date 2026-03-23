import { ProfileSetupScreen } from "@/screens/onboarding/profile-setup-screen";
import { InterestKey } from "@/types/type"
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { auth, db } from "@/services/authService";

export default function ProfileSetupRoute() {
  /**
   * Logic for the profile setup (onboarding) screen.
   * 
   * Outcome:
   * Saves the user's selected interests to Firestore and marks
   * their onboarding as complete before sending them to home screen.
   */

  // Stores the navigation object from Expo Router in the router var.
  const router = useRouter();

  // Stores a boolean (true/false) in the saving var to track if the database update is in progress.
  const [saving, setSaving] = useState(false);

  // Stores the function instructions in the handleSave var.
  const handleSave = async (selectedTags: InterestKey[]) => {
    /**
     * Handles the process of saving tags and updating the user's document.
     * 
     * Parameters:
     * selectedTags - An array var storing the interests tags selected by the user.
     * 
     * Outcome: 
     * Saves the users selected tags to their profile via firestore,
     * otherwise error is displayed if user is not logged in etc.  
     */

    // If the saving var is true, stop function to prevent multiple database writes.
    if (saving) return;

    // Retrieves the user's account from Firebase Auth and stores it in user var.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in again.");
      router.replace("/(auth)/landing" as any);
      return;
    }

    setSaving(true);
    try {
      console.log(`Saving tags for user ${user.email} (UID: ${user.uid}):`, selectedTags);
      
      // Adds users selected tags to their profile on Firestore and also changes their onboarding status to true.
      await db.collection("users").doc(user.uid).set(
        { 
          selectedTags: selectedTags,
          onboardingComplete: true 
        },
        { merge: true } 
      );

      // After user's profile as been updated they are Directed to home screen
      router.replace("/(tabs)/" as any);
      
    } catch (e: any) {
      console.error("Save Error:", e);
      Alert.alert("Save failed", e?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };
  // Passess the values of handleSave and saving to profile-setup-screen
  return <ProfileSetupScreen onSave={handleSave} saving={saving} />;
}