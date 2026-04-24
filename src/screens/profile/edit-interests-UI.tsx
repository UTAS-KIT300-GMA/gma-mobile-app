/**
 * EditInterestsUI.tsx
 * * A dedicated screen for updating a user's Hobart event interests.
 * * Pre-fills existing tags and allows them to save new preferences to Firebase.
 */

import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { InterestKey } from "@/types/type";

// Added initialInterests to catch the data from Firestore
interface Props {
  onSave: (selectedTags: InterestKey[]) => void;
  saving: boolean;
  userName?: string;
  initialInterests?: InterestKey[];
}

/**
 * @summary Renders editable interest categories and saves updated selections.
 * @param onSave - Callback invoked with selected interest keys.
 * @param saving - Loading flag for save submission.
 * @param userName - Optional user display name.
 * @param initialInterests - Optional preselected interests.
 * @throws {never} UI delegates persistence to parent callbacks.
 * @Returns {React.JSX.Element} Edit-interests screen.
 */
export default function EditInterestsUI({
  onSave,
  saving,
  userName = "User",
  initialInterests = [],
}: Props) {
  const router = useRouter();

  // STATE: Stores interests
  const [selected, setSelected] = useState<
    Partial<Record<InterestKey, boolean>>
  >({});
  const [expandedSections, setExpandedSections] = useState({
    connect: false,
    grow: false,
    thrive: false,
  });

  // EFFECT: Pre-fill the selected tags when the screen loads so the pills light up
  useEffect(() => {
    if (initialInterests.length > 0) {
      const initialSelection: Partial<Record<InterestKey, boolean>> = {};
      initialInterests.forEach((tag) => {
        initialSelection[tag] = true;
      });
      setSelected(initialSelection);
    }
  }, [initialInterests]);

  // MEMOIZED VALUE: Converts selected object to clean array
  const selectedTags = useMemo(() => {
    return (Object.keys(selected) as InterestKey[]).filter((k) => selected[k]);
  }, [selected]);

  /**
   * @summary Toggles selected state for one interest key.
   * @param key - Interest tag key to toggle.
   * @throws {never} Pure state update does not throw.
   * @Returns {void} Updates local selection map.
   */
  const toggle = (key: InterestKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  /**
   * @summary Renders a selectable interest pill.
   * @param key - Interest tag key to render.
   * @throws {never} Pure render helper does not throw.
   * @Returns {React.JSX.Element} Pill component.
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* NAVIGATION: Back button is permanent on this edit screen */}
      <AppHeader title="Update Interests" showBack />

      <View style={styles.box}>
        {/* UPDATED COPY: Changed to reflect editing rather than onboarding */}
        <Text style={styles.heading1}>Update Your Interests</Text>

        {/* --- PILLAR 1: CONNECT --- */}
        <TouchableOpacity
          style={styles.pillarHeaderRow}
          onPress={() => toggleSection("connect")}
          activeOpacity={0.7}
        >
          <Text style={styles.pillarHeader}>Connect (Social & Community)</Text>
          <Ionicons
            name={expandedSections.connect ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.saveBtnTextColor}
          />
        </TouchableOpacity>
        {expandedSections.connect && (
          <View style={styles.tagWrapper}>
            {[
              "Social Networking",
              "Cultural & Community Events",
              "Creative Arts & Crafts",
              "Games, Trivia & Bingo",
              "Food & Cooking",
              "Music & Karaoke",
              "Book Club",
              "Theatre & Movies",
            ].map((tag) => renderPill(tag as InterestKey))}
          </View>
        )}

        {/* --- PILLAR 2: GROW --- */}
        <TouchableOpacity
          style={styles.pillarHeaderRow}
          onPress={() => toggleSection("grow")}
          activeOpacity={0.7}
        >
          <Text style={styles.pillarHeader}>Grow (Professional & Skills)</Text>
          <Ionicons
            name={expandedSections.grow ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.saveBtnTextColor}
          />
        </TouchableOpacity>
        {expandedSections.grow && (
          <View style={styles.tagWrapper}>
            {[
              "Professional Networking",
              "Career Development & Info",
              "Workshops & Skill Share",
              "Mentoring & Coaching",
              "Financial Literacy & Investing",
              "Real Estate & Home Ownership",
              "Public Speaking & Communication",
              "Entrepreneurship",
            ].map((tag) => renderPill(tag as InterestKey))}
          </View>
        )}

        {/* --- PILLAR 3: THRIVE --- */}
        <TouchableOpacity
          style={styles.pillarHeaderRow}
          onPress={() => toggleSection("thrive")}
          activeOpacity={0.7}
        >
          <Text style={styles.pillarHeader}>Thrive (Health & Wellness)</Text>
          <Ionicons
            name={expandedSections.thrive ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.saveBtnTextColor}
          />
        </TouchableOpacity>
        {expandedSections.thrive && (
          <View style={styles.tagWrapper}>
            {[
              "Running & Walking",
              "Hiking & Outdoor Adventure",
              "Yoga & Pilates",
              "Gym & Fitness",
              "Team Sports",
              "Wellness & Retreats",
              "Climbing & Extreme Sports",
              "Cycling & Riding",
              "Healthy Eating",
            ].map((tag) => renderPill(tag as InterestKey))}
          </View>
        )}

        {/* UPDATED COPY: Changed button text to "Save Changes" */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={() => onSave(selectedTags)}
        >
          {saving ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>
              Save Changes ({selectedTags.length})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Keeping your exact same style sheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.textOnPrimary },
  contentContainer: { paddingTop: 40, paddingBottom: 40 },
  box: { backgroundColor: colors.textOnPrimary, borderRadius: 16, padding: 20 },
  heading1: {
    paddingLeft: 8,
    color: colors.saveBtnTextColor,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "left",
  },
  pillarHeader: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "800",
  },
  pillarHeaderRow: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 4,
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    marginBottom: 4,
    elevation: 3,
    backgroundColor: colors.textOnPrimary,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { color: colors.primary, fontSize: 14 },
  pillTextActive: { color: colors.textOnPrimary, fontWeight: "600" },
  saveButton: {
    width: "80%",
    alignSelf: "center",
    marginTop: 30,
    backgroundColor: colors.saveBtnColor,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: colors.saveBtnTextColor,
    fontSize: 16,
    fontWeight: "700",
  },
});
