import { Link } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme/ThemeProvider";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>GMA Connect</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Last name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date of birth</Text>
          <TextInput
            style={styles.input}
            value={dob}
            onChangeText={setDob}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            placeholderTextColor="#888"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed((prev) => !prev)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]} />
          <Text style={styles.checkboxText}>
            I agree to Terms and Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login">
            <Text style={styles.footerLink}>Login</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  box: {
    width: 300,
    backgroundColor: colors.secondary,
    alignSelf: "center",
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textOnSecondary,
    marginBottom: 24,
    textAlign: "center",
  },
  fieldGroup: {
    marginBottom: 8,
  },
  label: {
    color: colors.textOnSecondary,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ffffff",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#a64d79",
    borderColor: "#a64d79",
  },
  checkboxText: {
    color: "#f5f5f5",
    fontSize: 14,
    flexShrink: 1,
  },
  createButton: {
    backgroundColor: "#a64d79",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#c4c4c4",
    fontSize: 14,
  },
  footerLink: {
    color: "#007bff",
    fontSize: 14,
  },
});
