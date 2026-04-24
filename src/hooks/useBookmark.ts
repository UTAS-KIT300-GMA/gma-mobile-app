import { BookmarksSlice } from "@/context/GlobalContext.tsx";
import { auth, db } from "@/services/authService";
import type { EventDoc, LearningDoc } from "@/types/type";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
} from "@react-native-firebase/firestore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

/**
 * @summary Manages bookmark state for events and learning content, syncing adds and removes with Firestore.
 * @throws {never} Hook setup does not throw synchronously.
 * @Returns {BookmarksSlice} Bookmark state map with loading and toggle action.
 */
export function useBookmarksInternal(): BookmarksSlice {
  // Stores bookmark IDs keyed by content ID and loading status.
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);

  /**
   * @summary Loads the current user's bookmark IDs from Firestore.
   * @throws {Error} Throws when Firestore bookmark retrieval fails.
   * @Returns {Promise<void>} Resolves after bookmark state is hydrated.
   */
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
      snap.forEach((docSnap: { id: string }) => {
        bookmarkMap[docSnap.id] = true;
      });
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

  // Change parameter type to accept any bookmarkable item (event or learning content)
  /**
   * @summary Adds or removes an item bookmark and optimistically updates local state.
   * @param item - The event or learning document to toggle.
   * @throws {never} Errors are handled with rollback and user alert.
   * @Returns {Promise<void>} Resolves when bookmark write attempt completes.
   */
  const toggleBookmark = useCallback(
    async (item: EventDoc | LearningDoc) => {
      const uid = auth.currentUser?.uid;
      if (!uid) return Alert.alert("Sign In", "Please log in to save events.");
      const isBookmarked = !!bookmarkedIds[item.id];
      const bookmarkRef = doc(db, "users", uid, "bookmarks", item.id);

      setBookmarkedIds((prev) => {
        const next = { ...prev };
        isBookmarked ? delete next[item.id] : (next[item.id] = true);
        return next;
      });

      try {
        if (isBookmarked) await deleteDoc(bookmarkRef);
        else
          await setDoc(bookmarkRef, {
            eventId: item.id,
            title: item.title ?? "Unknown",
            savedAt: serverTimestamp(),
          });
      } catch (e) {
        setBookmarkedIds((prev) => {
          const next = { ...prev };
          isBookmarked ? (next[item.id] = true) : delete next[item.id];
          return next;
        });
        Alert.alert("Error", "Could not update bookmark.");
      }
    },
    [bookmarkedIds],
  );

  return useMemo(
    () => ({ bookmarkedIds, isLoading, toggleBookmark }),
    [bookmarkedIds, isLoading, toggleBookmark],
  );
}
