/**
 * ROOT NAVIGATION GUARD
 * The "Traffic Controller" of the application. 
 * Orchestrates global routing logic by checking Auth status, Email Verification, 
 * and Onboarding completion to ensure users are always in the correct app section.
 */

import { applyActionCode, auth } from "@/services/authService";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import React, { useEffect, useState, useMemo } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { colors } from "@/theme/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { GlobalProvider } from "@/context/GlobalContext";
import { FcmBootstrap } from "@/components/FcmBootstrap";
import { buildScreenTrackingNames, logScreenView } from "@/components/utils";

/**
 * @summary Applies app-wide navigation guards and renders the root stack only when auth and routing state are synchronized.
 * @throws {never} Component-level logic handles recoverable async errors internally.
 * @Returns {React.JSX.Element} Root loading gate or the authenticated navigation stack.
 */
export default function RootLayout() {
  // Stores global auth/onboarding state for root route guarding.
  const { user, initializing, isProfileValidated } = useAuth();
  
  
  // Tracks deep-link processing and initial URL readiness.
  const [isHandlingLink, setIsHandlingLink] = useState(false);
  const [initialLinkChecked, setInitialLinkChecked] = useState(false);
  
  // Stores current navigation segments and router helpers.
  const segments = useSegments() as string[];
  const pathname = usePathname();
  const router = useRouter();

  /**
   * @summary Derived route information used to determine if the router is in sync with Auth state.
   */
  const routeInfo = useMemo(() => ({
    inAuthGroup: segments.includes("(auth)"),
    inOnboardingGroup: segments.includes("(onboarding)"),
    isOnVerifyScreen: segments.includes("verify-user"),
    isResetPassword: segments.includes("reset-password"),
    isOnInvalidPath: segments.some(seg => seg.includes("__")), // Detects Firebase internal paths
    segmentKey: segments.join("/"),
  }), [segments]);

  // --- EFFECT 1: DEEP LINK CONTROLLER ---
  useEffect(() => {
  /**
   * @summary Parses the URL mode (verifyEmail or resetPassword) and executes the corresponding action.
   * @param event - The incoming linking event containing the URL.
   * @throws {Error} Throws when Firebase link action application fails.
   * @Returns {Promise<void>} Resolves after deep-link handling completes.
   */
    const handleDeepLink = async (event: Linking.EventType | { url: string }) => {
      const { url } = event;
      if (!url) return;

      const parsedUrl = Linking.parse(url);

      // Checks if the incoming link is the Firebase action route.
      if (parsedUrl.path === "__/auth/action") {
        setIsHandlingLink(true); // 🛑 LOCK UI: Prevents navigation race conditions
        
        try {
          const { mode, oobCode } = parsedUrl.queryParams ?? {};

          // Handles the Email Verification flow.
          if (mode === "verifyEmail" && typeof oobCode === "string") {
              await applyActionCode(auth, oobCode);
              
              if (auth.currentUser) {
                // Forces the local user object to refresh its verified status.
                // The useAuth hook (using onIdTokenChanged) will detect this and update state.
                await auth.currentUser.reload();
                Alert.alert("Success", "Your email has been verified!"); 
              }
          } 
          
          // Handles the Password Reset flow.
          else if (mode === "resetPassword" && typeof oobCode === "string") {
            // Routes the user to the reset password screen, passing the code.
            router.replace(`/(auth)/reset-password?oobCode=${oobCode}`);
          }
        } catch (error: any) {
          console.error("Deep Link Processing failed:", error);
          Alert.alert("Verification Error", error.message);
        } finally {
          setIsHandlingLink(false); 
        }
      }
    };

    // Catches the deep link if the app was completely closed (cold start).
    Linking.getInitialURL().then(async (url) => {
      if (url) await handleDeepLink({ url });
      setInitialLinkChecked(true); // 🔹 Mark cold start check as complete.
    });

    // Catches the deep link if the app is already open in the background.
    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]); 

  // --- EFFECT 2: THE NAVIGATION GUARD (Traffic Controller) ---
  /**
   *@summary Redirects users to Landing, Verify, Onboarding, or Tabs based on their status.
   * @throws {never} Guard logic handles navigation without throwing.
   * @Returns {void} Performs route redirects when state changes.
   */
  useEffect(() => {
    // Prevent routing while auth, deep links, or initialization is in progress.
    if (initializing || !initialLinkChecked || isHandlingLink) return;

    // Prevent routing while profile data is still being retrieved from Firestore.
    if (user && isProfileValidated === null) return;

    // CASE A: Unauthenticated 
    if (!user) {
      if (!routeInfo.inAuthGroup && !routeInfo.isResetPassword) {
        router.replace("/(auth)/landing"); 
      }
      return;
    }

    // CASE B: Unverified email
    if (!user.emailVerified) {
      if (!routeInfo.isOnVerifyScreen) {
        router.replace("/(auth)/verify-user"); 
      }
      return;
    }

    // CASE C: Authenticated but not onboarded 
    if (isProfileValidated === false) {
      if (!routeInfo.inOnboardingGroup) {
        router.replace("/(onboarding)"); 
      }
      return;
    }

    // CASE D: Fully onboarded users 
    if (isProfileValidated === true) {
      if (routeInfo.inAuthGroup || routeInfo.inOnboardingGroup || routeInfo.isOnVerifyScreen) {
        router.replace("/(tabs)"); 
      }
    }
  }, [user, initializing, isProfileValidated, isHandlingLink, initialLinkChecked, routeInfo, router]); 

  useEffect(() => {
    if (!pathname) return;
    const { screen_name, screen_class } = buildScreenTrackingNames(pathname);
    void logScreenView(null, {
      screen_name,
      screen_class,
    });
  }, [pathname]);

  // --- THE GATEKEEPER: THE FLICKER KILLER ---
  /**
   * @summary Determines if the router is physically in the correct location based on current Auth state.
   * This prevents the "1-frame flash" of the wrong screen during a redirect.
   * @throws {never} Pure derived state does not throw.
   * @Returns {boolean} True when route and auth state are aligned.
   */
  const isRoutingReady = 
    !routeInfo.isOnInvalidPath &&
    (
      (!user && routeInfo.inAuthGroup) || 
      (user && !user.emailVerified && routeInfo.isOnVerifyScreen) ||
      (user && user.emailVerified && isProfileValidated === false && routeInfo.inOnboardingGroup) ||
      (user && user.emailVerified && isProfileValidated === true && !routeInfo.inAuthGroup && !routeInfo.inOnboardingGroup)
    );

  // Loading UI Logic
  /**
   * @summary Determines if the application is in a loading state. 
   * Blocks UI if initializing, handling a link, waiting for Firestore, or if the router hasn't landed yet.
   * @throws {never} Pure derived state does not throw.
   * @Returns {boolean} True when loading UI should be displayed.
   */
  const isLoading = 
    initializing || 
    !initialLinkChecked || 
    isHandlingLink || 
    !isRoutingReady || 
    (user && isProfileValidated === null);

  if (isLoading) {
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

  // Once loading is complete and routing is confirmed, render the actual navigation stack.
  return (
      <GlobalProvider>
        <FcmBootstrap />
        <Stack screenOptions={{ headerShown: false }} />
      </GlobalProvider>
  )
}