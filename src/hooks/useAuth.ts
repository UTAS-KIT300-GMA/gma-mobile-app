/**
 ** AUTHENTICATION HOOK
 * A reusable Identity Sensor that subscribes to the Firebase Auth state.
 * Provides real-time updates on the current user's login status and 
 * verification state to any component in the app.
 */
import { onIdTokenChanged, FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState, useMemo } from "react";
import { auth, doc, db } from "@/services/authService";
import { onSnapshot } from "@react-native-firebase/firestore";

/**
 * @summary Monitors Firebase Auth and provides the user's identity and verification state to the App Layout for navigation guarding.
 * @throws {never} Hook setup does not throw synchronously.
 * @Returns {{user: FirebaseAuthTypes.User | null; initializing: boolean; isProfileValidated: boolean | null; isVerified: boolean}} Memoized auth state.
 */
export function useAuth() {
  // Stores auth/profile state used by global route guards.
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isProfileValidated, setIsProfileValidated] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    /**
     * @summary Synchronizes the app's internal user state with Firebase Auth and ensures the loading spinner stops once both Auth & Profile are retrieved.
     * @throws {never} Callback logic handles async errors internally.
     * @Returns {void} Sets up auth and profile listeners.
     */
    let unsubscribeSnapshot: (() => void) | null = null;
    let isMounted = true; // Prevents state updates on unmounted components

    const unsubscribeAuth = onIdTokenChanged(auth, (currentUser) => {
      // 🛑 RESET: Clear state on every auth change to prevent stale data flickering
      if (isMounted) {
        setInitializing(true);
        setIsProfileValidated(null);
      }

      // Cleanup any previous Firestore listener to avoid memory leaks
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      // CHECK 1: No user found 
      if (!currentUser) {
        if (!isMounted) return;
        setUser(null);
        setIsProfileValidated(false);
        setInitializing(false);
        return; 
      }

      // CHECK 2: User exists but email is not verified
      if (currentUser.emailVerified === false) {
        if (!isMounted) return;
        setUser(currentUser);
        setIsProfileValidated(false); // Known incomplete because they can't onboard yet
        setInitializing(false);
        return;
      }

      // CHECK 3: User is Logged In AND Verified
      // Set the user first, but keep initializing = true until Firestore responds.
      if (isMounted) setUser(currentUser);

      const userRef = doc(db, "users", currentUser.uid);

      /**
       * @summary Real-time sync with the user's Firestore document.
       * This ensures the app reacts IMMEDIATELY when the user finishes onboarding.
       * @throws {never} Snapshot error callback handles failures.
       * @Returns {void} Updates profile validation state from Firestore.
       */
      unsubscribeSnapshot = onSnapshot(userRef, (snap) => {
        if (!isMounted) return;

        const data = snap.data();
        // Defensive check: Ensure selectedTags is an array and has at least one item.
        const isValid = !!(snap.exists() && Array.isArray(data?.selectedTags) && data.selectedTags.length > 0);
        
        setIsProfileValidated(isValid);
        setInitializing(false); // ✅ ONLY stop initializing once profile data is confirmed
      }, (error: any) => {
        if (!isMounted) return;

        // Suppress permission errors during logout, otherwise log them
        if (error?.code === 'firestore/permission-denied' || error?.message?.includes('permission-denied')) {
          console.log("Suppressed permission error during logout.");
        } else {
          console.error("Profile check failed:", error);
        }
        
        setIsProfileValidated(false);
        setInitializing(false);
      });
    });

    return () => {
      isMounted = false; // Mark as unmounted to block further state updates
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  /**
   * @summary Stabilizes the return object to prevent unnecessary downstream re-renders in the RootLayout.
   * @throws {never} Memoized value construction does not throw.
   * @Returns {{user: FirebaseAuthTypes.User | null; initializing: boolean; isProfileValidated: boolean | null; isVerified: boolean}} Stable auth state object.
   */
  return useMemo(() => ({ 
    user, 
    initializing, 
    isProfileValidated, 
    isVerified: user?.emailVerified ?? false 
  }), [user, initializing, isProfileValidated]);
}