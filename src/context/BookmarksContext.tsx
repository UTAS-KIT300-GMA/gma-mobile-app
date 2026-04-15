import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "@react-native-firebase/firestore";
import { auth, db } from "@/services/authService";
import { EventDoc } from "@/types/type";
import { Alert } from "react-native";

type BookmarksState = {
  bookmarkedIds: Record<string, boolean>;
  isLoading: boolean;
  toggleBookmark: (event: EventDoc) => Promise<void>;
};

const BookmarksContext = createContext<BookmarksState | null>(null);

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setBookmarkedIds({});
      setIsLoading(false);
      return;
    }

    try {
      const snap = await getDocs(collection(db, "users", uid, "bookmarks"));
      const bookmarkMap: Record<string, boolean> = {};
      snap.forEach((docSnap: { id: string | number; }) => { bookmarkMap[docSnap.id] = true; });
      setBookmarkedIds(bookmarkMap);
    } catch (e) {
      console.error("Failed to fetch bookmarks:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = async (event: EventDoc) => {
    // Stores the user's UID from FirebaseAuth in the uid var.
    const uid = auth.currentUser?.uid;

    // Stops the function and alerts the user if they are not logged in.
    if (!uid) return Alert.alert("Sign In", "Please log in to save events.");

    // Checks the bookmarkedIds var to see if the event is already bookmarked.
    const isBookmarked = !!bookmarkedIds[event.id];

    // Stores the specific Firestore path for the bookmark in the bookmarkRef var.
    const bookmarkRef = doc(db, "users", uid, "bookmarks", event.id);

    // Updates the UI state immediately for a faster user experience.
    setBookmarkedIds(prev => {
      const next = { ...prev };
      isBookmarked ? delete next[event.id] : (next[event.id] = true);
      return next;
    });

    try {
      // Deletes the document if it was already saved, otherwise creates a new one.
      if (isBookmarked) await deleteDoc(bookmarkRef);
      else
        await setDoc(bookmarkRef, {
          eventId: event.id,
          title: event.title ?? "Unknown",
          savedAt: serverTimestamp(),
        });
    } catch (e) {
      // Reverts the UI state if the Firestore operation fails.
      setBookmarkedIds((prev) => {
        const next = { ...prev };
        isBookmarked ? (next[event.id] = true) : delete next[event.id];
        return next;
      });
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  const value = useMemo(() => ({ bookmarkedIds, isLoading, toggleBookmark }), [bookmarkedIds, isLoading]);

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export const useBookmarks = () => {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
};