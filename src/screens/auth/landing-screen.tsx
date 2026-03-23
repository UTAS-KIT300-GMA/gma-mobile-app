import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GMA Connect</Text>
        <Text style={styles.subtitle}>Connect - Grow - Thrive</Text>
      </View>

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
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        <Link href={"/profile-setup" as any} asChild>
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
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#f0f0f0",
    textAlign: "center",
    opacity: 0.9,
  },
  footer: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#25292e",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#FAF0E4",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#25292e",
    fontSize: 18,
    fontWeight: "700",
  },
  guestText: {
    marginTop: 8,
    color: "#f0f0f0",
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});