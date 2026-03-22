import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, ActivityIndicator, View, StyleSheet } from "react-native";
import { doc, getDoc, updateDoc, Timestamp } from "@react-native-firebase/firestore";
import { auth, db } from "@/services/authService"
import { EditProfileScreen, ProfileFormData } from "@/screens/profile/edit-profile-screen";

export default function EditProfileRoute() {
  /**
   * logic for the edit-profile-screen
   * 
   * Outcome:
   * Fetches the user's current data from Firestore, converts it for editing,
   * and saves the edits to Firestore.
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
        //Fetches user's profile from user's collection in Firestore.
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          // Stores the raw Firestore data from user profile in the rawData var.
          const rawData = userDoc.data();
          
          // Logic to convert the Firestore Timestamp store into a "DD/MM/YYYY" string.
          let dobString = "";
          if (rawData?.dateOfBirth instanceof Timestamp) {
            const date = rawData.dateOfBirth.toDate();
            dobString = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          }
          
          // Updates the initial Data stored with cleaned values for the form.
          setInitialData({
            firstName: rawData?.firstName || "",
            lastName: rawData?.lastName || "",
            dateOfBirth: dobString,
            email: rawData?.email || "",
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
     * 
     * Parameters:
     * data - The users edits from the form inputs.
     * 
     * Outcome:
     * Converts the date string back to a Timestamp and updates the user's profile on Firestore.
     */

    // Retrieves the user's account from Firebase Auth and stores it in user var.
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Stores the doc ID of 'users' collection with Auth UID from FirebaseAuth in userRef var.
      const userRef = doc(db, "users", user.uid);

      // Logic to split the date string and store parts in the parts array var.
      const parts = data.dateOfBirth.split('/');
      if (parts.length !== 3) throw new Error("Invalid date format");
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      // Stores the newly constructed Date object in the dateObj var.
      const dateObj = new Date(year, month, day);

      // Stores the updated fields in the updatePayload object var.
      const updatePayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: Timestamp.fromDate(dateObj), 
        updatedAt: Timestamp.now(), 
      };

      // Updates the existing doc in Firestore with the new payload.
      await updateDoc(userRef, updatePayload);
      Alert.alert("Success", "Profile updated!");
      router.back();
    } catch (error: any) {
      Alert.alert("Save Failed", "Please ensure date is DD/MM/YYYY");
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