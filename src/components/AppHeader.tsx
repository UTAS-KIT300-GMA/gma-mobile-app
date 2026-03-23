import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router"; 

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

  return (
    <View style={styles.container}>
      {/* LEFT SIDE: Back Button */}
      {showBack ? (
        <Pressable onPress={handleBackPress} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* CENTER: Title */}
      <Text style={styles.title}>{title}</Text>

      {/* RIGHT SIDE: Notification & Profile */}
      {showActions ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={handleNotificationPress}
            style={styles.iconButton}
            hitSlop={10}
          >
            <Ionicons name="notifications-outline" size={22} color="#ffffff" />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={handleProfilePress}
            style={styles.iconButton}
            hitSlop={10}
          >
            <Ionicons name="person-circle-outline" size={24} color="#ffffff" />
          </Pressable>
        </View>
      ) : (
        <View style={styles.placeholder} />
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
});
