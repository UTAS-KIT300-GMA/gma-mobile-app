import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { LearningScreenUI } from "@/screens/learning/learning-UI";

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

type MembershipStatus = "free" | "subscriber";

export default function LearningRoute() {
  const [events, setEvents] = useState<LearningVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Replace later with real user membership data
  const [membershipStatus] = useState<MembershipStatus>("free");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const snap = await firestore()
          .collection("learningVideos")
          .limit(20)
          .get();

        const data: LearningVideo[] = snap.docs.map((doc) => {
          const raw = doc.data();

          return {
            id: doc.id,
            title: typeof raw.title === "string" ? raw.title : "No title",
            duration: typeof raw.duration === "string" ? raw.duration : "0:00",
            thumbnailUrl:
              typeof raw.thumbnailUrl === "string" ? raw.thumbnailUrl : "",
            description:
              typeof raw.description === "string" ? raw.description : "",
            videoUrl: typeof raw.videoUrl === "string" ? raw.videoUrl : "",
            accessType:
              raw.accessType === "subscriber" ? "subscriber" : "free",
            isBookmarked: false,
          };
        });

        setEvents(data);
      } catch (error: any) {
        console.log("Learning fetch error:", error);
        Alert.alert(
          "Error",
          "Unable to load learning videos right now. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
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

  const canAccessVideo = (item: LearningVideo) => {
    if (item.accessType === "free") return true;
    return membershipStatus === "subscriber";
  };

  const handleCardPress = (item: LearningVideo) => {
    if (!canAccessVideo(item)) {
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
      events={events}
      loading={loading}
      expandedId={expandedId}
      onBookmarkPress={handleBookmarkPress}
      onCardPress={handleCardPress}
    />
  );
}