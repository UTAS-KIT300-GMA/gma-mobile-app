import { useBookmarks } from "@/context/GlobalContext";
import { useAuth } from "@/hooks/useAuth";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { db } from "@/services/authService";
import { LearningDoc } from "@/types/type";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { collection, getDocs } from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";

export default function LearningRoute() {
  const [videos, setVideos] = useState<LearningDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { bookmarkedIds, toggleBookmark, isLoading: isBookmarksLoading } =
    useBookmarks();
  const { user } = useAuth();

  useEffect(() => {
    /**
   * @summary Synchronizes the component state with Firestore learning content and local bookmark status.
   */
    const loadContent = async () => {
      try {
        setIsLoading(true);

        // Fetch Firestore learning videos
        const querySnapshot = await getDocs(collection(db, "learningVideos"));

        const mappedVideos = querySnapshot.docs.map(
          (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = doc.data();

            // Cloudinary public ID for video/image assets
            const publicId = String(data.cloudinaryPublicId || "");

            let finalThumbnail = "";

            // Use stored thumbnail if available
            if (data.thumbnailUrl?.trim()) {
              finalThumbnail = data.thumbnailUrl.trim();

              // Otherwise generate Cloudinary video thumbnail
            } else if (publicId) {
              finalThumbnail = `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}.jpg`;
            }

            
            return {
              id: doc.id,
              title: String(data.title || "Untitled Content"),
              duration: String(data.duration || "0:00"),

              // Final resolved thumbnail used by UI
              thumbnailUrl: finalThumbnail,

              description: String(
                data.description || "No description available."
              ),

              videoId: String(data.videoId || ""),
              cloudinaryPublicId: publicId,

              // Used later for file downloads
              fileId: String(data.fileId || ""),

              accessType:
                data.accessType ?? "free",

              // Bookmark state synced from context
              isBookmarked: !!bookmarkedIds[doc.id],
            } as LearningDoc;
          }
        );

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

  //  Placeholder subscription logic
  const isSubscriber = false;

  /**
   * @summary Toggles the bookmark status for a specific video asset.
   * @param id - The unique Firestore document ID of the video to be bookmarked or removed.
   */
  const handleBookmarkPress = async (id: string) => {
    const originalVideo = videos.find((v) => v.id === id);
    if (originalVideo) {
      try {
        await toggleBookmark(originalVideo as any);
      } catch (error) {
        Alert.alert("Error", "Could not update bookmark.");
      }
    }
  };

  /**
   * @summary Manages UI expansion state and enforces subscription-based access control.
   * @param item - The full LearningDoc object containing accessType and ID.
   */
  const handleCardPress = (item: LearningDoc) => {
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

  /**
   * @summary Generates a Cloudinary URL and opens the associated PDF resource in the system browser.
   * @param fileId - The Cloudinary public ID or direct filename for the asset.
   */
  const resolveLearningPdfUrl = (fileId: string) => {
    const value = fileId.trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (/^res\.cloudinary\.com\//i.test(value)) {
      return `https://${value}`;
    }

    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return "";

    const normalizedId = value.replace(/^\/+/, "").replace(/\.pdf$/i, "");
    return `https://res.cloudinary.com/${cloudName}/raw/upload/${normalizedId}.pdf`;
  };

  const handleFilePress = async (fileId: string) => {
    if (!fileId) {
      Alert.alert("Error", "No file available.");
      return;
    }

    const fileUrl = resolveLearningPdfUrl(fileId);
    if (!fileUrl) {
      Alert.alert("Error", "Could not generate a valid file link.");
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(fileUrl);
      if (!canOpen) {
        Alert.alert("Error", "This file link cannot be opened on this device.");
        return;
      }
      await Linking.openURL(fileUrl);
    } catch (err) {
      console.error("Open URL error:", err);
      Alert.alert("Error", "Could not open the file.");
    }
  };

  return (
    <LearningScreenUI
      events={videos}
      loading={isLoading || isBookmarksLoading}
      expandedId={expandedId}
      onBookmarkPress={handleBookmarkPress}
      onCardPress={handleCardPress}
      onFilePress={handleFilePress}
    />
  );
}