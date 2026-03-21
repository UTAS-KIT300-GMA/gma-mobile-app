import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {router} from "expo-router";

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
  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      {showBack ? (
        <Pressable onPress={() => router.back()} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={26} color="#ffffff" />
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      {/* TITLE */}
      <Text style={styles.title}>{title}</Text>

      {/* RIGHT SIDE */}
      {showNotiAndProfile && (
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push({
            pathname: "/notifications",
          })}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="notifications-outline" size={22} color="#ffffff" />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={() => router.push({
            pathname: "/profile"
          })}
          style={styles.iconButton}
          hitSlop={10}
        >
          <Ionicons name="person-circle-outline" size={24} color="#ffffff" />
        </Pressable>
      </View>)}

      {showCheck && (
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIconButton} hitSlop={10}>
              <Ionicons
                  name="square-outline"
                  size={22}
                  color={colors.textOnPrimary}
              />
            </Pressable>
            <Pressable style={styles.headerIconButton} hitSlop={10}>
              <Ionicons
                  name="checkmark-done-outline"
                  size={24}
                  color={colors.textOnPrimary}
              />
            </Pressable>
          </View>)}

      {!showNotiAndProfile && !showCheck && <View style={styles.placeholder} />}
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    padding: 4,
    borderRadius: 999,
  },
});
