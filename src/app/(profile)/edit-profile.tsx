/**
 **EDIT PROFILE ROUTE**
 * This file handles the logic for the edit profile screen. It fetches the user's
 * current data from Firestore, pre-fills the edit form, and saves any updated
 * profile data (including email and password) back to the database.
 */
import {
  EditProfileScreen,
  ProfileFormData,
} from "@/screens/profile/edit-profile-UI";
import { auth, db } from "@/services/authService";
import { colors } from "@/theme/ThemeProvider";
import { updateEmail, updatePassword } from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

/**
 * Logic for the edit-profile-screen.
 *
 * Outcome:
 * Fetches the user's current data from Firestore, fills the edit form,
 * and saves the updated profile data back to Firestore.
 */
export default function EditProfileRoute() {
  // Stores the navigation tool in the router var to allow moving between screens.
  const router = useRouter();

  // Stores the user's existing profile information for the form.
  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);

  // Tracks whether the profile is still being fetched.
  const [loading, setLoading] = useState(true);

  // Runs once, when this screen loads to fetch the user's existing profile data.
  useEffect(() => {
    async function loadProfile() {
      // Stores the current user account in the user var.
      const user = auth.currentUser;

      // If no user is logged in, changes the loading var to false and stops the function.
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Retrieves the user's profile document from Firestore and stores it in the userDoc var.
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          // Stores the raw data from the snapshot in the rawData var.
          const rawData = userDoc.data();

          // Changes the initialData var to the fetched values to pre-fill the UI.
          setInitialData({
            firstName: rawData?.firstName || "",
            lastName: rawData?.lastName || "",
            gender: rawData?.gender || "",
            password: "",
            email: rawData?.email || user.email || "",
          });
        } else {
          // Changes the initialData var to empty fallback values if the profile doc does not exist yet.
          setInitialData({
            firstName: "",
            lastName: "",
            gender: "",
            password: "",
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("Load Error:", error);
        Alert.alert("Error", "Could not load profile.");
      } finally {
        // Changes the loading var to false as data is no longer being fetched.
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  /**
   * Handles validating and updating the user's profile.
   *
   * Parameters:
   * data - The user's edited form values
   *
   * Outcome:
   * Updates Firestore profile fields and optionally updates Auth email/password,
   * then navigates back to the profile screen.
   */
  const handleSave = async (data: ProfileFormData) => {
    // Stores the current user account in the user var.
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Stores the document reference for the current user in the userRef var.
      const userRef = doc(db, "users", user.uid);

      // Updates the Firebase Auth email if the user changed it in the form.
      if (data.email && data.email !== user.email) {
        await updateEmail(user, data.email);
      }

      // Updates the Firebase Auth password only if the user entered on (min 6 char).
      if (data.password && data.password.trim().length >= 6) {
        await updatePassword(user, data.password);
      }

      // Stores the structured profile data to be saved in the updatePayload var.
      const updatePayload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email?.toLowerCase() || user.email || "",
        updatedAt: Timestamp.now(),
      };

      // Updates the Firestore profile document with the new payload.
      await updateDoc(userRef, updatePayload);

      // Shows a success popup and navigates back to the previous screen.
      Alert.alert("Success", "Profile updated!");
      router.back();
    } catch (error: any) {
      // Handles the specific Firebase error where a user must re-log to change an email.
      if (error.code === "auth/requires-recent-login") {
        Alert.alert(
          "Security Check",
          "Please log out and back in to change your email.",
        );
      } else {
        console.error("Save Error:", error);
        Alert.alert("Save Failed", "Please ensure the email is valid.");
      }
    }
  };

  // Displays the busy spinner while data is being fetched.
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Passes the initial form data, save handler, and back navigation actions to the edit-profile UI.
  return (
    <EditProfileScreen
      initialData={initialData}
      onSave={handleSave}
      onBack={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.textOnPrimary,
  },
});
