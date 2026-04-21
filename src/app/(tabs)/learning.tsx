import { useBookmarks } from "@/context/BookmarksContext";
import { useAuth } from "@/hooks/useAuth";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { db } from "@/services/authService";
import { LearningVideo } from "@/types/type";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { collection, getDocs } from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { Cloudinary } from "@cloudinary/url-gen";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});

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
          const publicId = String(data.cloudinaryPublicId || "");
          
          // 1. Setup the default thumbnail from the database
          let finalThumbnail = String(data.thumbnailUrl || "");

          // 2. If a Public ID exists, overwrite the thumbnail with the Cloudinary generated one
          if (publicId) {
            finalThumbnail = cld.video(publicId)
              .resize(
                thumbnail()
                  .width(800)
                  .gravity(autoGravity()) // Uses AI to find the best frame
              )
              .format("jpg") // Force it to return a static image, not a video
              .quality("auto")
              .toURL();
          }

          return {
            id: doc.id,
            title: String(data.title || "Untitled Content"),
            duration: String(data.duration || "0:00"),
            thumbnailUrl: finalThumbnail, // <-- Uses the Cloudinary generated URL
            description: String(data.description || "No description available."),
            videoUrl: String(data.videoUrl || ""),
            cloudinaryPublicId: publicId, 
            pdfUrl: String(data.pdfUrl || ""),
            accessType: data.accessType === "subscriber" ? "subscriber" : "free",
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

  // Handler for opening PDFs
  const handlePdfPress = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => 
        Alert.alert("Error", "Could not open the PDF resource.")
      );
    }
  };

  return (
    <LearningScreenUI
      events={videos} 
      loading={isLoading || isBookmarksLoading}
      expandedId={expandedId}
      onBookmarkPress={handleBookmarkPress}
      onCardPress={handleCardPress}
      onPdfPress={handlePdfPress}
    />
  );
}