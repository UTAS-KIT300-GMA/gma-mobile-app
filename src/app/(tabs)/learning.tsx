import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { useBookmarks } from "@/context/BookmarksContext";
import { useAuth } from "@/hooks/useAuth"; 
import { db } from "@/services/authService";
import { collection, getDocs } from "@react-native-firebase/firestore";
import { LearningVideo } from "@/types/type";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export default function LearningRoute() {
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { bookmarkedIds, toggleBookmark, isLoading: isBookmarksLoading } = useBookmarks();
  const { user } = useAuth(); 

  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        // Fetching from the 'learningVideos' collection
        const querySnapshot = await getDocs(collection(db, "learningVideos"));
        
        const mappedVideos = querySnapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: String(data.title || "Untitled Content"),
            duration: String(data.duration || "0:00"),
            thumbnailUrl: String(data.thumbnailUrl || ""), 
            description: String(data.description || "No description available."),
            videoUrl: String(data.videoUrl || ""),
            cloudinaryPublicId: String(data.cloudinaryPublicId || ""), 
            accessType: data.accessType === "subscriber" ? "subscriber" : "free",
            // Syncing bookmark status with global context
            isBookmarked: !!bookmarkedIds[doc.id],
          } as LearningVideo; 
        });

        setVideos(mappedVideos);
      } catch (error) {
        console.error("Error loading learningVideos:", error);
        Alert.alert("Error", "Failed to sync with learning database.");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [bookmarkedIds]);

  const isSubscriber = false; // Placeholder for membership logic

  const handleBookmarkPress = async (id: string) => {
    const originalVideo = videos.find(v => v.id === id);
    if (originalVideo) {
      try {
        await toggleBookmark(originalVideo as any);
      } catch (error) {
        Alert.alert("Error", "Could not update bookmark.");
      }
    }
  };

  const handleCardPress = (item: LearningVideo) => {
    const hasAccess = item.accessType === "free" || isSubscriber;
    if (!hasAccess) {
      Alert.alert("Subscribers Only", "This course is available to subscribed members only.");
      return;
    }
    // Toggle video expansion
    setExpandedId((prev) => (prev === item.id ? null : item.id));
  };

  return (
    <LearningScreenUI
      events={videos} 
      loading={isLoading || isBookmarksLoading}
      expandedId={expandedId}
      onBookmarkPress={handleBookmarkPress}
      onCardPress={handleCardPress}
    />
  );
}