/**
 * AUTH GROUP LAYOUT
 * This layout wraps all authentication-related screens (Landing, Login, Register, Verify).
 * Navigation guarding and loading states are managed by the Root Traffic Controller.
 */

import { Stack } from "expo-router";
import React from "react";

/**
 * @summary Renders the auth stack configuration for authentication routes.
 * @throws {never} Pure layout rendering does not throw.
 * @Returns {React.JSX.Element} Auth navigator stack.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,  // Keeps the top navigation bar hidden for a clean, full-screen auth experience.
        animation: "fade",  // A fade animation makes transitions between auth screens 
      }}
    />
  );
}