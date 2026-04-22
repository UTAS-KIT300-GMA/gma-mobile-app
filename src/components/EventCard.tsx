import { formatDateTime } from "@/components/utils";
import { colors } from "@/theme/ThemeProvider";
import { EventDoc } from "@/types/type";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const RSVP_BOOK = "RSVP/Book";

/**
 * @summary Displays an event's image, title, date/time, address, and action buttons for RSVP and bookmarking.
 * @param event - The event data object to render.
 * @param onPressCard - Callback when the card body is tapped.
 * @param onPressRsvp - Callback when the RSVP/Book button is tapped.
 * @param onPressBookmark - Callback when the bookmark icon is tapped.
 * @param showBookmark - When true, renders the bookmark icon button.
 * @param bookmarked - When true, renders the bookmark as filled/active.
 */
export function EventCard({
  event,
  onPressCard,
  onPressRsvp,
  onPressBookmark,
  showBookmark = false,
  bookmarked = false,
}: {
  key: string
  event: EventDoc;
  onPressCard?: () => void;
  onPressRsvp?: () => void;
  onPressBookmark?: () => void;
  showBookmark?: boolean;
  bookmarked?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPressCard}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <ImageBackground source={{ uri: event.image || "https://via.placeholder.com/400" }} style={styles.image}>
          {/* Image overlay */}
          <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.imageOverlay}
          />

          {/* Bookmark button is conditionally rendered based on the `showBookmark` prop. */}
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
                size={23}
                color={colors.secondary}
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

/* The `EventCard` component is a reusable UI component that displays information about an event. 

- It includes an image background, event title, date/time, address, and buttons for RSVP and bookmarking. 
- The component accepts props for the event data, as well as callback functions for when the card, 
RSVP button, or bookmark button are pressed. 
- It also has options to show the bookmark button and indicate whether the event is bookmarked. */
const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden", // Ensures the image and content are clipped to the card's rounded corners
    backgroundColor: colors.textOnPrimary,
    borderWidth: 1,
    borderColor: colors.textOnPrimary,
    marginBottom: 12,
  },

  image: {
    height: 209,
    width: "100%",
    backgroundColor: colors.lightGrey,
    position: "relative",
    justifyContent: "flex-end",
  },

  // Image overlay and is positioned absolutely
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // The bottom left container holds the event title, date/time, and address, and is positioned absolutely over the image. It has a semi-transparent background to ensure text readability.
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

  title: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  rsvpButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
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
    width: 43,
    height: 39,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.textOnPrimary,
  },
});
