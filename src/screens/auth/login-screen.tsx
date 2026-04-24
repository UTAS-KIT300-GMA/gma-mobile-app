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

interface Props {
  onLogin: (email: string, pass: string) => void;
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
  loading: boolean;
  onRegisterPress: () => void;
  onForgotPress: () => void;
}

/**
 * @summary Renders the login UI with email/password fields, social sign-in buttons, and navigation links to register and forgot-password screens.
 * @param onLogin - Callback invoked with the entered email and password when the login button is pressed.
 * @param onGoogleLogin - Callback invoked when the Google sign-in button is pressed.
 * @param onFacebookLogin - Callback invoked when the Facebook sign-in button is pressed.
 * @param loading - When true, disables inputs and shows an activity indicator.
 * @param onRegisterPress - Callback to navigate to the registration screen.
 * @param onForgotPress - Callback to navigate to the forgot-password screen.
 * @throws {never} UI component delegates async handling to passed callbacks.
 * @Returns {React.JSX.Element} Login form screen.
 */
export const LoginScreen = ({
  onLogin,
  onGoogleLogin, onFacebookLogin,
  loading,
  onRegisterPress,
  onForgotPress,
}: Props) => {
  // Stores login form field values.
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

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Login Button */}
        <TouchableOpacity
          onPress={onGoogleLogin}
          style={styles.googleButton}
          disabled={loading}
        >
          <Image
            source={require("../../../assets/images/google-icon.jpg")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={onFacebookLogin}
            style={[styles.socialButton, styles.facebookButton]}
            disabled={loading}
        >
          <Image
              source={require("../../../assets/images/facebook-icon.png")}
              style={styles.socialIcon}
              resizeMode="contain"
          />
          <Text style={styles.facebookButtonText}>Sign in with Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Register Link */}
      <TouchableOpacity
        onPress={onRegisterPress}
        style={styles.registerContainer}
      >
        <Text style={styles.bottomLink}>
          {"Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={onForgotPress} style={styles.link}>
        <Text style={styles.bottomLink}>Forgot Password?</Text>
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
    width: "90%",
    borderRadius: 18,
    padding: 30,
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
    marginBottom: 15,
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
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.lightGrey,
  },
  orText: {
    marginHorizontal: 10,
    color: colors.darkGrey,
    fontSize: 14,
  },
  googleButtonContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  socialButton: {
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 10, // Space between Google and Facebook
  },
  googleButton: {
    backgroundColor: colors.textOnPrimary,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  socialIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    left: 5,
  },
  socialButtonText: {
    color: colors.darkGrey,
    fontWeight: "700",
    fontSize: 16,
  },
  facebookButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    position: "absolute",
    left: 10,
  },
  googleButtonText: {
    color: colors.darkGrey,
    fontWeight: "700",
    fontSize: 16,
  },
  link: {
    marginTop: 10,
    alignItems: "center",
  },
  registerContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  bottomLink: {
    color: colors.saveBtnColor,
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});