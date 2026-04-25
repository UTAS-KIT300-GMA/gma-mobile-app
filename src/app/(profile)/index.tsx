import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import analytics from "@react-native-firebase/analytics";


import { auth, db, doc, logoutUser, getDoc } from "@/services/authService"; 

import ProfileUI from "@/screens/profile/profile-UI"; 
import { logSelectContent } from "@/components/utils";

// Stores the structure of the user doc (profile) in a interface.
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoURL?: string;
}

/**
   * @summary Fetches the user's name from Firestore to display it on profile screen.
   * @throws {never} Errors are handled through logging and fallback state.
   * @Returns {React.JSX.Element} Profile screen container.
   */
export default function ProfileRoute() {
  

  // Stores the navigation object from Expo Router in router var to allow moving between the (profile) screens.
  const router = useRouter();
  
  // Stores the user's full name string in the userName var.
  const [userName, setUserName] = useState("User");

  // Stores a boolean in the loading var to track the fetching status.
  const [loading, setLoading] = useState(true);
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);

  // useFocusEffect runs every time this screen becomes the active screen.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function fetchProfile() {
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
              // Safely pull out the names to avoid "undefined" errors
              const first = data.firstName || "";
              const last = data.lastName || "";
              
              if (first || last) {
                // Combines names and updates the userName var using the setUserName function.
                setUserName(`${first} ${last}`.trim());
              } else {
                setUserName("User"); 
              }
              setPhotoURL(
                typeof data.photoURL === "string" ? data.photoURL : undefined,
              );
            }
          } else {
            // If the document somehow doesn't exist, provide a safe fallback
            if (mounted) {
              setUserName("Guest User");
              setPhotoURL(undefined);
            }
          }
        } catch (e) {
          console.error("Error fetching profile:", e);
        } finally {
          // setLoading function changes value of loading var to false as data is no longer being fetched.
          if (mounted) setLoading(false);
        }
      }
      
      fetchProfile();

      return () => {
        mounted = false;
      };
    }, [])
  );

  // Stores the function instructions in the handleLogout var.
  /**
   * @summary Confirms and executes logout flow for the current user.
   * @throws {never} Errors are handled with alerts.
   * @Returns {void} Shows confirmation and logs user out on approval.
   */
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive", 
        onPress: async () => {
          try {
            await logoutUser();
            // Optional: Kicks user back to the login screen so they don't get stuck
            router.replace("/(auth)/landing" as any);
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        } 
      },
    ]);
  };

  return (
    // Passes the values of userName, loading, handleLogout
    // and navigation instructions to the profile-screen.
    <ProfileUI 
      userName={userName} 
      photoURL={photoURL}
      loading={loading} 
      onLogout={handleLogout}
      onBack={() => router.back()}
      // Uses router.push to allow sub-screens like 'payment' to stack on top.
      onNavigate={(path: string) => {
        void logSelectContent(analytics, {
          content_type: "profile",
          item_id: path,
        });
        router.push(path as any);
      }}
    />
  );
}