import { ProfileSetupScreen } from "@/screens/onboarding/profile-setup-screen";
import { InterestKey } from "@/types/type"
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { auth, db } from "@/services/authService";

export default function EditInterestsRoute() {
  /**
   * Logic for the edit interests sub-screen within the profile.
   * * Outcome:
   * Updates the user's selected interests in Firestore and 
   * returns them to the previous profile screen.
   */

  // Stores the navigation object from Expo Router in the router var.
  const router = useRouter();

  // Stores a boolean (true/false) in the saving var to track if the database update is in progress.
  const [saving, setSaving] = useState(false);

  // Stores the function instructions in the handleUpdate var.
  const handleUpdate = async (selectedTags: InterestKey[]) => {
    /**
     * Handles the process of updating tags for an existing profile.
     * * Parameters:
     * selectedTags - An array var storing the interests tags selected by the user.
     * * Outcome: 
     * Updates the users selected tags to their profile via firestore,
     * otherwise error is displayed if user is not logged in etc.  
     */

    // If the saving var is true, stop function to prevent multiple database writes.
    if (saving) return;

    // Retrieves the user's account from Firebase Auth and stores it in user var.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in again.");
      return;
    }

    setSaving(true);
    try {
      console.log(`Updating tags for user ${user.email}:`, selectedTags);
      
      // Updates users selected tags on Firestore. 
      // Note: onboardingComplete is NOT changed here as the user is already onboarded.
      await db.collection("users").doc(user.uid).set(
        { 
          selectedTags: selectedTags 
        },
        { merge: true } 
      );

      // After user's profile has been updated, they are directed back to the profile screen.
      Alert.alert("Success", "Your interests have been updated.");
      router.back();
      
    } catch (e: any) {
      console.error("Update Error:", e);
      Alert.alert("Update failed", e?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // Passes the values of handleUpdate and saving to the reused profile-setup-screen UI.
  return <ProfileSetupScreen onSave={handleUpdate} saving={saving} />;
}