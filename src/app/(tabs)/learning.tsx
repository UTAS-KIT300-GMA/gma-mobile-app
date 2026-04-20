import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { useBookmarks, useEvents } from "@/context/GlobalContext";
import { useAuth } from "@/hooks/useAuth"; // Assuming you have membership data in useAuth
import { EventDoc } from "@/types/type";

export interface LearningVideo {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  isBookmarked: boolean;
  description: string;
  videoUrl: string;
  accessType: "free" | "subscriber";
}

export default function LearningRoute() {
  // 1. Consume Global Contexts
  const { events: allEvents, isLoading: isEventsLoading } = useEvents();
  const { bookmarkedIds, toggleBookmark, isLoading: isBookmarksLoading } = useBookmarks();
  const { user } = useAuth(); // Used for membership check

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 2. Logic to determine membership (adjust 'subscriber' logic as per your Firestore user schema)
  // Update to this when membership feature implemented
  // const isSubscriber = user?.membership === "subscriber";
  const isSubscriber = false // Temporary set to False

  // 3. Process and Filter Events specifically for the Learning UI
  const learningVideos = useMemo<LearningVideo[]>(() => {
    // Note: You might want to filter allEvents by a category like 'learning'
    // if your EventsContext contains mixed types.
    return allEvents.map((e: EventDoc & Record<string, any>) => ({
      id: e.id,
      title: e.title || "Untitled Content",
      duration: e.duration || "0:00",
      thumbnailUrl: e.thumbnailUrl || "",
      description: e.description || "No description available.",
      videoUrl: e.videoUrl || "",
      accessType: e.accessType === "subscriber" ? "subscriber" : "free",
      // Derive bookmark status from the global BookmarksContext
      isBookmarked: !!bookmarkedIds[e.id],
    }));
  }, [allEvents, bookmarkedIds]);

  // 4. Handle Persistent Bookmarking
  const handleBookmarkPress = async (id: string) => {
    const originalEvent = allEvents.find(e => e.id === id);
    if (originalEvent) {
      try {
        await toggleBookmark(originalEvent);
      } catch (error) {
        Alert.alert("Error", "Could not update bookmark.");
      }
    }
  };


  // 5. Handle Access Control and Expansion
  const handleCardPress = (item: LearningVideo) => {
    const hasAccess = item.accessType === "free" || isSubscriber;

    if (!hasAccess) {
      Alert.alert(
          "Subscribers Only",
          "This course is available to subscribed members only."
      );
      return;
    }

    setExpandedId((prev) => (prev === item.id ? null : item.id));
  };

  return (
      <LearningScreenUI
          events={learningVideos}
          loading={isEventsLoading || isBookmarksLoading}
          expandedId={expandedId}
          onBookmarkPress={handleBookmarkPress}
          onCardPress={handleCardPress}
      />
  );
}