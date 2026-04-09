import { AppHeader } from "@/components/AppHeader";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationType = "recommendation" | "reminder" | "booking";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "recommendation",
    title: "Event recommendation",
    message: "New networking event recommended for you",
    time: "2 min ago",
    read: false,
  },
  {
    id: "2",
    type: "reminder",
    title: "Event reminder",
    message: "Your booked event is tomorrow",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "booking",
    title: "Booking confirmation",
    message: "Your booking for Career Workshop is confirmed",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "booking",
    title: "Booking update",
    message: "Your seat has been upgraded for Startup Meetup",
    time: "5 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "recommendation",
    title: "Event recommendation",
    message: "A volunteering event near you may interest you",
    time: "Yesterday",
    read: false,
  },
  {
    id: "6",
    type: "reminder",
    title: "Event reminder",
    message: "Your language exchange session starts in 2 hours",
    time: "Yesterday",
    read: true,
  },
  {
    id: "7",
    type: "booking",
    title: "Booking confirmation",
    message: "You have successfully booked Women in Tech Panel",
    time: "2 days ago",
    read: true,
  },
  {
    id: "8",
    type: "recommendation",
    title: "Event recommendation",
    message: "New business analytics workshop recommended for you",
    time: "2 days ago",
    read: false,
  },
  {
    id: "9",
    type: "reminder",
    title: "Event reminder",
    message: "Your mentoring session is tomorrow at 3:00 PM",
    time: "3 days ago",
    read: false,
  },
  {
    id: "10",
    type: "booking",
    title: "Booking confirmation",
    message: "Your registration for Community BBQ is confirmed",
    time: "4 days ago",
    read: true,
  },
  {
    id: "11",
    type: "recommendation",
    title: "Event recommendation",
    message: "You may like this migrant networking breakfast",
    time: "5 days ago",
    read: false,
  },
  {
    id: "12",
    type: "reminder",
    title: "Event reminder",
    message: "Your booked workshop starts in 30 minutes",
    time: "6 days ago",
    read: true,
  },
];

type NotificationCardProps = {
  item: NotificationItem;
  selectionMode: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function NotificationCard({
  item,
  selectionMode,
  selected,
  onPress,
  onLongPress,
}: NotificationCardProps) {
  const isRecommendation = item.type === "recommendation";

  const iconName = useMemo(() => {
    switch (item.type) {
      case "recommendation":
        return "notifications-outline";
      case "reminder":
        return "calendar-outline";
      case "booking":
        return "ticket-outline";
      default:
        return "notifications-outline";
    }
  }, [item.type]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        isRecommendation ? styles.recommendationCard : styles.defaultCard,
        !item.read && styles.unreadCard,
        selected && styles.selectedCard,
      ]}
    >
      <View style={styles.cardLeft}>
        {selectionMode ? (
          <View style={styles.selectionIconWrap}>
            <Ionicons
              name={selected ? "checkbox" : "square-outline"}
              size={24}
              color={colors.primary}
            />
          </View>
        ) : (
          <View style={styles.cardIconWrap}>
            <Ionicons
              name={iconName}
              size={26}
              color={isRecommendation ? colors.textOnSecondary : colors.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.cardTextWrap}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.cardTitle,
              isRecommendation
                ? styles.recommendationTitle
                : styles.defaultTitle,
            ]}
          >
            {item.title}
          </Text>

          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <Text
          style={[
            styles.cardMessage,
            isRecommendation ? styles.recommendationText : styles.defaultText,
          ]}
        >
          {item.message}
        </Text>

        <Text
          style={[
            styles.cardTime,
            isRecommendation ? styles.recommendationText : styles.defaultText,
          ]}
        >
          {item.time}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const handleCardPress = (item: NotificationItem) => {
    if (selectionMode) {
      toggleSelected(item.id);
      return;
    }

    if (!item.read) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === item.id
            ? { ...notification, read: true }
            : notification,
        ),
      );
    }

    Alert.alert(item.title, item.message);
  };

  const handleCardLongPress = (item: NotificationItem) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds([item.id]);
      return;
    }

    toggleSelected(item.id);
  };

  const handleSelectModeToggle = () => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedIds([]);
    } else {
      setSelectionMode(true);
    }
  };

  const handleMarkSelectedAsRead = () => {
    if (selectedIds.length === 0) {
      Alert.alert(
        "No notifications selected",
        "Please select notifications first.",
      );
      return;
    }

    setNotifications((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, read: true } : item,
      ),
    );

    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      })),
    );

    setSelectedIds([]);
    setSelectionMode(false);
  };

  const headerTitle = selectionMode
    ? `${selectedIds.length} selected`
    : "Notifications";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppHeader
        title={headerTitle}
        showBack={true}
        showCheck={true}
        onPressCheckPrimary={handleSelectModeToggle}
        onPressCheckSecondary={
          selectionMode ? handleMarkSelectedAsRead : handleMarkAllAsRead
        }
      />

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </Text>
        {selectionMode ? (
          <Pressable onPress={() => setSelectionMode(false)}>
            <Text style={styles.summaryAction}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotificationCard
            item={item}
            selectionMode={selectionMode}
            selected={selectedIds.includes(item.id)}
            onPress={() => handleCardPress(item)}
            onLongPress={() => handleCardLongPress(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name="notifications-off-outline"
              size={42}
              color={colors.darkGrey}
            />
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>
              When new updates arrive, they will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },

  summaryBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    backgroundColor: "#FFF9F1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },

  summaryAction: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },

  listContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 32,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },

  recommendationCard: {
    backgroundColor: colors.saveBtnColor,
  },

  defaultCard: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  unreadCard: {
    borderColor: "#F1CB5F",
  },

  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  cardLeft: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardIconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  selectionIconWrap: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTextWrap: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.secondary,
    marginLeft: 8,
  },

  cardTitle: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: "700",
  },

  recommendationTitle: {
    color: colors.textOnSecondary,
  },

  defaultTitle: {
    color: colors.primary,
  },

  cardMessage: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },

  recommendationText: {
    color: colors.textOnSecondary,
  },

  defaultText: {
    color: colors.primary,
  },

  cardTime: {
    fontSize: 15,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: colors.darkGrey,
  },
});
