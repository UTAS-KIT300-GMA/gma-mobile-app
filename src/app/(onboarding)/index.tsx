/**
 * PROFILE SETUP MANAGER
 * This file handles the onboarding process where new users pick 
 * their interests. It saves these choices to the database and 
 * marks their profile as finished so they can enter the main app.
 */
import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { ProfileSetupScreen } from "@/screens/onboarding/profile-setup-screen";
import { InterestKey } from "@/types/type";
import { auth, db, doc, updateDoc } from "@/services/authService";

/**
   * Logic for the profile setup (onboarding) screen.
   * * Outcome:
   * Saves the user's selected interests to Firestore and marks
   * their onboarding as complete. The RootLayout will automatically
   * detect this update and route the user to the main tabs.
   */
export default function ProfileSetupRoute() {
  
  // Stores the navigation tool in the router var to allow moving between the (auth) and main screens.
  const router = useRouter();

  // Stores a true/false value in the saving var to track if the interests are being saved to the database.
  const [saving, setSaving] = useState(false);

  /** * Saves the user's selected interests and finishes onboarding.
   * * Parameters:
   * selectedTags - an array of the interests the user clicked on.
   * * Outcome:
   * Updates the user's database file with their new tags and marks 
   * their profile as "complete."
   */
  const handleSave = async (selectedTags: InterestKey[]) => {
    
    if (saving) return;

    // Stores the current user's login status to make sure they are still logged in before trying to save.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in again.");
      router.replace("/(auth)/landing" as any);
      return;
    }

    // Changes the saving var to true to show the app is working and to lock the buttons.
    setSaving(true);
    try {
      console.log(`Saving tags for user ${user.email} (UID: ${user.uid}):`, selectedTags);
      
      // Targets the user's document 
      const userRef = doc(db, "users", user.uid);
      
      // Updates the document with their tags and onboarding status
      await updateDoc(userRef, {
        selectedTags: selectedTags,
        onboardingComplete: true 
      });

      
    } catch (e: any) {
      console.error("Save Error:", e);
      Alert.alert("Save failed", e?.message ?? "Something went wrong.");
      setSaving(false); 
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