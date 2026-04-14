import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  FirebaseFirestoreTypes,
  getDocs,
  query,
  where,
} from "@react-native-firebase/firestore";

import { db } from "@/services/authService";
import { EventDoc } from "@/types/type";

type EventsState = {
  events: EventDoc[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastFetchedAt: number | null;
};

const EventsContext = createContext<EventsState | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  // Prevent duplicate fetches when multiple screens mount quickly.
  const inFlightRef = useRef<Promise<void> | null>(null);

  const fetchOnce = useCallback(async () => {
    setError(null);

    // Security rules: only load approved events
    const q = query(
      collection(db, "events"),
      where("approvalStatus", "==", "approved"),
    );

    const snap: FirebaseFirestoreTypes.QuerySnapshot = await getDocs(q);

    const rows = snap.docs.map((d: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
      ...(d.data() as Omit<EventDoc, "id">),
      id: d.id,
    }));

    setEvents(rows);
    setLastFetchedAt(Date.now());
  }, []);

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

  const value = useMemo<EventsState>(
    () => ({ events, isLoading, error, refresh, lastFetchedAt }),
    [events, isLoading, error, refresh, lastFetchedAt],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsState {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
