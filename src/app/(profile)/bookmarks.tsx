import { useBookmarks } from "@/context/GlobalContext";
import { BookmarksUI } from "@/screens/profile/bookmarks-UI";
import { db } from "@/services/authService";
import { EventDoc, LearningDoc } from "@/types/type";
import {
  collection,
  FirebaseFirestoreTypes,
  getDocs,
  query,
} from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

/**
   * @summary Displays a user's bookmarked events (saved events) from Firestore and automactically updates the UI when an user deletes or adds bookmark.
   * @throws {never} Errors are handled with alerts and guarded state updates.
   * @Returns {React.JSX.Element} Bookmarks UI with event and learning sections.
   */
export default function BookmarksRoute() {
  
  const router = useRouter();
  // Stores the array of all available events and courses from the database in the allEvents var.
  const [allEvents, setAllEvents] = useState<EventDoc[]>([]);
  const [allLearningContents, setAllLearningContents] = useState<LearningDoc[]>([]);
  
  // Accesses the bookmarkedIds and toggleBookmark function from the bookmark context.
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  
  // Stores a boolean in the loading var to track the background data fetching.
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    /**
     * @summary Loads events and learning content, then reconciles bookmark flags.
     * @throws {never} Errors are caught and surfaced to the user.
     * @Returns {Promise<void>} Resolves when fetch and state updates complete.
     */
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch ALL events
        const eventsSnap = await getDocs(query(collection(db, "events")));
        const eventRows: EventDoc[] = eventsSnap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot): EventDoc => ({
            ...(d.data() as Omit<EventDoc, "id">),
            id: d.id,
          })
        );


        // Fetch ALL learning contents 
        const learningSnap = await getDocs(query(collection(db, "learningVideos")));
        const learningRows: LearningDoc[] = learningSnap.docs.map(
          (d: FirebaseFirestoreTypes.QueryDocumentSnapshot): LearningDoc => ({
            ...(d.data() as Omit<LearningDoc, "id">),
            id: d.id,
            isBookmarked: !!bookmarkedIds[d.id],
          })
        );
        if (mounted) {
          setAllEvents(eventRows);
          setAllLearningContents(learningRows);
        }
      } catch (e: any) {
        Alert.alert("Error", "Failed to load your bookmarks.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, [bookmarkedIds]); // Refetch data when bookmarks change to ensure UI is up-to-date

  // Stores the resulting filtered array in the bookmarkedEvents var.
  const bookmarkedEvents = useMemo(
    () => allEvents.filter((e) => !!bookmarkedIds[e.id]),
    [allEvents, bookmarkedIds],
  );

  // Stores the resulting filtered array in the bookmarkedLearningContents var.
  const bookmarkedLearningContents = useMemo(() => {
    return allLearningContents.filter(c => !!bookmarkedIds[c.id]);
  }, [allLearningContents, bookmarkedIds]);
  


  return (
    // Passes the values of bookmarkedEvents, loading, handleRemoveBoomark
    // and navigation instructions to the saved events screen.
    <BookmarksUI
      events={bookmarkedEvents}
      learningContents={bookmarkedLearningContents}
      loading={loading}
      onBack={() => router.back()}
      onPressCard={(item) => router.push({
        pathname: "/event/event-details",
        params: {
          id: item.id,
        },
      } as any)}
      onRemoveBookmark={toggleBookmark}
      onRsvp={(item) =>
        router.push({
          pathname: "/event/booking",
          params: { eventId: item.id },
        } as any)}

      onPressLearning={() => router.push("learning/" as any)
      }

      onRemoveCourseBookmark={toggleBookmark}
    />
  );
}