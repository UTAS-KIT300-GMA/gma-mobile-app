/**
 * ProfileSetupScreen.tsx
 * * This component allows users to select their interests across three "Pillars" 
 * (Connect, Grow, Thrive) and saves them to their Hobart Firebase profile.
 */

import { useRouter } from "expo-router"; 
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/ThemeProvider";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { InterestKey } from "@/types/type";

// Define the shape of data this component expects from its parent
interface Props {
  onSave: (selectedTags: InterestKey[]) => void;
  saving: boolean;                              
  userName?: string;
  isEditing?: boolean;
  initialInterests?: InterestKey[];                            
}

export function ProfileSetupScreen({ onSave, saving, userName = "User" }: Props) {
  // Access the Expo Router for stack navigation
  const router = useRouter();
  
  /**
   * STATE: selected
   * Stores interests as a key-value pair (e.g., {"Yoga": true}).
   * Using Partial<Record> allows us to only store the keys the user interacts with.
   */
  const [selected, setSelected] = useState<Partial<Record<InterestKey, boolean>>>({});

  /**
   * MEMOIZED VALUE: selectedTags
   * Converts the 'selected' object into a clean array of strings for the database.
   * useMemo ensures this calculation only runs when the 'selected' state changes.
   */
  const selectedTags = useMemo(() => {
    return (Object.keys(selected) as InterestKey[]).filter((k) => selected[k]);
  }, [selected]);

  // Toggles the boolean value of an interest when a pill is tapped
  const toggle = (key: InterestKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * RENDER HELPER: renderPill
   * Generates the UI for each individual interest tag.
   * Swaps styles based on the 'isActive' boolean.
   */
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
      
      {/* NAVIGATION: Back Button to return to the previous screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.textOnSecondary} />
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </TouchableOpacity>

      <View style={styles.box}>
        {/* HEADER: User Avatar and Name display */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            {/* Logic: Get the first letter of the name, fallback to 'U' if empty */}
            <Text style={styles.avatarInitials}>
              {(userName || "U").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{userName}</Text>
        </View>

        <Text style={styles.heading1}>Tailor Your Hobart Experience</Text>
        <Text style={styles.subHeading}>Select interests to personalize your feed.</Text>

        {/* --- PILLAR 1: CONNECT (Social) --- */}
        <Text style={styles.pillarHeader}>Connect (Social & Community)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Social Networking", "Cultural & Community Events", "Creative Arts & Crafts",
            "Games, Trivia & Bingo", "Food & Cooking", "Music & Karaoke",
            "Book Club", "Theatre & Movies"
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* --- PILLAR 2: GROW (Professional) --- */}
        <Text style={styles.pillarHeader}>Grow (Professional & Skills)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Professional Networking", "Career Development & Info", "Workshops & Skill Share",
            "Mentoring & Coaching", "Financial Literacy & Investing", "Real Estate & Home Ownership",
            "Public Speaking & Communication", "Entrepreneurship"
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* --- PILLAR 3: THRIVE (Wellness) --- */}
        <Text style={styles.pillarHeader}>Thrive (Health & Wellness)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Running & Walking", "Hiking & Outdoor Adventure", "Yoga & Pilates",
            "Gym & Fitness", "Team Sports", "Wellness & Retreats",
            "Climbing & Extreme Sports", "Cycling & Riding", "Healthy Eating"
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* ACTION: Save Button. Shows a spinner when 'saving' is true */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={() => onSave(selectedTags)}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Finish Setup ({selectedTags.length})</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  box: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35, 
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarInitials: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  username: {
    color: colors.textOnSecondary,
    fontSize: 18,
    fontWeight: "600",
  },
  heading1: {
    color: colors.textOnSecondary,
    fontSize: 20,
    fontWeight: "700",
    textAlign: 'center',
  },
  subHeading: {
    color: colors.textOnSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  pillarHeader: {
    color: colors.textOnSecondary,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    borderLeftWidth: 4, 
    borderLeftColor: "#a64d79",
    paddingLeft: 10,
  },
  tagWrapper: {
    flexDirection: "row",
    flexWrap: "wrap", 
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  pillActive: {
    backgroundColor: "#a64d79", 
    borderColor: "#a64d79",
  },
  pillText: {
    color: "#666",
    fontSize: 12,
  },
  pillTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#a64d79",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6, 
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10, 
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.textOnSecondary,
    fontWeight: '500',
  },
});