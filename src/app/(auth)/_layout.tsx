/**
 * AUTH GROUP LAYOUT
 * This layout wraps all authentication-related screens (Landing, Login, Register, Verify).
 * Navigation guarding and loading states are managed by the Root Traffic Controller.
 */

import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // Keeps the top navigation bar hidden for a clean, full-screen auth experience.
        headerShown: false,
        // A fade animation makes transitions between auth screens 
        animation: "fade",
      }}
    />
  );
}