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

export default function EditProfileRoute() {
  /**
   * Logic for the edit-profile-screen.
   *
   * Outcome:
   * Fetches the user's current data from Firestore, fills the edit form,
   * and saves the updated profile data back to Firestore.
   */

  const router = useRouter();

  // Stores the user's existing profile information for the form.
  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);

  // Tracks whether the profile is still being fetched.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetches the user's profile document from Firestore.
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const rawData = userDoc.data();

          // Sets the initial form values for the UI.
          setInitialData({
            firstName: rawData?.firstName || "",
            lastName: rawData?.lastName || "",
            gender: rawData?.gender || "",
            password: "",
            email: rawData?.email || user.email || "",
          });
        } else {
          // Fallback if profile doc does not exist yet.
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
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async (data: ProfileFormData) => {
    /**
     * Handles validating and updating the user's profile.
     *
     * Parameters:
     * data - The user's edited form values.
     *
     * Outcome:
     * Updates Firestore profile fields and optionally updates Auth email/password.
     */

    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);

      // Updates the Firebase Auth email if it changed.
      if (data.email && data.email !== user.email) {
        await updateEmail(user, data.email);
      }

      // Updates the Firebase Auth password only if the user entered one.
      if (data.password && data.password.trim().length >= 6) {
        await updatePassword(user, data.password);
      }

      // Updates the Firestore profile document.
      const updatePayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        email: data.email || "",
        updatedAt: Timestamp.now(),
      };

      await updateDoc(userRef, updatePayload);

      Alert.alert("Success", "Profile updated!");
      router.back();
    } catch (error: any) {
      console.error("Save Error:", error);
      Alert.alert("Save Failed", error?.message || "Could not update profile.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
