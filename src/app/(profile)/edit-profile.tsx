import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, ActivityIndicator, View, StyleSheet } from "react-native";
import { updateEmail } from "@react-native-firebase/auth";
import { doc, getDoc, updateDoc, Timestamp } from "@react-native-firebase/firestore";
import { auth, db } from "@/services/authService";
import { EditProfileScreen } from "@/screens/profile/edit-profile-UI";
import { ProfileFormData } from "@/types/type";

export default function EditProfileRoute() {
  /**
   * logic for the edit-profile-screen
   * * Outcome:
   * Fetches the user's current data from Firestore and 
   * saves the edits to Firestore.
   */
  
  // Stores the navigation object from Expo Router in router var to allow moving between the (profile) screens.
  const router = useRouter();
  
  // Stores the user's existing profile information in the initialData var.
  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);

  // Stores a boolean in the loading var to track if the profile is still being fetched.
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    async function loadProfile() {
        
      // Retrieves the user's account from Firebase Auth and stores it in user var.
      const user = auth.currentUser;
      if (!user) return;

      try {
        // Fetches user's profile from user's collection in Firestore.
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // Stores the raw Firestore data from user profile in the rawData var.
          const rawData = userDoc.data();
          
          // Updates the initial Data stored with cleaned values for the form.
          setInitialData({
            firstName: rawData?.firstName || "",
            lastName: rawData?.lastName || "",
            email: user.email || rawData?.email || "", // Uses Auth email as the primary source.
          });
        }
      } catch (error) {
        console.error("Load Error:", error);
        Alert.alert("Error", "Could not load profile.");
      } finally {
        // The setLoading function changes value of loading var to false as data is not being fetched.
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Stores the function instructions in the handleSave var.
  const handleSave = async (data: ProfileFormData) => {
    /**
     * Handles the validating and updating of the user's profile.
     * * Parameters:
     * data - The users edits from the form inputs.
     * * Outcome:
     * Updates the user's profile on Firestore and Auth account.
     */

    // Retrieves the user's account from Firebase Auth and stores it in user var.
    const user = auth.currentUser;
    if (!user) return;

    try {
     
      // If the email in the form is different from the current Auth email, update Auth first.
      if (data.email.toLowerCase() !== user.email?.toLowerCase()) {
        await updateEmail(user, data.email.toLowerCase());
      }

      // Stores the doc ID of 'users' collection with Auth UID from FirebaseAuth in userRef var.
      const userRef = doc(db, "users", user.uid);

      // Stores the updated fields in the updatePayload object var.
      const updatePayload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase(),
        updatedAt: Timestamp.now(), 
      };

      // Updates the existing doc in Firestore with the new payload.
      await updateDoc(userRef, updatePayload);
      
      Alert.alert("Success", "Profile updated!");
      router.back();
    } catch (error: any) {
      // Handles the specific Firebase error where a user must re-log to change an email.
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Security Check", "Please log out and back in to change your email.");
      } else {
        console.error("Save Error:", error);
        Alert.alert("Save Failed", "Please ensure the email is valid.");
      }
    }
  };

  // If the loading var is true, display the busy spinner (stops flickers).
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a64d79" />
      </View>
    );
  }

  // Passes the values of initialData, handleSave and the navigation instructions down to the profile-screen.
  return (
    <EditProfileScreen 
      initialData={initialData}
      onSave={handleSave} 
      onBack={() => router.back()} 
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }
});