import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import React, { useState } from "react";
import {
  Alert,
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
import { AppHeader } from "@/components/AppHeader";
import { ProfileFormData } from "@/types/type";


interface Props {
  onSave: (data: ProfileFormData) => void;
  onBack: () => void;
  initialData: ProfileFormData | null;
}

export function EditProfileScreen({ onSave, onBack, initialData }: Props) {
  // --- STATE ---
  // Stores the user's input values for each field in the form.
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [email, setEmail] = useState(initialData?.email || "");

  // --- LOGIC ---
  const handleSavePress = () => {
    // 1. Check if any fields are empty
    if (!firstName || !lastName || !email) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    
    

    // 3. Basic Email Validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    // 4. Pass the cleaned data back to the Route manager
    onSave({ firstName, lastName, email });
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

            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
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
