import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NotificationIcon, ProfileIcon } from "../../assets/icons";

/* The `AppHeader` component is a reusable header component that can be used across different 
screens in the app. It accepts several props to customize its appearance and functionality:

- `title`: The title text displayed in the center of the header. Defaults to "GMA Connect".
- `onPressNotifications`: A callback function that is called when the notifications icon is pressed. If not provided, it defaults to navigating to the "/notifications" screen.
- `onPressProfile`: A callback function that is called when the profile icon is pressed. If not provided, it defaults to navigating to the "/(profile)" screen.
- `onPressBack`: A callback function that is called when the back button is pressed. If not provided, it defaults to navigating back in the navigation stack.
- `showBack`: A boolean that determines whether to show the back button on the left side of the header. Defaults to false.
- `showNotiAndProfile`: A boolean that determines whether to show the notification and profile icons on the right side of the header. Defaults to true.

The component uses React Native's `View`, `Text`, and `Pressable` components for layout and interactivity, and it utilises the `Ionicons` library for icons. The styles are defined using
*/

export function AppHeader({
  title = "GMA Connect",
  onPressNotifications,
  onPressProfile,
  onPressBack,
  onPressCheckPrimary,
  onPressCheckSecondary,
  showBack = false,
  showNotiAndProfile = true,
  showCheck = false,
}: {
  title?: string;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  onPressBack?: () => void;
  onPressCheckPrimary?: () => void;
  onPressCheckSecondary?: () => void;
  showBack?: boolean;
  showNotiAndProfile?: boolean;
  showCheck?: boolean;
}) {
  // Stores the navigation tool in the router var for internal redirects.
  const router = useRouter();

  // Stores function instructions in  handleProfilePress var.
  const handleProfilePress = () => {
    if (onPressProfile) {
      onPressProfile();
    } else {
      router.push("/(profile)" as any);
    }
  };

  // Stores function instructions in handleNotificationPress var.
  const handleNotificationPress = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else {
      router.push("/notifications" as any); // Default to Notifications screen
    }
  };

  // Stores function instructions in the handleBackPress var.
  const handleBackPress = () => {
    if (onPressBack) {
      onPressBack();
    } else {
      router.back();
    }
  };

  const handleCheckPrimaryPress = () => {
    if (onPressCheckPrimary) {
      onPressCheckPrimary();
    } // Need to implement primary action to chosen notifications as read in notifications screen
  };

  const handleCheckSecondaryPress = () => {
    if (onPressCheckSecondary) {
      onPressCheckSecondary();
    } // Need to implement secondary action to clear mark all unread in notifications screen as read
  };

  // Back Header Layout for subscreens
  if (showBack) {
    return (
      <View style={styles.backContainer}>
        <Pressable
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={32} color={colors.primary} />
        </Pressable>

        <Text pointerEvents="none" style={styles.backTitle}>
          {title}
        </Text>

        {showCheck ? (
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerIconButton}
              hitSlop={10}
              onPress={handleCheckPrimaryPress}
              accessibilityRole="button"
              accessibilityLabel="Primary action"
            >
              <Ionicons
                name="square-outline"
                size={24}
                color={colors.primary}
              />
            </Pressable>

            <Pressable
              style={styles.headerIconButton}
              hitSlop={10}
              onPress={handleCheckSecondaryPress}
              accessibilityRole="button"
              accessibilityLabel="Secondary action"
            >
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

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.mainTitle}>{title}</Text>

      {showNotiAndProfile && (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={handleNotificationPress}
            style={styles.iconButton}
            hitSlop={10}
          >
            <NotificationIcon width={24} height={24} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={handleProfilePress}
            style={styles.iconButton}
            hitSlop={10}
          >
            <ProfileIcon width={24} height={24} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main header layout for home screen and main subscreens without back button
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
    marginLeft: 4,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: "auto",
  },

  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },

  // Back header layout for subscreens with back button and optional check icons for actions like marking notifications as read or clearing notifications
  backContainer: {
    height: 84,
    paddingHorizontal: 16,
    paddingTop: 5,
    backgroundColor: colors.textOnPrimary,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },

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
    top: 0,
    bottom: 0,
    textAlignVertical: "center",
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.2,
    textAlign: "center",
    includeFontPadding: false,
  },

  backRightPlaceholder: {
    position: "absolute",
    right: 16,
    top: 5,
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
