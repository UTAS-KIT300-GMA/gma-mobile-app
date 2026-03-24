import { colors } from "@/theme/ThemeProvider";
import { Link, useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

/* This file defines the `LandingScreen` component, which serves as the initial screen of the app. 

- It features the app's logo, a subtitle, and buttons for logging in, creating an account, and 
resetting the password. 
- The screen uses styles defined in the `styles` object to ensure a consistent 
and visually appealing layout.
- The `useRouter` hook from `expo-router` is used to navigate to the 
appropriate screens when the buttons are pressed. 

*/

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("../../../assets/images/gma-in-app-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Connect - Grow - Thrive</Text>
      </View>
      {/* Footer with navigation buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/login" as any)}
        >
          <Text style={styles.primaryButtonText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/register" as any)}
        >
          <Text style={styles.secondaryButtonText}>Register</Text>
        </TouchableOpacity>

        <Link href={"/forgot-password" as any} asChild>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 120,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width: 200,
    height: 120,
    padding: 0,
    margin: 0,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.saveBtnTextColor,
    textAlign: "center",
    opacity: 0.9,
    marginTop: 16,
  },

  footer: {
    width: "100%",
    gap: 12,
    alignItems: "center",
    marginBottom: 220,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    width: "80%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 18,
    fontWeight: "700",
  },

  secondaryButton: {
    backgroundColor: colors.textOnPrimary,
    width: "80%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  forgotPasswordText: {
    marginTop: 8,
    color: colors.saveBtnTextColor,
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
