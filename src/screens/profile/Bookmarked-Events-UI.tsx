import { AppHeader } from "@/components/AppHeader";
import { EventCard } from "@/components/EventCard";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookmarkedEventsUIProps {
  events: EventDoc[];
  loading: boolean;
  onBack: () => void;
  onPressCard: (event: EventDoc) => void;
  onRemoveBookmark: (event: EventDoc) => void;
  onRsvp: (event: EventDoc) => void;
}

export const BookmarkedEventsUI = ({
  events,
  loading,
  onBack,
  onPressCard,
  onRemoveBookmark,
  onRsvp,
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
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
  rsvpBtn: {
    backgroundColor: colors.saveBtnColor,
    padding: 10,
    borderRadius: 8,
  },
  rsvpText: { fontWeight: "bold", fontSize: 12 },
  emptyText: { marginTop: 10, color: colors.darkGrey, fontSize: 16 },
});
