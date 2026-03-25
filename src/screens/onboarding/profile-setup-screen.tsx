import { colors } from "@/theme/ThemeProvider";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { InterestKey } from "@/types/type";

interface Props {
  onSave: (selectedTags: InterestKey[]) => void;
  saving: boolean;
  userName?: string;
}

export function ProfileSetupScreen({
  onSave,
  saving,
  userName = "User",
}: Props) {
  const [selected, setSelected] = useState<
    Partial<Record<InterestKey, boolean>>
  >({});

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
      >
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {key}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.box}>
        <Text style={styles.heading1}>Select Your Interests</Text>

        {/* --- PILLAR: CONNECT --- */}
        <Text style={styles.pillarHeader}>Connect (Social & Community)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Social Networking",
            "Creative Arts & Crafts",
            "Cultural & Community Events",
            "Book Club",
            "Games, Trivia & Bingo",
            "Food & Cooking",
            "Music & Karaoke",
            "Theatre & Movies",
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* --- PILLAR: GROW --- */}
        <Text style={styles.pillarHeader}>Grow (Professional & Skills)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Professional Networking",
            "Entrepreneurship",
            "Career Development & Info",
            "Workshops & Skill Share",
            "Mentoring & Coaching",
            "Financial Literacy & Investing",
            "Real Estate & Home Ownership",
            "Public Speaking & Communication",
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        {/* --- PILLAR: THRIVE --- */}
        <Text style={styles.pillarHeader}>Thrive (Health & Wellness)</Text>
        <View style={styles.tagWrapper}>
          {[
            "Running & Walking",
            "Team Sports",
            "Hiking & Outdoor Adventure",
            "Yoga & Pilates",
            "Gym & Fitness",
            "Climbing & Extreme Sports",
            "Wellness & Retreats",
            "Cycling & Riding",
            "Healthy Eating",
          ].map((tag) => renderPill(tag as InterestKey))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={() => onSave(selectedTags)}
        >
          {saving ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>
              Save Preferences ({selectedTags.length})
            </Text>
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
    paddingHorizontal: 15,
    justifyContent: "center",
  },

  box: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },

  heading1: {
    color: colors.saveBtnTextColor,
    fontSize: 29,
    marginTop: 60,
    fontWeight: "700",
    textAlign: "center",
    alignSelf: "flex-start",
  },

  pillarHeader: {
    color: colors.saveBtnTextColor,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.saveBtnTextColor,
    paddingLeft: 10,
  },

  tagWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // --- Inactive State of Tags ---
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    backgroundColor: colors.textOnPrimary,
    marginBottom: 4,
  },
  pillText: {
    color: colors.primary,
    fontSize: 14,
  },

  // --- Active State of Tags---
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  pillTextActive: {
    color: colors.textOnPrimary,
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: colors.saveBtnColor,
    paddingVertical: 16,
    borderRadius: 10,
    alignSelf: "center",
    width: "80%",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.saveBtnTextColor,
    fontSize: 16,
    fontWeight: "700",
    alignSelf: "center",
  },
});
