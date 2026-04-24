import { AppHeader } from "@/components/AppHeader";
import LearningCard from "@/components/LearningCard";
import { colors } from "@/theme/ThemeProvider";
import { LearningDoc } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoPlayer from "./video-player";

// Helper to parse "MM:SS" or "H:MM:SS" duration string to total seconds
/**
 * @summary Converts a duration string into total seconds for sort comparisons.
 * @param duration - Duration in MM:SS or H:MM:SS format.
 * @throws Returns 0 when format is invalid or unparsable.
 * @Returns Total duration in seconds.
 */
function parseDurationToSeconds(duration: string): number {
  // Holds parsed numeric duration segments split by ":".
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

interface Props {
  events: LearningDoc[];
  loading: boolean;
  expandedId: string | null;
  onBookmarkPress?: (id: string) => void;
  onCardPress?: (item: LearningDoc) => void;
  onFilePress?: (url: string) => void;
}

/**
 * @summary Renders learning cards with sort/filter controls, expansion, and media actions.
 * @param events - Learning content records to display.
 * @param loading - Loading state for content fetch.
 * @param expandedId - Currently expanded card ID.
 * @param onBookmarkPress - Optional bookmark toggle callback.
 * @param onCardPress - Optional card expand/collapse callback.
 * @param onFilePress - Optional file-open callback.
 * @throws {never} UI delegates side effects to callback props.
 * @Returns {React.JSX.Element} Learning screen view.
 */
export const LearningScreenUI: React.FC<Props> = ({
  events,
  loading,
  expandedId,
  onBookmarkPress,
  onCardPress,
  onFilePress,
}) => {
  // Holds modal visibility and active sort/filter choices.
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  const [accessFilter, setAccessFilter] = useState("all");

  // Holds a derived list after applying filter + sort rules.
  const sortedEvents = useMemo(() => {
    // Holds mutable working copy of events for transformations.
    let filtered = [...events];

    // Apply access filter
    if (accessFilter === "free") {
      filtered = filtered.filter((e) => e.accessType === "free");
    } else if (accessFilter === "paid") {
      filtered = filtered.filter((e) => e.accessType !== "free");
    }

    // Apply sort
    if (sortOption === "duration_asc") {
      filtered.sort(
        (a, b) =>
          parseDurationToSeconds(a.duration) -
          parseDurationToSeconds(b.duration),
      );
    } else if (sortOption === "duration_desc") {
      filtered.sort(
        (a, b) =>
          parseDurationToSeconds(b.duration) -
          parseDurationToSeconds(a.duration),
      );
    } else if (sortOption === "title_asc") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "title_desc") {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }

    return filtered;
  }, [events, sortOption, accessFilter]);

  // Holds selectable sort/filter menu options shown in modal sheet.
  const sortOptions = [
    { key: "default", label: "Default" },
    { key: "duration_asc", label: "Shortest Contents first" },
    { key: "duration_desc", label: "Longest Contents first" },
    { key: "title_asc", label: "Title A-Z" },
    { key: "title_desc", label: "Title Z-A" },
    { key: "free_only", label: "Free only" },
    { key: "subscriber_only", label: "Subscribers only" },
  ];

  /**
   * @summary Checks whether a sort/filter option is currently active in UI.
   * @param key - Option key from the sort/filter menu.
   * @throws Does not throw; evaluates current local state only.
   * @Returns True when the option is active, otherwise false.
   */
  const isActive = (key: string) => {
    if (key === "free_only") return accessFilter === "free";
    if (key === "subscriber_only") return accessFilter === "paid";
    if (key === "default")
      return sortOption === "default" && accessFilter === "all";
    return sortOption === key;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="GMA Learning" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.sortRow}>
          <Text style={styles.sectionTitle}>Recommended Learning</Text>
          <Pressable
            onPress={() => setSortModalVisible(true)}
            style={styles.sortButton}
            accessibilityRole="button"
            accessibilityLabel="Sort learning content"
          >
            <Ionicons
              name="swap-vertical-outline"
              size={26}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {events.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No learning videos available yet.
            </Text>
          </View>
        )}

        {sortedEvents.map((item) => {
          const isExpanded = expandedId === item.id;
          const isSubscriberOnly = item.accessType === "paid";

          if (!isExpanded) {
            return (
              <LearningCard
                key={item.id}
                item={item}
                onPressCard={() => onCardPress?.(item)}
                onBookmarkPress={() => onBookmarkPress?.(item.id)}
              />
            );
          }

          return (
            <View key={item.id} style={styles.expandedCard}>
              <View style={styles.expandedMediaWrapper}>
                <TouchableOpacity
                  style={styles.bookmarkButton}
                  onPress={() => onBookmarkPress?.(item.id)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                    size={23}
                    color={colors.secondary}
                  />
                </TouchableOpacity>

                {/* CLOUDINARY VIDEO PLAYER */}
                <VideoPlayer publicId={item.cloudinaryPublicId || ""} />
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.title}>{item.title}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.duration}>{item.duration}</Text>

                  <View style={styles.ctaButton}>
                    {isSubscriberOnly && (
                      <Ionicons
                        name="lock-closed"
                        size={12}
                        color={colors.saveBtnTextColor}
                        style={styles.ctaIcon}
                      />
                    )}
                    <Text style={styles.ctaText}>
                      {isSubscriberOnly ? "Subscribers only" : "Free"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.description}>
                  {item.description || "No description available yet."}
                </Text>

                {/* File RESOURCE BUTTON */}
                {item.fileId ? (
                  <TouchableOpacity
                    style={styles.fileButton}
                    onPress={() => onFilePress?.(item.fileId!)}
                  >
                    <Ionicons
                      name="document-text"
                      size={18}
                      color={colors.saveBtnTextColor}
                    />
                    <Text style={styles.fileButtonText}>
                      View Learning Material (FILE)
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => onCardPress?.(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSortModalVisible(false)}
        >
          <Pressable style={styles.sortSheet} onPress={() => {}}>
            <Text style={styles.sortSheetTitle}>Sort & Filter</Text>

            {sortOptions.map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.sortOptionRow,
                  isActive(option.key) && styles.sortOptionRowActive,
                ]}
                onPress={() => {
                  if (option.key === "free_only") {
                    setAccessFilter("free");
                    setSortOption("default");
                  } else if (option.key === "subscriber_only") {
                    setAccessFilter("paid");
                    setSortOption("default");
                  } else if (option.key === "default") {
                    setAccessFilter("all");
                    setSortOption("default");
                  } else {
                    setAccessFilter("all");
                    setSortOption(option.key);
                  }
                  setSortModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    isActive(option.key) && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {isActive(option.key) && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Holds all style declarations for the learning screen UI.
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.textOnPrimary,
  },
  container: { paddingHorizontal: 16 },
  sortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },

  sortButton: { padding: 4 },

  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: colors.saveBtnTextColor,
    marginBottom: 15,
    paddingHorizontal: 0,
    paddingTop: 10,
  },
  emptyState: { paddingHorizontal: 8, paddingTop: 8 },
  emptyStateText: { color: "#666", fontSize: 14 },

  expandedCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  expandedMediaWrapper: { position: "relative", backgroundColor: "#000" },
  bookmarkButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 43,
    height: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.textOnPrimary,
    zIndex: 3,
  },
  infoSection: { padding: 14 },
  title: {
    color: colors.saveBtnTextColor,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  metaRow: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  duration: { color: "#777", fontSize: 12 },
  ctaButton: {
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  ctaText: { color: colors.saveBtnTextColor, fontSize: 12, fontWeight: "800" },
  ctaIcon: { marginRight: 6 },
  description: {
    color: "#444",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "justify",
  },

  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  fileButtonText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "700",
    color: colors.saveBtnTextColor,
  },

  closeBtn: {
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 16,
  },
  closeBtnText: {
    fontWeight: "800",
    fontSize: 12,
    color: colors.saveBtnTextColor,
  },
  bottomSpacing: { height: 24 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sortSheet: {
    backgroundColor: colors.textOnPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  sortSheetTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 16,
  },
  sortOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  sortOptionRowActive: { backgroundColor: "#fdf0f5" },
  sortOptionText: { fontSize: 16, color: colors.darkGrey },
  sortOptionTextActive: { color: colors.primary, fontWeight: "700" },
});
