import { Ionicons } from "@expo/vector-icons";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc} from "@/app/(tabs)/type";
import { formatDateTime } from "@/components/utils"

const RSVP_BOOK = "RSVP/Book";

export function EventCard({
  event, onPressCard,
  onPressRsvp,
  onPressBookmark,
  showBookmark = false,
  bookmarked = false,
}: {
  event: EventDoc;
  onPressCard?: () => void;
  onPressRsvp?: () => void;
  onPressBookmark?: () => void;
  showBookmark?: boolean;
  bookmarked?: boolean;
}) {
  console.log("EventCard", event.dateTime);
  return (
    <View style={styles.card}>
      <Pressable onPress={onPressCard} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        <ImageBackground source={{ uri: event.image }} style={styles.image}>
          <View style={styles.textOverlay} />

          {showBookmark && (
              <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Bookmark"
                  onPress={onPressBookmark}
                  style={styles.bookmarkButton}
                  hitSlop={10}
              >
                <Ionicons
                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={colors.saveBtnColor}
                />
              </Pressable>
          )}

          <View style={styles.bottomLeft}>
            <Text style={styles.title} numberOfLines={1}>
              {event.title ?? "Untitled event"}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {formatDateTime(event.dateTime)}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {event.address ?? ""}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="RSVP"
            onPress={onPressRsvp}
            style={styles.rsvpButton}
            hitSlop={10}
          >
            <Text style={styles.rsvpText}>{RSVP_BOOK}</Text>
          </Pressable>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 14,
  },
  image: {
    height: 200,
    backgroundColor: "#d9d9d9",
    position: "relative",
    justifyContent: "flex-end",
  },
  bottomLeft: {
    position: "absolute",
    left: 8,
    bottom: 6,
    right: 88,
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 2,
  },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  title: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  meta: {
    color: "#ffffff",
    fontSize: 12,
    opacity: 0.95,
  },
  rsvpButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  rsvpText: {
    color: colors.saveBtnTextColor,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  bookmarkButton: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
