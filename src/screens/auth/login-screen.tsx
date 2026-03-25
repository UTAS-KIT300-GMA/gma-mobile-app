import { colors } from "@/theme/ThemeProvider";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Defs, RadialGradient, Rect, Stop, Svg } from "react-native-svg";

/* The `LoginScreen` component provides a user interface for users to log in to the app.
- It includes a logo, input fields for email and password, and buttons for logging in, 
navigating to the registration screen, and resetting the password.
- The screen features a vignette overlay for visual appeal, and uses styles defined in the `styles` object to ensure a consistent layout.
- The component accepts props for handling login actions, loading state, and navigation to other screens. 
*/

interface Props {
  onLogin: (email: string, pass: string) => void;
  loading: boolean;
  onRegisterPress: () => void;
  onForgotPress: () => void;
}

export const LoginScreen = ({
  onLogin,
  loading,
  onRegisterPress,
  onForgotPress,
}: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      {/* Vignette overlay */}
      <View style={styles.vignetteWrapper} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 412 917">
          <Defs>
            <RadialGradient id="vignette" cx="50%" cy="38%" rx="75%" ry="55%">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.00" />
              <Stop offset="45%" stopColor="#000000" stopOpacity="0.05" />
              <Stop offset="75%" stopColor="#5E0A3D" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#4A0830" stopOpacity="0.45" />
            </RadialGradient>
          </Defs>

          <Rect width="412" height="917" fill="url(#vignette)" />
        </Svg>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/gma-in-app-white-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Login Form */}
      <View style={styles.content}>
        <View style={styles.inputShadow}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
        </View>
        <View style={styles.inputShadow}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={() => onLogin(email, password)}
          style={styles.button}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Log in</Text>
          )}
        </TouchableOpacity>

        {/* New Navigation Links */}
        <TouchableOpacity onPress={onForgotPress} style={styles.link}>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      {/* Register Link */}
      <TouchableOpacity onPress={onRegisterPress} style={styles.link}>
        <Text style={styles.bottomLink}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.primary,
    padding: 20,
  },

  content: {
    backgroundColor: colors.background,
    alignSelf: "center",
    transform: [{ translateY: -40 }],
    width: "90%",
    height: 350,
    borderRadius: 18,
    padding: 30,
    gap: 15,
    shadowColor: colors.saveBtnTextColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Vignette overlay fills the entire screen and is positioned absolutely
  vignetteWrapper: {
    ...StyleSheet.absoluteFillObject,
  },

  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
    transform: [{ translateY: -40 }],
  },

  logo: {
    width: 200,
    height: 120,
    padding: 0,
    margin: 0,
  },

  inputShadow: {
    shadowColor: colors.saveBtnTextColor,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },

  inputContainer: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.textOnPrimary,
  },

  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.textOnPrimary,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    transform: [{ translateY: 20 }],
  },

  buttonText: {
    color: colors.textOnPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },

  bottomLink: {
    color: colors.saveBtnColor,
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
    position: "absolute",
    bottom: -100,
    alignSelf: "center",
  },

  link: {
    marginTop: 10,
    alignItems: "center",
  },

  linkText: {
    color: colors.saveBtnTextColor,
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
    transform: [{ translateY: 20 }],
  },
});
