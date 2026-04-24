import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  gender: string;
  password: string;
  email?: string;
}

interface Props {
  onSave: (data: ProfileFormData, profileImageUri?: string) => void;
  onBack: () => void;
  initialData: ProfileFormData | null;
  initialPhotoURL?: string;
}

/**
 * @summary Renders editable profile form fields and validates before save.
 * @param onSave - Callback invoked with normalized profile form data.
 * @param onBack - Back navigation callback.
 * @param initialData - Initial profile values for the form.
 * @throws {never} Validation errors are handled via alerts.
 * @Returns {React.JSX.Element} Edit-profile form screen.
 */
export function EditProfileScreen({
  onSave,
  onBack,
  initialData,
  initialPhotoURL,
}: Props) {
  // --- STATE ---
  // Stores the user's input values for each field in the form.
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [gender, setGender] = useState(initialData?.gender || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImageUri, setProfileImageUri] = useState<string | null>(
    initialPhotoURL ?? null,
  );

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfileImageUri(result.assets[0].uri);
    }
  };

  // --- LOGIC ---
  /**
   * @summary Validates form values and submits them to the parent save handler.
   * @throws {never} Validation failures return early with alerts.
   * @Returns {void} Submits save when valid.
   */
  const handleSavePress = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !gender.trim() ||
      !email?.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (password.length > 0 && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    onSave(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender: gender.trim(),
        password,
        email: email.trim(),
      },
      profileImageUri ?? undefined,
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Edit Profile" showBack onPressBack={onBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {profileImageUri ? (
                  <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarPlaceholder}>Add Photo</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to change profile photo</Text>
            </View>

            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={colors.darkGrey}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor={colors.darkGrey}
            />

            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {["Male", "Female", "Other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderButton,
                    gender === g && styles.genderButtonSelected,
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Text
                    style={[
                      styles.genderText,
                      gender === g && styles.genderTextSelected,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.darkGrey}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              secureTextEntry
              placeholderTextColor={colors.darkGrey}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
              placeholderTextColor={colors.darkGrey}
            />

            <View style={styles.row}>
              <Pressable style={styles.btnSave} onPress={handleSavePress}>
                <Text style={styles.btnText}>Save</Text>
              </Pressable>

              <Pressable style={styles.btnCancel} onPress={onBack}>
                <Text style={styles.btnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  container: { padding: 20 },
  card: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    elevation: 3,
    borderColor: colors.background,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarButton: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#F0F1F5",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E1E3EA",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.darkGrey,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
    color: colors.saveBtnTextColor,
  },
  input: {
    backgroundColor: colors.textOnPrimary,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    borderColor: colors.textOnPrimary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },

  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    borderRadius: 8,
    elevation: 2,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.textOnPrimary,
  },

  genderButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: "#fdf0f5",
  },

  genderText: {
    color: colors.saveBtnTextColor,
    fontSize: 14,
  },

  genderTextSelected: {
    color: colors.primary,
    fontWeight: "600",
  },
  btnSave: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  btnCancel: {
    backgroundColor: colors.darkGrey,
    padding: 15,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  btnText: { color: colors.textOnPrimary, fontWeight: "bold" },
});
