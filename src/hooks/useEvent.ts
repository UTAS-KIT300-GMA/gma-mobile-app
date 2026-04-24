import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    collection,
    FirebaseFirestoreTypes,
    getDocs,
    query,
    where,
} from "@react-native-firebase/firestore";

import { db } from "@/services/authService";
import type { EventDoc } from "@/types/type";
import {EventsSlice} from "@/context/GlobalContext.tsx";

/**
 * @summary Fetches approved events from Firestore once on mount and exposes a refresh function alongside loading and error states.
 * @throws {never} Hook setup does not throw synchronously.
 * @Returns {EventsSlice} Event list state with refresh controls.
 */
export function useEventsInternal(): EventsSlice {
    // Stores event query results and request lifecycle state.
    const [events, setEvents] = useState<EventDoc[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
    // Tracks the current fetch promise to avoid duplicate initial loads.
    const inFlightRef = useRef<Promise<void> | null>(null);

    /**
     * @summary Loads approved events from Firestore and stores them in local state.
     * @throws {Error} Throws when Firestore query fails.
     * @Returns {Promise<void>} Resolves after state is updated.
     */
    const fetchOnce = useCallback(async () => {
        setError(null);
        const q = query(
            collection(db, "events"),
            where("eventApprovalStatus", "==", "approved"),
        );
        const snap: FirebaseFirestoreTypes.QuerySnapshot = await getDocs(q);
        const rows = snap.docs.map(
            (d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
                ...(d.data() as Omit<EventDoc, "id">),
                id: d.id,
            }),
        );
        setEvents(rows);
        setLastFetchedAt(Date.now());
    }, []);

    /**
     * @summary Triggers a manual refresh of event data with loading/error handling.
     * @throws {never} Errors are captured and reflected in hook state.
     * @Returns {Promise<void>} Resolves when refresh completes.
     */
    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            await fetchOnce();
        } catch (e: any) {
            setError(e?.message ?? "Failed to load events.");
        } finally {
            setIsLoading(false);
        }
    }, [fetchOnce]);

    useEffect(() => {
        if (inFlightRef.current) return;
        setIsLoading(true);
        inFlightRef.current = (async () => {
            try {
                await fetchOnce();
            } catch (e: any) {
                setError(e?.message ?? "Failed to load events.");
            } finally {
                setIsLoading(false);
                inFlightRef.current = null;
            }
        })();
    }, [fetchOnce]);

    return useMemo(
        () => ({ events, isLoading, error, refresh, lastFetchedAt }),
        [events, isLoading, error, refresh, lastFetchedAt],
    );
}