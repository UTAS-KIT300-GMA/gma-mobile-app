import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { useEvents } from "@/context/EventsContext";
import { EventDoc } from "@/types/type";

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
  const { events: allEvents, isLoading } = useEvents();
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const derivedEvents = useMemo<LearningEvent[]>(() => {
    return allEvents.slice(0, 5).map((e: EventDoc & Record<string, any>) => ({
      id: e.id,
      title: typeof e.title === "string" ? e.title : "Untitled content",
      duration: typeof e.duration === "string" ? e.duration : "Duration unavailable",
      thumbnailUrl: typeof e.thumbnailUrl === "string" ? e.thumbnailUrl : "",
      isBookmarked: typeof e.isBookmarked === "boolean" ? e.isBookmarked : false,
      description: typeof e.description === "string" ? e.description : "No description available yet.",
      videoUrl: typeof e.videoUrl === "string" ? e.videoUrl : "",
      accessType: e.accessType === "subscriber" ? "subscriber" : "free",
    }));
  }, [allEvents]);

  // Keep local state to preserve bookmark toggles within the session.
  // When global events load/refresh, sync the base list.
  useEffect(() => {
    setEvents(derivedEvents);
  }, [derivedEvents]);

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
      loading={isLoading}
      expandedId={expandedId}
      onBookmarkPress={handleBookmarkPress}
      onCardPress={handleCardPress}
    />
  );
}