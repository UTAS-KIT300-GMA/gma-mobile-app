import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/ThemeProvider";

export function AppHeader({
  title = "GMA Connect",
  onPressNotifications,
  onPressProfile,
}: {
  title?: string;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={onPressNotifications}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="notifications-outline" size={22} color="#ffffff" />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={onPressProfile}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="person-circle-outline" size={24} color="#ffffff" />
        </Pressable>
      </View>
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
});
