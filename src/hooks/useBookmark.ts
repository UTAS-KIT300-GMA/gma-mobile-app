import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    collection, deleteDoc, doc,
    getDocs, serverTimestamp, setDoc,
} from "@react-native-firebase/firestore";
import { auth, db } from "@/services/authService";
import type { EventDoc } from "@/types/type";
import {Alert} from "react-native";
import {BookmarksSlice} from "@/context/GlobalContext.tsx";

export function useBookmarksInternal(): BookmarksSlice {
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

    const toggleBookmark = useCallback(async (event: EventDoc) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return Alert.alert("Sign In", "Please log in to save events.");
        const isBookmarked = !!bookmarkedIds[event.id];
        const bookmarkRef = doc(db, "users", uid, "bookmarks", event.id);

        setBookmarkedIds((prev) => {
            const next = { ...prev };
            isBookmarked ? delete next[event.id] : (next[event.id] = true);
            return next;
        });

        try {
            if (isBookmarked) await deleteDoc(bookmarkRef);
            else
                await setDoc(bookmarkRef, {
                    eventId: event.id,
                    title: event.title ?? "Unknown",
                    savedAt: serverTimestamp(),
                });
        } catch (e) {
            setBookmarkedIds((prev) => {
                const next = { ...prev };
                isBookmarked ? (next[event.id] = true) : delete next[event.id];
                return next;
            });
            Alert.alert("Error", "Could not update bookmark.");
        }
    }, [bookmarkedIds]);

    return useMemo(
        () => ({ bookmarkedIds, isLoading, toggleBookmark }),
        [bookmarkedIds, isLoading, toggleBookmark],
    );
}