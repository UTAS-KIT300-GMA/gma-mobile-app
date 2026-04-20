import React, { useMemo, useState, useEffect } from "react";
import { Alert, ActivityIndicator } from "react-native";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { useBookmarks } from "@/context/BookmarksContext";
import { useAuth } from "@/hooks/useAuth"; 
import { db } from "@/services/authService";
import { collection, getDocs } from "@react-native-firebase/firestore";
import { LearningVideo } from "@/types/type";
// 1. Added explicit type import for Firestore snapshots
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

/**
 * CORE INTERFACE
 * Ensure cloudinaryPublicId is included so the SDK can generate the stream.
 */

export default function LearningRoute() {
  // 1. Local State for Learning Content
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 2. Consume Global Contexts
  const { bookmarkedIds, toggleBookmark, isLoading: isBookmarksLoading } = useBookmarks();
  const { user } = useAuth(); // Used for membership check

  // 3. Fetch data directly from 'learningVideos' collection
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        // Pointing to the correct collection name identified
        const querySnapshot = await getDocs(collection(db, "learningVideos"));
        
        // Explicitly typed 'doc' to remove the "Implicit Any" error
        const mappedVideos = querySnapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: String(data.title || "Untitled Content"),
            duration: String(data.duration || "0:00"),
            thumbnailUrl: String(data.thumbnailUrl || ""), // Forced to string to satisfy type 'string'
            description: String(data.description || "No description available."),
            videoUrl: String(data.videoUrl || ""),
            // Mapping the Cloudinary ID from Firestore to the state
            cloudinaryPublicId: String(data.cloudinaryPublicId || ""), 
            accessType: data.accessType === "subscriber" ? "subscriber" : "free",
            // Derive bookmark status from the global BookmarksContext
            isBookmarked: !!bookmarkedIds[doc.id],
          } as LearningVideo; // Type assertion ensures compatibility with global interface
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

  // 4. Logic to determine membership (adjust 'subscriber' logic as per your Firestore user schema)
  // Update to this when membership feature implemented
  // const isSubscriber = user?.membership === "subscriber";
  const isSubscriber = false; // Temporary set to False

  // 5. Handle Persistent Bookmarking
  const handleBookmarkPress = async (id: string) => {
    const originalVideo = videos.find(v => v.id === id);
    if (originalVideo) {
      try {
        // Casting to any or specific EventDoc if required by toggleBookmark
        await toggleBookmark(originalVideo as any);
      } catch (error) {
        Alert.alert("Error", "Could not update bookmark.");
      }
    }
  };

  // 6. Handle Access Control and Expansion
  const handleCardPress = (item: LearningVideo) => {
    const hasAccess = item.accessType === "free" || isSubscriber;

    if (!hasAccess) {
      Alert.alert(
          "Subscribers Only",
          "This course is available to subscribed members only."
      );
      return;
    }

    // This triggers the layout switch to the VideoPlayer
    setExpandedId((prev) => (prev === item.id ? null : item.id));
  };

  return (
      <LearningScreenUI
          events={videos} // Passing our mapped learningVideos
          loading={isLoading || isBookmarksLoading}
          expandedId={expandedId}
          onBookmarkPress={handleBookmarkPress}
          onCardPress={handleCardPress}
      />
  );
}