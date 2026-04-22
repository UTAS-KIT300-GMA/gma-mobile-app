import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NotificationIcon, ProfileIcon } from "../../assets/icons";

/**
 * @summary Reusable app header that renders the title, optional back button, and optional notification and profile icons.
 * @param title - Text displayed in the header. Defaults to "GMA Connect".
 * @param onPressNotifications - Callback when the notifications icon is pressed; defaults to navigating to /notifications.
 * @param onPressProfile - Callback when the profile icon is pressed; defaults to navigating to /(profile).
 * @param onPressBack - Callback when the back button is pressed; defaults to router.back().
 * @param onPressCheckPrimary - Callback for the primary check/action icon shown in selection mode.
 * @param onPressCheckSecondary - Callback for the secondary check/action icon shown in selection mode.
 * @param showBack - When true, renders the back-arrow layout instead of the main layout.
 * @param showNotiAndProfile - When true, renders the notification and profile icon buttons.
 * @param showCheck - When true, renders the check action icons in the header.
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
  const router = useRouter();

  /**
   * @summary Navigates to the profile screen or calls the provided onPressProfile override.
   */
  const handleProfilePress = () => {
    if (onPressProfile) {
      onPressProfile();
    } else {
      router.push("/(profile)" as any);
    }
  };

  /**
   * @summary Navigates to the notifications screen or calls the provided onPressNotifications override.
   */
  const handleNotificationPress = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else {
      router.push("/notifications" as any); // Default to Notifications screen
    }
  };

  /**
   * @summary Navigates back in the navigation stack or calls the provided onPressBack override.
   */
  const handleBackPress = () => {
    if (onPressBack) {
      onPressBack();
    } else {
      router.back();
    }
  };

  /**
   * @summary Invokes the primary check action callback if provided.
   */
  const handleCheckPrimaryPress = () => {
    if (onPressCheckPrimary) {
      onPressCheckPrimary();
    }
  };

  /**
   * @summary Invokes the secondary check action callback if provided.
   */
  const handleCheckSecondaryPress = () => {
    if (onPressCheckSecondary) {
      onPressCheckSecondary();
    }
  };

  // Back Header Layout for subscreens
 if (showBack) {
  return (
    <View style={styles.backContainer}>
      <Pressable
        onPress={handleBackPress}
        style={styles.backButton}
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={28} color={colors.primary} />
      </Pressable>

      <View style={styles.titleWrapper} pointerEvents="none">
        <Text style={styles.backTitle}>{title}</Text>
      </View>

      <View style={styles.backRightPlaceholder} />
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
    height: 90,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  marginTop: 4,
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
  height: 90,
  paddingHorizontal: 16,
  paddingTop: 16,
  backgroundColor: colors.textOnPrimary,
  flexDirection: "row",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: colors.lightGrey,
},

 backButton: {
  width: 40,
  height: 40,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 3,
},
titleWrapper: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},
backTitle: {
  fontSize: 24,
  fontWeight: "700",
  color: colors.primary,
  textAlign: "center",
},
backRightPlaceholder: {
  width: 40,
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
