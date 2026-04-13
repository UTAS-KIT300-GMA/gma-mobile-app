import { LearningVideo } from "@/app/(tabs)/learning";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const FALLBACK_THUMBNAIL =
  "https://via.placeholder.com/800x450.png?text=Learning+Video";

export function LearningCard({
  item,
  onPressCard,
  onPressBookmark,
}: {
  item: LearningVideo;
  onPressCard?: () => void;
  onPressBookmark?: () => void;
}) {
  const isSubscriberOnly = item.accessType === "subscriber";

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onPressCard}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <ImageBackground
          source={{ uri: item.thumbnailUrl || FALLBACK_THUMBNAIL }}
          style={styles.image}
          imageStyle={styles.imageInner}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageOverlay}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bookmark learning video"
            onPress={onPressBookmark}
            style={styles.bookmarkButton}
            hitSlop={10}
          >
            <Ionicons
              name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={23}
              color={colors.secondary}
            />
          </Pressable>

          <View style={styles.playButtonWrap}>
            <Ionicons
              name="play-circle"
              size={68}
              color="rgba(255,255,255,0.92)"
            />
          </View>

          <View style={styles.bottomLeft}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title || "Untitled learning"}
            </Text>

            <Text style={styles.meta} numberOfLines={1}>
              {item.duration || "0:00"}
            </Text>
          </View>

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
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
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
  imageInner: {
    borderRadius: 15,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
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
    zIndex: 2,
  },
  playButtonWrap: {
    position: "absolute",
    top: "38%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLeft: {
    position: "absolute",
    left: 8,
    bottom: 6,
    width: "55%",
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
    lineHeight: 21,
  },
  meta: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: "500",
  },
  ctaButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
    backgroundColor: colors.saveBtnColor,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: colors.saveBtnTextColor,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  ctaIcon: {
    marginRight: 6,
  },
});
