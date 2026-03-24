import { auth, db, doc, onSnapshot } from "@/services/authService";
import { FirebaseAuthTypes, onAuthStateChanged } from "@react-native-firebase/auth";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/theme/ThemeProvider";


/* The `RootLayout` component serves as the main layout for the app. 
It checks if the authentication state is still initialising and displays a loading indicator if it is. 
Once the initialisation is complete, it renders the child components using the `Slot` component 
from `expo-router`, which allows for nested routing and layout management. This structure ensures that 
the app can handle authentication states gracefully while providing a consistent layout for all screens. */
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

  
  //  Auth Listener, Watches for login or logout events.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsProfileValidated(false); 
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);


  //  Profile Listener, Watches the Firestore 'users' doc for changes.
  useEffect(() => {
    if (!user || !user.emailVerified) return;


    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      const hasInterests = !!(snap.data()?.selectedTags?.length > 0);
      setIsProfileValidated(hasInterests);
    });


    return () => unsubscribe();
  }, [user?.uid, user?.emailVerified]);

  
  //  Navigation Guard, The "Traffic Controller" of user nav.
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
  }, [user, segments, initializing, isProfileValidated]);


  // Loading UI
  if (initializing || (user?.emailVerified && isProfileValidated === null)) {
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