import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/ThemeProvider";
import {AppHeader} from "@/src/components/AppHeader";

type NotificationType = "recommendation" | "reminder" | "booking";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read?: boolean;
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
    read: true,
  },
  {
    id: "3",
    type: "booking",
    title: "Booking confirmation",
    message: "Your booking is confirmed",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "booking",
    title: "Booking confirmation",
    message: "Your booking is confirmed",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "5",
    type: "recommendation",
    title: "Event recommendation",
    message: "New networking event recommended for you",
    time: "2 min ago",
    read: false,
  },
];

function NotificationCard({
  item,
}: {
  item: NotificationItem;
}) {
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
      style={[
        styles.card,
        isRecommendation ? styles.recommendationCard : styles.defaultCard,
      ]}
    >
      <View style={styles.cardIconWrap}>
        <Ionicons
          name={iconName}
          size={28}
          color={isRecommendation ? colors.textOnSecondary : colors.primary}
        />
      </View>

      <View style={styles.cardTextWrap}>
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

        <Text
          style={[
            styles.cardMessage,
            isRecommendation
              ? styles.recommendationText
              : styles.defaultText,
          ]}
        >
          {item.message}
        </Text>

        <Text
          style={[
            styles.cardTime,
            isRecommendation
              ? styles.recommendationText
              : styles.defaultText,
          ]}
        >
          {item.time}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Notifications" showBack showCheck/>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <NotificationCard item={item} />}
      />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 28,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginBottom: 14,
  },
  recommendationCard: {
    backgroundColor: colors.saveBtnColor,
  },
  defaultCard: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
    elevation: 3,
  },
  cardIconWrap: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
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
  },
  recommendationText: {
    color: colors.textOnSecondary,
  },
  defaultText: {
    color: colors.primary,
  },
  cardTime: {
    fontSize: 16,
  },
});