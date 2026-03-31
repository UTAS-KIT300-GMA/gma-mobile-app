/**
 ** AUTHENTICATION HOOK
 * A reusable Identity Sensor that subscribes to the Firebase Auth state.
 * Provides real-time updates on the current user's login status and 
 * verification state to any component in the app.
 */
import { onAuthStateChanged,FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { auth,doc,getDoc,db } from "@/services/authService";
import { Unsubscribe } from "@react-native-firebase/firestore";

/**
 * @summary Monitors Firebase Auth and provides the user's identity and verification state to the App Layout for navigation guarding.
 */
export function useAuth() {

  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null); // Stores the Firebase Auth user or null in the user var.
  const [isProfileValidated, setIsProfileValidated] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(true);                // Stores true/false value to track if auth check is still loading

  useEffect(() => {
  /**
  * @summary Synchronizes the app's internal user state with Firebase Auth and ensures the loading spinner stops once both Auth & Profile are retrieved.
  */
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
    // Check 1: No user found 
    if (!currentUser) {
        setUser(null);
        setIsProfileValidated(false);
        setInitializing(false);
        return; 
      }
    
    // CHECK 2: User exists but email is not verified
      if (currentUser.emailVerified === false) {
        setUser(currentUser);
        setIsProfileValidated(false);
        setInitializing(false);
        return;
      }
    
    // CHECK 3: User is Logged In AND Verified
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        const isValid = !!(snap.exists() && snap.data()?.selectedTags?.length > 0);
        setIsProfileValidated(isValid);
        setUser(currentUser);
        

      } catch (error: any) {
        setUser(currentUser);
        setIsProfileValidated(false);
        if (error?.code === 'firestore/permission-denied' || error?.message?.includes('permission-denied')) {
          console.log("Suppressed permission error during logout.");
        } else {
          console.error("Profile check failed:", error);
        }
        
      } finally {
        setInitializing(false);
      
      }
    });

    return unsubscribe;
  }, []);
  
  // Passes the user's authentication logic and session status to the App Layout.
  return { user, initializing, isProfileValidated, isVerified: user?.emailVerified ?? false };
}