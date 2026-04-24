import { useBookmarks } from "@/context/GlobalContext";
import { useAuth } from "@/hooks/useAuth";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { db } from "@/services/authService";
import { LearningDoc } from "@/types/type";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { collection, getDocs } from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";

/**
 * @summary Loads learning content, bookmark state, and file/open handlers for the learning UI.
 * @throws {never} Errors are handled and surfaced through alerts.
 * @Returns {React.JSX.Element} Learning screen with content and actions.
 */
export default function LearningRoute() {
  // Holds learning content records loaded from Firestore.
  const [videos, setVideos] = useState<LearningDoc[]>([]);
  // Tracks loading state for learning content fetch.
  const [isLoading, setIsLoading] = useState(true);
  // Stores currently expanded learning card ID.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Provides bookmark state/actions from global context.
  const { bookmarkedIds, toggleBookmark, isLoading: isBookmarksLoading } =
    useBookmarks();
  // Holds authenticated user context for access-aware behavior.
  const { user } = useAuth();

  useEffect(() => {
    /**
   * @summary Synchronizes the component state with Firestore learning content and local bookmark status.
   * @throws {never} Fetch errors are handled through alerts.
   * @Returns {Promise<void>} Resolves after content sync attempt.
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

  // Placeholder subscription entitlement flag.
  const isSubscriber = false;

  /**
   * @summary Toggles the bookmark status for a specific video asset.
   * @param id - The unique Firestore document ID of the video to be bookmarked or removed.
   * @throws Displays an alert if bookmark update fails.
   * @Returns Promise that resolves after bookmark mutation attempt.
   */
  const handleBookmarkPress = async (id: string) => {
    // Holds the selected learning item matched by ID.
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
   * @throws Displays an alert when restricted content is tapped by non-subscribers.
   * @Returns Void; updates expanded card state when access is allowed.
   */
  const handleCardPress = (item: LearningDoc) => {
    // Indicates whether this content can be opened by current user.
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
  /**
   * @summary Resolves a Firestore file reference into an openable PDF URL.
   * @param fileId - Direct URL, Cloudinary URL fragment, or Cloudinary public ID.
   * @throws Returns empty string when URL cannot be safely resolved.
   * @Returns A normalized PDF URL string or empty string.
   */
  const resolveLearningPdfUrl = (fileId: string) => {
    // Holds trimmed file identifier to normalize user/content input.
    const value = fileId.trim();
    if (!value) return "";

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (/^res\.cloudinary\.com\//i.test(value)) {
      return `https://${value}`;
    }

    // Holds Cloudinary cloud name used for URL construction.
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return "";

    // Holds normalized public ID without leading slash or pdf extension.
    const normalizedId = value.replace(/^\/+/, "").replace(/\.pdf$/i, "");
    return `https://res.cloudinary.com/${cloudName}/raw/upload/${normalizedId}.pdf`;
  };

  /**
   * @summary Opens learning PDF material in a device-capable external handler.
   * @param fileId - File identifier from learning content metadata.
   * @throws Displays alerts when URL generation, validation, or opening fails.
   * @Returns Promise that resolves after open attempt or early validation exit.
   */
  const handleFilePress = async (fileId: string) => {
    if (!fileId) {
      Alert.alert("Error", "No file available.");
      return;
    }

    // Holds final resolved URL used for deep linking to PDF.
    const fileUrl = resolveLearningPdfUrl(fileId);
    if (!fileUrl) {
      Alert.alert("Error", "Could not generate a valid file link.");
      return;
    }

    try {
      // Indicates whether the current device can open the resolved URL.
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