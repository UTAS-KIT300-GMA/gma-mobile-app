import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { logoutUser } from "../services/authService";

type ProfileMenuItem = {
  id: string;
  label: string;
  onPress: () => void;
};

function ProfileMenuRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems: ProfileMenuItem[] = [
    {
      id: "edit-profile",
      label: "Edit profile",
      onPress: () => router.push("/edit-profile" ),
    },
    {
      id: "payment-method",
      label: "Manage payment method",
      onPress: () => Alert.alert("Manage payment method", "To be implemented"),
    },
    {
      id: "update-interest",
      label: "Update interest",
      onPress: () => router.push("/profile-setup"),
    },
    {
      id: "saved-events",
      label: "Saved events",
      onPress: () => Alert.alert("Saved events", "To be implemented"),
    },
    {
      id: "notification-settings",
      label: "Notifications setting",
      onPress: () => router.push("/notification-settings"),
    },
    {
      id: "membership",
      label: "My membership",
      onPress: () => Alert.alert("My membership", "To be implemented"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerIconButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </Pressable>

        <Text style={styles.headerTitle}>Profile</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileTop}>
          <Ionicons
            name="person-circle-outline"
            size={130}
            color={colors.primary}
          />
          <Text style={styles.userName}>Steve Smith</Text>
        </View>

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <ProfileMenuRow
              key={item.id}
              label={item.label}
              onPress={item.onPress}
            />
          ))}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#400F32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  headerIconButton: {
    padding: 4,
    borderRadius: 999,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 26,
    paddingBottom: 36,
  },
  profileTop: {
    alignItems: "center",
    marginBottom: 24,
  },
  userName: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  menuList: {
    gap: 10,
    marginBottom: 34,
  },
  menuRow: {
    minHeight: 54,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
  },
  logoutButton: {
    alignSelf: "center",
    width: "62%",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
