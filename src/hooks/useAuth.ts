/**
 * AUTHENTICATION HOOK
 * A reusable Identity Sensor that subscribes to the Firebase Auth state.
 * Provides real-time updates on the current user's login status and 
 * verification state to any component in the app.
 */
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { onAuthStateChanged } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/services/authService";

// While app is running, monitor the user's login status.
export function useAuth() {
  // Stores the Firebase Auth user or null in the user var.
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  
  // Stores a boolean in the initializing var to track 
  // if the auth check is still loading.
  const [initializing, setInitializing] = useState(true);

  // Listens for changes in the authentication state (Login/Logout).
  useEffect(() => {
    // Stores function instructions in unsubscribe var.
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);
  
  // Passes the user, initializing values, and verification state to app layout.
  return { user, initializing, isVerified: user?.emailVerified ?? false };
}