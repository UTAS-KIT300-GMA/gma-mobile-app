/**
 * PROFILE SETUP MANAGER
 * This file handles the onboarding process where new users pick 
 * their interests. It saves these choices to the database and 
 * marks their profile as finished so they can enter the main app.
 */
import { ProfileSetupScreen } from "@/screens/onboarding/profile-setup-UI";
import { auth, db, doc, updateDoc, getDoc } from "@/services/authService"; 
import { InterestKey } from "@/types/type";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react"; 
import { Alert } from "react-native";

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
  
  // State to store the actual name from Firestore to display in the UI avatar
  const [userName, setUserName] = useState("User");

  /**
   * EFFECT: Fetch User Data
   * Looks into the 'users' collection using the UID to get the name saved during registration.
   */
  useEffect(() => {
    const fetchName = async () => {
      // Retrieves the current logged-in user from Firebase Auth.
      const user = auth.currentUser;
      if (user) {
        try {
          // Targets the user's specific document in the 'users' collection using their unique ID.
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          // Checks if the document exists before trying to read the data.
          if (userSnap.exists()) {
            const data = userSnap.data();

            if (data) {
              // Pulling the specific fields defined in your RegisterData interface from Firestore.
              const first = data.firstName ?? "";
              const last = data.lastName ?? "";
              
              // Combines names and trims whitespace to create a clean display name.
              const fullName = `${first} ${last}`.trim();
              
              // Updates the userName state with the fetched name or defaults to "User".
              setUserName(fullName || "User");
            }
          }
        } catch (error) {
          console.error("Error fetching name from Firestore:", error);
        }
      }
    };

    fetchName();
  }, []);

  /** * Saves the user's selected interests and finishes onboarding.
   * * Parameters:
   * selectedTags - an array of the interests the user clicked on.
   * * Outcome:
   * Updates the user's database file with their new tags and marks 
   * their profile as "complete."
   */
  const handleSave = async (selectedTags: InterestKey[]) => {
    
    // If the saving var is true, the function stops to prevent double-writes.
    if (saving) return;

    // Checks the login status to make sure the user hasn't timed out before saving.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in again.");
      router.replace("/(auth)/landing" as any);
      return;
    }

    // Changes saving to true to trigger the loading spinner and lock the button.
    setSaving(true);
    try {
      console.log(`Saving tags for user ${user.email} (UID: ${user.uid}):`, selectedTags);
      
      // Targets the user's document in Firestore.
      const userRef = doc(db, "users", user.uid);
      
      // Updates the document with the chosen interests and sets onboarding to true.
      await updateDoc(userRef, {
        selectedTags: selectedTags,
        onboardingComplete: true 
      });

      // After successful save, move the user to the main tabs home screen.
      router.replace("/(tabs)/home" as any);
      
    } catch (e: any) {
      console.error("Save Error:", e);
      // Provides a friendly error message if permissions fail or network is down.
      Alert.alert("Save failed", e?.code === 'permission-denied' 
        ? "You do not have permission to update this profile." 
        : (e?.message ?? "Something went wrong."));
    } finally {
      // Resets the saving state so the UI becomes interactive again if there was a failure.
      setSaving(false); 
    }
  };

  return (
    // Renders the UI screen and passes the Firestore name and save logic.
    <ProfileSetupScreen 
      onSave={handleSave} 
      saving={saving} 
      userName={userName} 
    />
  );
}