/**
 * ONBOARDING GROUP LAYOUT
 * This layout wraps the profile setup and interest selection screens.
 * The Root Traffic Controller ensures users stay here until isProfileValidated is true.
 */

import { Stack } from "expo-router";
import React from "react";

/**
 * @summary Renders stack settings for onboarding routes.
 * @throws {never} Pure layout rendering does not throw.
 * @Returns {React.JSX.Element} Onboarding stack navigator.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        
        // 🛡️ Safety: Prevents users from swiping back during the onboarding process.
        gestureEnabled: false,
        animation: "slide_from_right",
      }}
    />
  );
}