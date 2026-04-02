/**
 * UNMATCHED ROUTE SHIELD
 * This is a "Catch-All" route ([...unmatched]).
 * It intercepts deep links or invalid paths that don't match physical files.
 * It shows a spinner while the RootLayout logic determines the correct destination.
 */

import { ActivityIndicator, View } from "react-native";
import { colors } from "@/theme/ThemeProvider";

export default function UnmatchedShield() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      {/* This keeps the UI consistent. The user thinks the app is still 
        "loading" their verification, rather than "crashing". 
      */}
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}