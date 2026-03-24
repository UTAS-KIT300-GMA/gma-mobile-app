/**
 * EditInterestsUI.tsx
 * * A dedicated screen for updating a user's Hobart event interests.
 * * Pre-fills existing tags and allows them to save new preferences to Firebase.
 */

import { useRouter } from "expo-router"; 
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/ThemeProvider";
import { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { InterestKey } from "@/types/type";

// Added initialInterests to catch the data from Firestore
interface Props {
  onSave: (selectedTags: InterestKey[]) => void;
  saving: boolean;                               
  userName?: string;                             
  initialInterests?: InterestKey[];              
}

export default function EditInterestsUI({ 
  onSave, 
  saving, 
  userName = "User", 
  initialInterests = [] 
}: Props) {
  
  const router = useRouter();
  
  // STATE: Stores interests
  const [selected, setSelected] = useState<Partial<Record<InterestKey, boolean>>>({});

  // EFFECT: Pre-fill the selected tags when the screen loads so the pills light up
  useEffect(() => {
    if (initialInterests.length > 0) {
      const initialSelection: Partial<Record<InterestKey, boolean>> = {};
      initialInterests.forEach(tag => {
        initialSelection[tag] = true;
      });
      setSelected(initialSelection);
    }
  }, [initialInterests]);

  // MEMOIZED VALUE: Converts selected object to clean array
  const selectedTags = useMemo(() => {
    return (Object.keys(selected) as InterestKey[]).filter((k) => selected[k]);
  }, [selected]);

  const toggle = (key: InterestKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderPill = (key: InterestKey) => {
    const isActive = selected[key];
    return (
      <TouchableOpacity
        key={key}
        style={[styles.pill, isActive && styles.pillActive]}
        onPress={() => toggle(key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {key}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* NAVIGATION: Back button is permanent on this edit screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.textOnSecondary} />
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </TouchableOpacity>

      <View style={styles.box}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {(userName || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{userName}</Text>
        </View>

        {/* UPDATED COPY: Changed to reflect editing rather than onboarding */}
        <Text style={styles.heading1}>Update Your Interests</Text>
        <Text style={styles.subHeading}>Modify your tags to refresh your feed.</Text>

        {/* --- PILLAR 1: CONNECT --- */}
        <Text style={styles.pillarHeader}>Connect (Social & Community)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Social Networking", "Cultural & Community Events", "Creative Arts & Crafts",
            "Games, Trivia & Bingo", "Food & Cooking", "Music & Karaoke",
            "Book Club", "Theatre & Movies"
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* --- PILLAR 2: GROW --- */}
        <Text style={styles.pillarHeader}>Grow (Professional & Skills)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Professional Networking", "Career Development & Info", "Workshops & Skill Share",
            "Mentoring & Coaching", "Financial Literacy & Investing", "Real Estate & Home Ownership",
            "Public Speaking & Communication", "Entrepreneurship"
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* --- PILLAR 3: THRIVE --- */}
        <Text style={styles.pillarHeader}>Thrive (Health & Wellness)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Running & Walking", "Hiking & Outdoor Adventure", "Yoga & Pilates",
            "Gym & Fitness", "Team Sports", "Wellness & Retreats",
            "Climbing & Extreme Sports", "Cycling & Riding", "Healthy Eating"
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* UPDATED COPY: Changed button text to "Save Changes" */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={() => onSave(selectedTags)}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes ({selectedTags.length})</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Keeping your exact same style sheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { paddingTop: 40, paddingBottom: 40 },
  box: { backgroundColor: colors.background, borderRadius: 16, padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  avatarInitials: { color: "#ffffff", fontSize: 28, fontWeight: "700" },
  username: { color: colors.textOnSecondary, fontSize: 18, fontWeight: "600" },
  heading1: { color: colors.textOnSecondary, fontSize: 20, fontWeight: "700", textAlign: 'center' },
  subHeading: { color: colors.textOnSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20, opacity: 0.8 },
  pillarHeader: { color: colors.textOnSecondary, fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: "#a64d79", paddingLeft: 10 },
  tagWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#ccc", marginBottom: 4, backgroundColor: "#fff" },
  pillActive: { backgroundColor: "#a64d79", borderColor: "#a64d79" },
  pillText: { color: "#666", fontSize: 12 },
  pillTextActive: { color: "#ffffff", fontWeight: "600" },
  saveButton: { marginTop: 30, backgroundColor: "#a64d79", paddingVertical: 16, borderRadius: 10, alignItems: "center" },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, marginTop: 10 },
  backButtonText: { marginLeft: 8, fontSize: 16, color: colors.textOnSecondary, fontWeight: '500' },
});