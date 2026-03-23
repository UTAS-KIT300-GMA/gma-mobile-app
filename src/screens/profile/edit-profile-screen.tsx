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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
}

interface Props {
  onSave: (data: ProfileFormData) => void;
  onBack: () => void;
  initialData: ProfileFormData | null;
}

export function EditProfileScreen({ onSave, onBack, initialData }: Props) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.dateOfBirth || "");

  const handleSavePress = () => {
    
    if (!firstName || !lastName || !dateOfBirth) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(dateOfBirth)) {
      Alert.alert("Invalid Date", "Please use DD/MM/YYYY format.");
      return;
    }

    onSave({ firstName, lastName, dateOfBirth });
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
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput 
              style={styles.input} 
              value={lastName} 
              onChangeText={setLastName} 
              placeholder="Enter last name"
            />

            <Text style={styles.label}>Date of Birth</Text>
            <TextInput 
              style={styles.input} 
              value={dateOfBirth} 
              onChangeText={setDateOfBirth} 
              placeholder="DD/MM/YYYY"
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <Pressable style={styles.btnSave} onPress={handleSavePress}>
                <Text style={styles.btnText}>Save</Text>
              </Pressable>
              <Pressable style={styles.btnCancel} onPress={onBack}>
                <Text style={[styles.btnText, { color: '#666' }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  card: { 
    backgroundColor: '#F8F9FA', 
    padding: 20, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 10, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btnSave: { backgroundColor: '#a64d79', padding: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  btnCancel: { backgroundColor: '#eee', padding: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});