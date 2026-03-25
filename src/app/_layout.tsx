/**
 * ROOT NAVIGATION GUARD
 * The "Traffic Controller" of the application. 
 * Orchestrates global routing logic by checking Auth status, Email Verification, 
 * and Onboarding completion to ensure users are always in the correct app section.
 */

import { auth, db, doc, applyActionCode } from "@/services/authService";
import { onSnapshot } from "@react-native-firebase/firestore";
import { FirebaseAuthTypes, onAuthStateChanged } from "@react-native-firebase/auth";
import { Slot, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Alert} from "react-native";
import { colors } from "@/theme/ThemeProvider";


export default function RootLayout() {
  // Stores the Firebase user object in the user var.
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  
  // Stores a boolean in the initializing var to track the first auth check.
  const [initializing, setInitializing] = useState(true);
  
  // Stores whether the user has finished their interests in the isProfileValidated var.
  const [isProfileValidated, setIsProfileValidated] = useState<boolean | null>(null);

  // Stores the current folder path (segments) and the navigation tool (router).
  const segments = useSegments();
  const router = useRouter();

  // Auth Listener, Watches for login or logout events.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);

      // User not logged in
      if (!u) {
        setIsProfileValidated(false);
        setInitializing(false);
      } 
      // User logged in but email not verified
      else if (u.emailVerified === false) {
        setInitializing(false);
      }
    });
    return unsubscribe;
  }, []);

  // Deep Link Listener: Catches the Firebase email link when the app opens.
  useEffect(() => {
    const handleDeepLink = async (event: Linking.EventType | { url: string }) => {
      const { url } = event;
      if (!url) return;

      const parsedUrl = Linking.parse(url);

      // Checks if the incoming link is the Firebase action route.
      // Note: Expo parses paths without the leading slash.
      if (parsedUrl.path === "__/auth/action") {
        const mode = parsedUrl.queryParams?.mode;
        const oobCode = parsedUrl.queryParams?.oobCode as string;

        // Handles the Email Verification flow.
        if (mode === "verifyEmail" && oobCode) {
          try {
            // Verifies the code with Firebase.
            await applyActionCode(auth, oobCode);
            
            // Forces the local user object to refresh its data 
            // so the Navigation Guard knows the email is verified.
            if (auth.currentUser) {
              await auth.currentUser.reload();
              // Updates the local state to trigger the layout router.
              // Spreading the object forces React to register the state change.
              setUser({ ...auth.currentUser } as FirebaseAuthTypes.User);
              router.replace("/(onboarding)");
            }
          } catch (error: any) {
            console.error("Email verification failed:", error);
            Alert.alert("Verification Error", error.message);
          }
        }
        
        // Handles the Password Reset flow.
        else if (mode === "resetPassword" && oobCode) {
          // Routes the user to the reset password screen, passing the code.
          router.replace(`/(auth)/reset-password?oobCode=${oobCode}`);
        }
      }
    };

    // Catches the deep link if the app was completely closed (cold start).
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Catches the deep link if the app is already open in the background.
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]); // Added router to dependency array as best practice

  // Profile Listener: Watches the Firestore 'users' doc for changes.
  useEffect(() => {
    // Only run if the user exists and is verified.
    if (!user || !user.emailVerified) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        // Check if the document actually exists in Firestore
        if (!snap.exists()) {
          // If it doesn't exist, they definitely aren't validated yet.
          setIsProfileValidated(false);
        } else {
          // If it does exist, check for their selected tags.
          const hasInterests = !!(snap.data()?.selectedTags?.length > 0);
          setIsProfileValidated(hasInterests);
        }
        
        // Stop the loading spinner now that we have an answer.
        setInitializing(false);
      },
      // Type the error as generic Error
      (error: Error) => {
        console.error("Profile Listener Error:", error);
        setInitializing(false); // Stop loading even if there's an error.
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.emailVerified]);

  // Navigation Guard, The "Traffic Controller" of user nav.
  useEffect(() => {
    if (initializing) return;
    if (user?.emailVerified && isProfileValidated === null) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";
    const isOnVerifyScreen = segments[1] === "verify-user";

    // Unauthenticated 
    if (!user) {
      if (!inAuthGroup) router.replace("/(auth)/landing"); 
      return;
    }

    // Unverified 
    if (!user.emailVerified) {
      if (!isOnVerifyScreen) router.replace("/(auth)/verify-user"); 
      return;
    }

    // Authenticated but not onboarded 
    if (isProfileValidated === false) {
      if (!inOnboardingGroup) router.replace("/(onboarding)"); 
      return;
    }

    // Fully onboarded users 
    if (isProfileValidated === true) {
      if (inAuthGroup || inOnboardingGroup || isOnVerifyScreen) {
        router.replace("/(tabs)"); 
      }
    }
  }, [user, segments, initializing, isProfileValidated, router]); // Added router to dependency array

  // Loading UI
  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}