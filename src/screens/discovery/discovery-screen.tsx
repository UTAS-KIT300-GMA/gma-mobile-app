import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface DiscoveryProps {
  filteredEvents: EventDoc[];
  loading: boolean;
  bookmarkedIds: Record<string, boolean>;
  onBookmark: (event: EventDoc) => Promise<void>;
  onCardPress: (item: EventDoc) => void;
  onRsvp: (item: EventDoc) => void;
  category: string;
  setCategory: (cat: string) => void;
  options: { key: string; label: string }[];
  title?: string;

  // Future props for access filtering
  accessFilter: string;
  onSelectAccessFilter: (filter: string) => void;

  // Future props for sorting
  sortOption: string;
  onSelectSort: (sort: string) => void;

  /** From global location state (updated at app start / resume). */
  isLocationOn: boolean;
  isLocationLoading: boolean;
  onOpenLocationSettings: () => void;
}

export const DiscoveryScreenUI: React.FC<DiscoveryProps> = ({
  filteredEvents,
  loading,
  bookmarkedIds,
  onBookmark,
  onCardPress,
  onRsvp,
  category,
  setCategory,
  options,
  title = "GMA Discovery",
  sortOption,
  onSelectSort,
  accessFilter,
  onSelectAccessFilter,
  isLocationOn,
  isLocationLoading,
  onOpenLocationSettings,
}) => {
  const [sortModalVisible, setSortModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={title} />

      <View style={styles.container}>
        {options.length > 0 && (
          <View style={styles.categoryRow}>
            {options.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setCategory(opt.key)}
                style={[
                  styles.categoryPill,
                  opt.key === category && styles.categoryPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    opt.key === category && styles.categoryTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setSortModalVisible(true)}
              style={styles.sortButton}
              accessibilityRole="button"
              accessibilityLabel="Sort events"
            >
              <Ionicons
                name="swap-vertical-outline"
                size={26}
                color={colors.primary}
              />
            </Pressable>
          </View>
        )}

        {/*Show loading indicator while events are being fetched*/}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.saveBtnTextColor} size="large" />
          </View>
        ) : (
          // If there are no events after filtering, show an empty state:
          // The `ListEmptyComponent` prop of `FlatList` is used to render a custom
          // component when the list is empty.
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons
                  name="calendar-outline"
                  size={100}
                  color={colors.darkGrey}
                />
                <Text style={styles.emptyText}>No events found.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <EventCard
                event={item}
                showBookmark
                bookmarked={!!bookmarkedIds[item.id]}
                onPressBookmark={() => onBookmark(item)}
                onPressRsvp={() => onRsvp(item)}
                onPressCard={() => onCardPress(item)}
              />
            )}
          />
        )}
      </View>

      {/* Sort options modal */}
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
            <Text style={styles.sortSheetTitle}>Sort Events</Text>

            {[
              { key: "default", label: "Default" },
              { key: "time_asc", label: "Soonest time" },
              { key: "time_desc", label: "Latest time" },
              { key: "free_only", label: "Free events only" },
              { key: "subscriber_only", label: "Subscriber events only" },
              { key: "location_nearest", label: "Nearest location" },
              { key: "location_furthest", label: "Furthest location" },
            ].map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.sortOptionRow,
                  ((option.key === "free_only" && accessFilter === "free") ||
                    (option.key === "subscriber_only" &&
                      accessFilter === "subscriber") ||
                    (option.key === "default" &&
                      sortOption === "default" &&
                      accessFilter === "all") ||
                    (option.key !== "free_only" &&
                      option.key !== "subscriber_only" &&
                      option.key !== "default" &&
                      sortOption === option.key)) &&
                    styles.sortOptionRowActive,
                ]}
                onPress={() => {
                  if (option.key.startsWith("location_")) {
                    console.log("isLocationLoading", isLocationLoading)
                    console.log("isLocationOn", isLocationOn)
                    if (!isLocationOn) {
                      onOpenLocationSettings()
                      return;
                    }
                  }

                  if (option.key === "free_only") {
                    onSelectAccessFilter("free");
                    onSelectSort("default");
                  } else if (option.key === "subscriber_only") {
                    onSelectAccessFilter("subscriber");
                    onSelectSort("default");
                  } else if (option.key === "default") {
                    onSelectAccessFilter("all");
                    onSelectSort("default");
                  } else {
                    onSelectAccessFilter("all");
                    onSelectSort(option.key);
                  }
                  setSortModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    ((option.key === "free_only" && accessFilter === "free") ||
                      (option.key === "subscriber_only" &&
                        accessFilter === "subscriber") ||
                      (option.key === "default" &&
                        sortOption === "default" &&
                        accessFilter === "all") ||
                      (option.key !== "free_only" &&
                        option.key !== "subscriber_only" &&
                        option.key !== "default" &&
                        sortOption === option.key)) &&
                      styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>

                {((option.key === "free_only" && accessFilter === "free") ||
                  (option.key === "subscriber_only" &&
                    accessFilter === "subscriber") ||
                  (option.key === "default" &&
                    sortOption === "default" &&
                    accessFilter === "all") ||
                  (option.key !== "free_only" &&
                    option.key !== "subscriber_only" &&
                    option.key !== "default" &&
                    sortOption === option.key)) && (
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
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },

  container: {
    flex: 1,
    paddingHorizontal: 8,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  listContent: {
    padding: 10,
    paddingBottom: 24,
  },

  categoryRow: {
    flexDirection: "row",
    padding: 10,
    gap: 8,
  },

  categoryPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.darkGrey,
    backgroundColor: colors.darkGrey,
    alignItems: "center",
  },

  categoryText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textOnPrimary,
  },

  categoryPillActive: {
    backgroundColor: colors.saveBtnColor,
    borderColor: colors.saveBtnColor,
  },

  categoryTextActive: {
    color: colors.saveBtnTextColor,
  },

  emptyText: {
    marginTop: 10,
    color: colors.darkGrey,
    fontSize: 24,
  },

  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },

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

  sortOptionRowActive: {
    backgroundColor: "#fdf0f5",
  },

  sortOptionText: {
    fontSize: 16,
    color: colors.darkGrey,
  },

  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});
