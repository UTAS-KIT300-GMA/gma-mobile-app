import { useBookmarks } from "@/context/GlobalContext";
import { LearningScreenUI } from "@/screens/learning/learning-UI";
import { db } from "@/services/authService";
import { LearningDoc } from "@/types/type";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { collection, getDocs } from "@react-native-firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { useUser } from "@/hooks/useUser.ts";

function mapLearningSnapshot(
  querySnapshot: FirebaseFirestoreTypes.QuerySnapshot,
  bookmarkedIds: Record<string, boolean>,
): LearningDoc[] {
  return querySnapshot.docs.map(
    (doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      const data = doc.data();

      const publicId = String(data.cloudinaryPublicId || "");

      let finalThumbnail = "";

      if (data.thumbnailUrl?.trim()) {
        finalThumbnail = data.thumbnailUrl.trim();
      } else if (publicId) {
        finalThumbnail = `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}.jpg`;
      }

      return {
        id: doc.id,
        title: String(data.title || "Untitled Content"),
        duration: String(data.duration || "0:00"),
        thumbnailUrl: finalThumbnail,
        description: String(data.description || "No description available."),
        videoId: String(data.videoId || ""),
        cloudinaryPublicId: publicId,
        fileId: String(data.fileId || ""),
        accessType: data.accessType ?? "free",
        isBookmarked: !!bookmarkedIds[doc.id],
      } as LearningDoc;
    },
  );
}

/**
 * @summary Loads learning content, bookmark state, and file/open handlers for the learning UI.
 * @throws {never} Errors are handled and surfaced through alerts.
 * @Returns {React.JSX.Element} Learning screen with content and actions.
 */
export default function LearningRoute() {
  const [videos, setVideos] = useState<LearningDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { bookmarkedIds, toggleBookmark, isLoading: isBookmarksLoading } =
    useBookmarks();
  const { userDoc } = useUser();

  const isSubscriber = userDoc?.membershipStatus === "active";

  const loadVideos = useCallback(
    async (fromPullRefresh: boolean) => {
      if (fromPullRefresh) setRefreshing(true);
      else setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "learningVideos"));
        setVideos(mapLearningSnapshot(querySnapshot, bookmarkedIds));
      } catch (error) {
        console.error("Error loading learningVideos:", error);
        Alert.alert("Error", "Failed to sync with learning database.");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [bookmarkedIds],
  );

  useEffect(() => {
    void loadVideos(false);
  }, [loadVideos]);

  const handleBookmarkPress = async (id: string) => {
    const originalVideo = videos.find((v) => v.id === id);
    if (originalVideo) {
      try {
        await toggleBookmark(originalVideo as any);
      } catch {
        Alert.alert("Error", "Could not update bookmark.");
      }
    }
  };

  const handleCardPress = (item: LearningDoc) => {
    const hasAccess = item.accessType === "free" || isSubscriber;

    if (!hasAccess) {
      Alert.alert(
        "Subscribers Only",
        "This course is available to subscribed members only.",
      );
      return;
    }

    setExpandedId((prev) => (prev === item.id ? null : item.id));
  };

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
      refreshing={refreshing}
      onRefresh={() => void loadVideos(true)}
      expandedId={expandedId}
      onBookmarkPress={handleBookmarkPress}
      onCardPress={handleCardPress}
      onFilePress={handleFilePress}
    />
  );
}
