import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { auth, db, doc, logoutUser } from "@/services/authService"; 
import { getDoc } from "@react-native-firebase/firestore"; // Firestore function imported directly
import ProfileUI from "@/screens/profile/profile-screen"; 

// Stores the structure of the user doc (profile) in a interface.
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export default function ProfileRoute() {
  /**
   * Logic for the profile-screen
   * 
   * Outcome:
   * Fetches the user's name from Firestore to display it on profile screen.
   */

  // Stores the navigation object from Expo Router in router var to allow moving between the (profile) screens.
  const router = useRouter();
  
  // Stores the user's full name string in the userName var.
  const [userName, setUserName] = useState("User");

  // Stores a boolean in the loading var to track the fetching status.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        
        // Stores the raw data from the snapshot in the data var.
        const data = userSnap.data();

        if (userSnap.exists() && data) {
          // Maps the data var to the UserProfile interface structure.
          const profile = data as UserProfile;
          if (mounted) {
            // Combines names and updates the userName var using
            // the setUserName function.
            setUserName(`${profile.firstName} ${profile.lastName}`);
          }
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
      } finally {
        // setLoading function changes value of loading var to false,
        // as data is not being fetching anymore.
        if (mounted) setLoading(false);
      }
    }
    
    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);
 
  // Stores the function instructions in the handleLogout var.
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive", 
        onPress: async () => {
          try {
            await logoutUser();
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
      loading={loading} 
      onLogout={handleLogout}
      onBack={() => router.back()}
      onNavigate={(path: string) => router.push(path as any)}
    />
  );
}