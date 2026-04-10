import {
  collection,
  getDocs,
  limit,
  query,
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { db } from "@/services/authService";
import { LearningScreenUI } from "@/screens/learning/learning-UI";

export interface LearningEvent {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  isBookmarked: boolean;
  description?: string;
  videoUrl?: string;
  accessType?: "free" | "subscriber";
}

export default function LearningRoute() {
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, limit(5));

        const snap: FirebaseFirestoreTypes.QuerySnapshot = await getDocs(q);

        const data: LearningEvent[] = snap.docs.map(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const raw = doc.data();

            return {
              id: doc.id,
              title:
                typeof raw.title === "string" ? raw.title : "Untitled content",
              duration:
                typeof raw.duration === "string"
                  ? raw.duration
                  : "Duration unavailable",
              thumbnailUrl:
                typeof raw.thumbnailUrl === "string" ? raw.thumbnailUrl : "",
              isBookmarked:
                typeof raw.isBookmarked === "boolean"
                  ? raw.isBookmarked
                  : false,
              description:
                typeof raw.description === "string"
                  ? raw.description
                  : "No description available yet.",
              videoUrl:
                typeof raw.videoUrl === "string" ? raw.videoUrl : "",
              accessType:
                raw.accessType === "subscriber" ? "subscriber" : "free",
            };
          }
        );

        setEvents(data);
      } catch (e) {
        console.error("Firestore Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleBookmarkPress = (id: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((item) =>
        item.id === id
          ? { ...item, isBookmarked: !item.isBookmarked }
          : item
      )
    );
  };

  const handleCardPress = (item: LearningEvent) => {
    if (item.accessType === "subscriber") {
      Alert.alert(
        "Subscribers Only",
        "This event is available to subscribed members only."
      );
      return;
    }

    setExpandedId((prev) => (prev === item.id ? null : item.id));
  };

  return (
    <LearningScreenUI
      events={events}
      loading={loading}
      expandedId={expandedId}
      onBookmarkPress={handleBookmarkPress}
      onCardPress={handleCardPress}
    />
  );
}