/**
 * PROFILE SETUP ROUTE
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
* @summary Saves the user's selected interests to Firestore and marks their onboarding as complete. The rootlayout will automatically detect this update and route the user to the main tabs.
* @throws {never} Errors are handled with alerts and console logs.
* @Returns {React.JSX.Element} Onboarding interest selection screen.
*/
export default function ProfileSetupRoute() {

  const router = useRouter();                        // Stores the navigation tool  to allow moving between the screens.
  const [saving, setSaving] = useState(false);       // Stores true/false value  to track if the interests are being saved to the database.
  const [userName, setUserName] = useState("User");  // Stores the user's name from Firestore to display in UI.

  useEffect(() => {
  /**
     @summary Looks into the 'users' collection using the UID to get the name saved during registration.
   * @throws {never} Fetch errors are caught and logged.
   * @Returns {Promise<void>} Resolves after user name fetch attempt.
   */
    const fetchName = async () => {
      
      const user = auth.currentUser; // Retrieves the current logged-in user from Firebase Auth.
      
      if (user) {
        
        // Targets the user's specific document in the 'users' collection using their unique ID.
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          // Checks if the document exists before trying to read the data.
          if (userSnap.exists()) {
            const data = userSnap.data();
            
            // Extracts and combines the user's name fields into a sanitized display name.
            if (data) {
              const first = data.firstName ?? "";
              const last = data.lastName ?? "";
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

  /**
   * @summary Updates the user's database file with their new tags and marks their profile as "complete."
   * @param selectedTags - An array of the interests the user clicked on.
   * @throws {never} Errors are handled and surfaced in alerts.
   * @Returns {Promise<void>} Resolves when save flow completes.
   */
  const handleSave = async (selectedTags: InterestKey[]) => {

    if (saving) return; // If value is true, the function stops to prevent double-writes.

    // Checks the login status to make sure the user hasn't timed out before saving.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in again.");
      router.replace("/(auth)/landing" as any);
      return;
    }

    setSaving(true); // Changes saving to true, which triggers the loading spinner.
    try {
      console.log(`Saving tags for user ${user.email} (UID: ${user.uid}):`, selectedTags);
      
      const userRef = doc(db, "users", user.uid); // Defines the Firestore location user's profile.
      
      // Updates the document with the chosen interests and sets onboarding to true.
      const updates: Record<string, unknown> = {
        selectedTags: selectedTags,
        onboardingComplete: true,
      };

      await updateDoc(userRef, updates);

      // logs errors in freindly format.
    } catch (e: any) {
      console.error("Save Error:", e);
      Alert.alert("Save failed", e?.code === 'permission-denied' 
        ? "You do not have permission to update this profile." 
        : (e?.message ?? "Something went wrong."));
    } finally {
      setSaving(false); // Sets value to false. so UI becomes interactive again if there was a failure. 
    }
  };
  
  // Passess the onboarding logic and current state to Profile setup UI.
  return (
    <ProfileSetupScreen 
      onSave={handleSave} 
      saving={saving} 
      userName={userName} 
    />
  );
}