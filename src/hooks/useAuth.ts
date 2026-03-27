/**
 ** AUTHENTICATION HOOK
 * A reusable Identity Sensor that subscribes to the Firebase Auth state.
 * Provides real-time updates on the current user's login status and 
 * verification state to any component in the app.
 */
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/services/authService";

export function useAuth() {
  /**
 ** Custom hook to track the user's login and verification status.
 ** Outcome: 
 * Monitors Firebase Auth and provides the user's identity and 
 * verification state to the App Layout for navigation guarding.
 */
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null); // Stores the Firebase Auth user or null in the user var.
  const [initializing, setInitializing] = useState(true);                // Stores true/false value to track if auth check is still loading

  useEffect(() => {
  /**
  ** Logic: Monitors the user's authentication state and updates the identity status.
  * 
  ** Outcome: 
  * Synchronizes the app's internal user state with Firebase Auth and 
  * stops the initial loading status once the session is found.
  */
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);
  
  // Passes the user's authentication logic and session status to the App Layout.
  return { user, initializing, isVerified: user?.emailVerified ?? false };
}