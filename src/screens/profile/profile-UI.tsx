import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ProfileUIProps = {
  userName: string;
  loading: boolean;
  onLogout: () => void;
  onBack: () => void;
  onNavigate: (path: string) => void;
};

export default function ProfileUI({
  userName,
  loading,
  onLogout,
  onBack,
  onNavigate,
}: ProfileUIProps) {
  // Array defining the navigation options on the profile screen.
  const menuItems = [
    { id: "edit", label: "Edit profile", path: "/edit-profile" },
    {
      id: "interests",
      label: "Update interest",
      path: "/(profile)/edit-interests",
    },
    {
      id: "payment",
      label: "Payment methods",
      path: "/(profile)/payment-methods", 
    },
    
    {
      id: "bookings",
      label: "My bookings",
      path: "/(profile)/booked-events", 
    },

    {
      id: "notifs",
      label: "Notifications setting",
      path: "(profile)/notifications-settings-logic",
    },
    
    {
    id: "membership",
    label: "My membership",
    path: "/(profile)/membership",
    },
    
    { id: "Bookmarked Events",
      label: "Bookmarked events",
       path: "/BookmarkedEvents" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <AppHeader title="Profile" showBack={true} onPressBack={onBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Top Section */}
        <View style={styles.profileTop}>
          <Ionicons
            name="person-circle-outline"
            size={130}
            color={colors.primary}
          />
          {/* Displays the Busy spinner while data is being fetched, otherwise shows name */}
          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{ marginTop: 8 }}
            />
          ) : (
            <Text style={styles.userName}>{userName}</Text>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuRow}
              onPress={() => onNavigate(item.path)}
            >
              <Text style={styles.menuText}>{item.label}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.primary}
              />
            </Pressable>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={onLogout}>
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
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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