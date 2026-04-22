import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
<<<<<<< HEAD
import LearningCard from "@/components/LearningCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc, LearningDoc } from "@/types/type";
=======
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
>>>>>>> bb5a855 (fix: adapted from main)
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
<<<<<<< HEAD
  SectionList,
=======
  FlatList,
>>>>>>> bb5a855 (fix: adapted from main)
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookmarkedEventsUIProps {
  events: EventDoc[];
<<<<<<< HEAD
  learningContents: LearningDoc[];
  loading: boolean;
  onBack: () => void;
  onPressCard: (event: EventDoc) => void;
  onRemoveBookmark: (item: EventDoc | LearningDoc) => Promise<void>;
  onRsvp: (event: EventDoc) => void;
  onPressLearning: () => void;
  onRemoveCourseBookmark: (item: EventDoc | LearningDoc) => Promise<void>;
=======
  loading: boolean;
  onBack: () => void;
  onPressCard: (event: EventDoc) => void;
  onRemoveBookmark: (event: EventDoc) => void;
  onRsvp: (event: EventDoc) => void;
>>>>>>> bb5a855 (fix: adapted from main)
}

export const BookmarkedEventsUI = ({
  events,
<<<<<<< HEAD
  learningContents,
=======
>>>>>>> bb5a855 (fix: adapted from main)
  loading,
  onBack,
  onPressCard,
  onRemoveBookmark,
  onRsvp,
<<<<<<< HEAD
  onPressLearning,
  onRemoveCourseBookmark,
}: BookmarkedEventsUIProps) => {
  const sections: {
    title: string;
    data: (EventDoc | LearningDoc)[];
    type: string;
  }[] = [
    { title: "Saved Events", data: events, type: "event" },
    { title: "Saved Learnings", data: learningContents, type: "learning" },
  ].filter((s) => s.data.length > 0);

  const isEmpty = events.length === 0 && learningContents.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Bookmarks" showBack={true} />
=======
}: BookmarkedEventsUIProps) => {
  const renderItem = ({ item }: { item: EventDoc }) => (
    <EventCard
      event={item}
      showBookmark
      bookmarked={true}
      onPressCard={() => onPressCard(item)}
      onPressBookmark={() => onRemoveBookmark(item)}
      onPressRsvp={() => onRsvp(item)}
    />
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader title="Bookmarked Events" showBack={true} />
>>>>>>> bb5a855 (fix: adapted from main)

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
<<<<<<< HEAD
      ) : isEmpty ? (
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={60} color={colors.darkGrey} />
          <Text style={styles.emptyText}>No bookmarks yet!</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={({ item, section }) => {
            if (section.type === "event") {
              const event = item as EventDoc;
              return (
                <EventCard
                  event={event}
                  showBookmark
                  bookmarked={true}
                  onPressCard={() => onPressCard(event)}
                  onPressBookmark={() => onRemoveBookmark(event)}
                  onPressRsvp={() => onRsvp(event)}
                />
              );
            }
            const content = item as LearningDoc;
            return (
              <LearningCard
                item={{ ...content, isBookmarked: true }}
                onPressCard={() => onPressLearning()}
                onBookmarkPress={() => onRemoveCourseBookmark(content)}
              />
            );
          }}
=======
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="bookmark-outline"
                size={60}
                color={colors.textOnPrimary}
              />
              <Text style={styles.emptyText}>No bookmarked events yet!</Text>
            </View>
          }
>>>>>>> bb5a855 (fix: adapted from main)
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.textOnPrimary },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  listPadding: { padding: 16 },
<<<<<<< HEAD
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.primary,
  },
=======
>>>>>>> bb5a855 (fix: adapted from main)
  rsvpBtn: {
    backgroundColor: colors.saveBtnColor,
    padding: 10,
    borderRadius: 8,
  },
  rsvpText: { fontWeight: "bold", fontSize: 12 },
  emptyText: { marginTop: 10, color: colors.darkGrey, fontSize: 16 },
});
