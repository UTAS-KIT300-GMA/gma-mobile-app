import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { useUserNotificationSettings } from "@/hooks/useUserNotificationSettings";
import { db } from "@/services/authService";
import { colors } from "@/theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  kind: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: Record<string, string>;
};

/** Partner / admin portal kinds — member app inbox does not show these. */
const MEMBER_APP_EXCLUDED_KINDS = new Set([
  "partner_approval_result",
  "event_submitted_for_review",
  "event_approval_result",
]);

function isVisibleInMemberInbox(
  kind: string,
  specialOffersEnabled: boolean,
): boolean {
  if (!kind) return true;
  if (MEMBER_APP_EXCLUDED_KINDS.has(kind)) return false;
  if (kind === "event_recommended" && !specialOffersEnabled) return false;
  return true;
}

function kindToDisplayType(kind: string | undefined): NotificationType {
  switch (kind) {
    case "event_recommended":
      return "recommendation";
    case "event_cancelled":
      return "booking";
    case "event_date_changed":
      return "reminder";
    default:
      return "reminder";
  }
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function formatNotificationTime(createdAt: unknown): string {
  const date = toDate(createdAt);
  if (!date) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 1) return "Just now";
  if (diffM < 60) return `${diffM} min ago`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH} hour${diffH === 1 ? "" : "s"} ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD} day${diffD === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function mapDocToItem(
  id: string,
  data: Record<string, unknown>,
): NotificationItem {
  const kind = typeof data.kind === "string" ? data.kind : "";
  const title = typeof data.title === "string" ? data.title : "";
  const body = typeof data.body === "string" ? data.body : "";
  const read = Boolean(data.read);
  const rawData = data.data;
  const dataObj =
    rawData && typeof rawData === "object" && !Array.isArray(rawData)
      ? (rawData as Record<string, string>)
      : undefined;

  return {
    id,
    kind,
    type: kindToDisplayType(kind),
    title,
    message: body,
    time: formatNotificationTime(data.createdAt),
    read,
    data: dataObj,
  };
}

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

const NOTIFICATIONS_PAGE_SIZE = 50;

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { settings: notifSettings } = useUserNotificationSettings();
  const router = useRouter();
  const uid = user?.uid;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setListLoading(false);
      return;
    }

    setListLoading(true);
    const notifQuery = query(
      collection(db, "users", uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(NOTIFICATIONS_PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(
      notifQuery,
      (snap) => {
        const specialOn = notifSettings.specialOffers === true;
        const rows: NotificationItem[] = snap.docs
          .map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const raw = d.data() as Record<string, unknown>;
            const kind = typeof raw.kind === "string" ? raw.kind : "";
            if (!isVisibleInMemberInbox(kind, specialOn)) return null;
            return mapDocToItem(d.id, raw);
          })
          .filter(
            (row: NotificationItem | null): row is NotificationItem =>
              row !== null,
          );
        setNotifications(rows);
        setListLoading(false);
      },
      () => {
        setListLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid, notifSettings.specialOffers]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const markReadOnServer = useCallback(
    async (ids: string[]) => {
      if (!uid || ids.length === 0) return;
      try {
        const batch = writeBatch(db);
        for (const id of ids) {
          batch.update(doc(db, "users", uid, "notifications", id), {
            read: true,
            readAt: serverTimestamp(),
          });
        }
        await batch.commit();
      } catch (e) {
        console.warn("[notifications] mark read failed:", e);
        Alert.alert("Error", "Could not update notifications. Try again.");
      }
    },
    [uid],
  );

  const handleCardPress = async (item: NotificationItem) => {
    if (selectionMode) {
      toggleSelected(item.id);
      return;
    }

    if (!uid) return;

    if (!item.read) {
      await markReadOnServer([item.id]);
    }

    const eventId =
      item.data && typeof item.data.eventId === "string"
        ? item.data.eventId
        : undefined;
    if (eventId) {
      router.push({
        pathname: "/event/event-details",
        params: { id: eventId },
      } as any);
      return;
    }

    Alert.alert(item.title, item.message || "No details.");
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

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.length === 0) {
      Alert.alert(
        "No notifications selected",
        "Please select notifications first.",
      );
      return;
    }

    await markReadOnServer(selectedIds);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) {
      setSelectionMode(false);
      setSelectedIds([]);
      return;
    }
    await markReadOnServer(unreadIds);
    setSelectedIds([]);
    setSelectionMode(false);
  };

  const headerTitle = selectionMode
    ? `${selectedIds.length} selected`
    : "Notifications";

  if (!uid) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppHeader title="Notifications" showBack />
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptyText}>
            Sign in to see notifications from your account.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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

      {listLoading && notifications.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
              onPress={() => void handleCardPress(item)}
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.textOnPrimary,
  },

  loadingWrap: {
    flex: 1,
    paddingTop: 48,
    alignItems: "center",
  },

  centered: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
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
    flexGrow: 1,
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
