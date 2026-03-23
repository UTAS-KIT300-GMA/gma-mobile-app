import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NotificationIcon, ProfileIcon } from "../../assets/icons";

/* The `AppHeader` component is a reusable header component that can be used across different screens in the app. It accepts several props to customize its appearance and functionality:
- `title`: The title text displayed in the header (default is "GMA Connect").
- `showBack`: A boolean that determines whether to show a back button on the left side of the header.
- `showNotiAndProfile`: A boolean that determines whether to show notification and profile icons on the right side of the header.
- `showCheck`: A boolean that determines whether to show checkmark icons on the right side of the header.

The component uses conditional rendering to display different elements based on the props passed in. It also utilizes the `Ionicons` library for consistent and visually appealing icons. The styles are defined using `StyleSheet` for better performance and maintainability. */

export function AppHeader({
  title = "GMA Connect",
  showBack = false,
  showNotiAndProfile = false,
  showCheck = false,
}: {
  title?: string;
  showBack?: boolean;
  showNotiAndProfile?: boolean;
  showCheck?: boolean;
}) {
  // Back Header Layout for subscreens
  if (showBack) {
    return (
      <View style={styles.backContainer}>
        {/* LEFT: Back button */}
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={32} color={colors.primary} />
        </Pressable>

        {/* CENTER: Title */}
        <Text style={styles.backTitle}>{title}</Text>

        {/* RIGHT */}
        {showCheck ? (
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIconButton} hitSlop={10}>
              <Ionicons
                name="square-outline"
                size={24}
                color={colors.primary}
              />
            </Pressable>
            <Pressable style={styles.headerIconButton} hitSlop={10}>
              <Ionicons
                name="checkmark-done-outline"
                size={24}
                color={colors.primary}
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.backRightPlaceholder} />
        )}
      </View>
    );
  }

  // Main Screens Header Layout
  return (
    <View style={styles.mainContainer}>
      <Text style={styles.mainTitle}>{title}</Text>

      {showNotiAndProfile && (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push({ pathname: "/notifications" })}
            style={styles.iconButton}
            hitSlop={10}
          >
            <NotificationIcon width={26} height={26} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => router.push({ pathname: "/profile" })}
            style={styles.iconButton}
            hitSlop={10}
          >
            <ProfileIcon width={26} height={26} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main Header styles
  mainContainer: {
    height: 84,
    paddingHorizontal: 16,
    paddingTop: 5,
    backgroundColor: colors.textOnPrimary,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },

  mainTitle: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  backContainer: {
    height: 72,
    paddingHorizontal: 16,
    backgroundColor: colors.textOnPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },

  backLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
  },

  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },

  // Back Header styles
  backButton: {
    position: "absolute",
    left: 16,
    top: 0,
    bottom: 0,
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    zIndex: 2,
  },

  backTitle: {
    position: "absolute", 
    left: 0,
    right: 0,

    color: colors.primary,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0.2,
    textAlign: "center",

    pointerEvents: "none", // Ensure title doesn't block button presses
  },

  backRightPlaceholder: {
    position: "absolute",
    right: 16,
    width: 34,
    height: 34,
  },

  headerActions: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    zIndex: 2,
  },

  headerIconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
});
