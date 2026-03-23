import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
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
  container: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconButton: {
    padding: 6,
    borderRadius: 999,
  },
  placeholder: {
    width: 36,
  },
});