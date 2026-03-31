/**
 * ROOT NAVIGATION GUARD
 * The "Traffic Controller" of the application. 
 * Orchestrates global routing logic by checking Auth status, Email Verification, 
 * and Onboarding completion to ensure users are always in the correct app section.
 */

import { auth, applyActionCode } from "@/services/authService";
import { Stack, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import React, { useEffect } from "react";
import { ActivityIndicator, View, Alert} from "react-native";
import { colors } from "@/theme/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";


export default function RootLayout() {
  const { user, initializing, isProfileValidated } = useAuth();
  // Stores the current folder path (segments) and the navigation tool (router).
  const segments = useSegments();
  const router = useRouter();

  
  useEffect(() => {
  /**
   * @summary Parses the URL mode (verifyEmail or resetPassword) and executes the corresponding action.
   * @param event - The incoming linking event containing the URL.
   */
    const handleDeepLink = async (event: Linking.EventType | { url: string }) => {
      const { url } = event;
      if (!url) return;

      const parsedUrl = Linking.parse(url);

      // Checks if the incoming link is the Firebase action route.
      if (parsedUrl.path === "__/auth/action") {
        const mode = parsedUrl.queryParams?.mode;
        const oobCode = parsedUrl.queryParams?.oobCode as string;

        // Handles the Email Verification flow.
        if (mode === "verifyEmail" && oobCode) {
          try {
            // Verifies the code with Firebase.
            await applyActionCode(auth, oobCode);
            
            // Forces the local user object to refresh its data, to know if email is verifed 
            if (auth.currentUser) {
              await auth.currentUser.reload();
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
  }, [router]); 


  /**
   *@summary Redirects users to Landing, Verify, Onboarding, or Tabs based on their status.
   */
  useEffect(() => {
    // Prevent routing while auth or profile data is still being retrieved.
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
  }, [user, segments, initializing, isProfileValidated, router]); 

  // Loading UI
  const inAuthGroup = segments[0] === "(auth)";
  if (initializing || (user?.emailVerified && isProfileValidated === null) || (!user && !initializing && !inAuthGroup)) {
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
return <Stack screenOptions={{ headerShown: false }} />;
}