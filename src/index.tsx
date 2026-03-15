import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>GMA Connect</Text>
      <Text style={styles.subtitle}>Connect - Grow - Thrive</Text>

      <View style={styles.box}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]}>
          <Link href={"/login"} asChild>
            <Text style={styles.primaryButtonText}>Login</Text>
          </Link>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Link href={"/register"} asChild>
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </Link>
        </TouchableOpacity>

        <Link href={"/profile-setup"} asChild>
          <Text style={styles.guestText}>Continue as guest</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#a64d79",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  box: {
    width: 300,
    backgroundColor: "#FAF0E4",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#c4c4c4",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#25292e",
  },
  secondaryButton: {
    backgroundColor: "#25292e",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  guestText: {
    marginTop: 8,
    color: "#007bff",
    fontSize: 14,
  },
});
