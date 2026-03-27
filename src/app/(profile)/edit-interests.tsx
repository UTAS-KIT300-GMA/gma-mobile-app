/**
 * EDIT INTERESTS ROUTE
 * This file handles the logic for the "Edit Interests" screen within the user profile.
 * It fetches the user's existing selected tags from Firestore, allows them to modify 
 * their selection, and updates the database before returning them to the profile.
 */
import EditInterestsUI from "@/screens/profile/edit-interests-UI"; 
import { auth, db, doc, getDoc, updateDoc } from "@/services/authService";
import { InterestKey } from "@/types/type";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { Alert, ActivityIndicator, View } from "react-native";

  /**
   * Logic for the edit interests sub-screen within the profile.
   * * Outcome:
   * Updates the user's selected interests in Firestore and 
   * returns them to the previous profile screen.
   */
export default function EditInterestsRoute() {

  // Stores the navigation object from Expo Router in the router var.
  const router = useRouter();

  // Stores a boolean (true/false) in the saving var to track if the database update is in progress.
  const [saving, setSaving] = useState(false);
  
  // Stores a boolean in the loading var to track the fetching status.
  const [loading, setLoading] = useState(true);

  // Stores the user's full name string in the userName var.
  const [userName, setUserName] = useState("User");

  // Stores the existing tags array to pre-fill the UI pills.
  const [initialTags, setInitialTags] = useState<InterestKey[]>([]);

  // useFocusEffect runs every time this screen becomes the active screen.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function fetchExistingData() {
        // Retrieves the user's account from Firebase Auth and stores it in user var.
        const user = auth.currentUser;
        if (!user) {
          if (mounted) setLoading(false);
          return;
        }

        try {
          // Stores the doc ID of 'users' collection with Auth UID from FirebaseAuth in userRef var.
          const userRef = doc(db, "users", user.uid);
          
          // Stores the snapshot of the doc (profile) from Firestore in userSnap var.
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            // Stores the raw data from the snapshot in the data var.
            const data = userSnap.data();
            if (mounted && data) {
              // Grabs both first and last names from Firestore.
              const first = data.firstName || "";
              const last = data.lastName || "";
              
              // Combines names and updates the userName var.
              setUserName(`${first} ${last}`.trim() || "User");

              // Stores the existing selected tags to highlight the correct pills in the UI.
              if (data.selectedTags) {
                setInitialTags(data.selectedTags);
              }
            }
          }
        } catch (e) {
          console.error("Error fetching user data:", e);
        } finally {
          // setLoading function changes value of loading var to false as data is no longer being fetched.
          if (mounted) setLoading(false);
        }
      }
      
      fetchExistingData();

      return () => { 
        mounted = false; 
      };
    }, [])
  );

  /**
     * Handles the process of updating tags for an existing profile.
     * * Parameters:
     * selectedTags - An array var storing the interests tags selected by the user.
     * * Outcome: 
     * Updates the users selected tags to their profile via firestore,
     * otherwise error is displayed if user is not logged in etc.  
     */
  // Stores the function instructions in the handleUpdate var.
  const handleUpdate = async (selectedTags: InterestKey[]) => {

    // If the saving var is true, stop function to prevent multiple database writes.
    if (saving) return;

    // Retrieves the user's account from Firebase Auth and stores it in user var.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please log in again.");
      return;
    }

    // Changes the saving var to true to tell the app a background task has started.
    setSaving(true);
    try {
      console.log(`Updating tags for user ${user.email}:`, selectedTags);
      
      // Stores the doc ID for the current user.
      const userRef = doc(db, "users", user.uid);

      // Updates users selected tags on Firestore using updateDoc for the modular SDK. 
      // Note: onboardingComplete is NOT changed here as the user is already onboarded.
      await updateDoc(userRef, {
        selectedTags: selectedTags 
      });

      // After user's profile has been updated, they are directed back to the profile screen.
      Alert.alert("Success", "Your interests have been updated.");
      router.back();
      
    } catch (e: any) {
      console.error("Update Error:", e);
      Alert.alert("Update failed", e?.message ?? "Something went wrong.");
    } finally {
      // setSaving function changes value of saving var to false as the update is complete.
      setSaving(false);
    }
  };

  // Displays the Busy spinner while data is being fetched.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff" }}>
        <ActivityIndicator size="large" color="#a64d79" />
      </View>
    );
  }

  // Passes the values of handleUpdate, saving, userName, and initialInterests to the EditInterestsUI.
  return (
    <EditInterestsUI 
      onSave={handleUpdate} 
      saving={saving} 
      userName={userName} 
      initialInterests={initialTags} 
    />
  );
}