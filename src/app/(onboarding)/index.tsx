import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

// Project imports
import { ProfileSetupScreen } from "@/screens/onboarding/profile-setup-screen";
import { InterestKey } from "@/types/type";
import { auth, db, doc, updateDoc } from "@/services/authService";

export default function ProfileSetupRoute() {
  /**
   * Logic for the profile setup (onboarding) screen.
   * * Outcome:
   * Saves the user's selected interests to Firestore and marks
   * their onboarding as complete. The RootLayout will automatically
   * detect this update and route the user to the main tabs.
   */

  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSave = async (selectedTags: InterestKey[]) => {
    // Prevent multiple database writes if a save is already in progress
    if (saving) return;

    // Verify the user is still actively authenticated
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in again.");
      router.replace("/(auth)/landing" as any);
      return;
    }

    setSaving(true);
    try {
      console.log(`Saving tags for user ${user.email} (UID: ${user.uid}):`, selectedTags);
      
      // 1. Target the specific user's document using modular Firebase syntax
      const userRef = doc(db, "users", user.uid);
      
      // 2. Update the document with their tags and onboarding status
      await updateDoc(userRef, {
        selectedTags: selectedTags,
        onboardingComplete: true 
      });

      // Notice: No router.replace() is needed here.
      // Your RootLayout is watching this document and will transition the app instantly.

    } catch (e: any) {
      console.error("Save Error:", e);
      Alert.alert("Save failed", e?.message ?? "Something went wrong.");
      setSaving(false); // Only turn off loading if there is an error
    } 
  };

  // Grab the user's display name from Firebase to pass to the UI avatar
  const userName = auth.currentUser?.displayName || "User";

  return (
    <ProfileSetupScreen 
      onSave={handleSave} 
      saving={saving} 
      userName={userName} 
    />
  );
}