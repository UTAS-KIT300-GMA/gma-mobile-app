import React, {
  createContext,
  useContext,
  useMemo,
} from "react";

import { useUser } from "@/hooks/useUser";
import type { EventDoc, UserDoc } from "@/types/type";
import {
  type LocationFetchResult,
} from "@/components/utils";
import {useEventsInternal} from "@/hooks/useEvent.ts";
import {useBookmarksInternal} from "@/hooks/useBookmark.ts";
import {useLocationInternal} from "@/hooks/useLocation.ts";

// --- User (Firestore profile) ---
export type UserSlice = {
  userDoc: UserDoc | null;
  loading: boolean;
  error: string | null;
};

// --- Events ---
export type EventsSlice = {
  events: EventDoc[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastFetchedAt: number | null;
};

// --- Bookmarks ---
export type BookmarksSlice = {
  bookmarkedIds: Record<string, boolean>;
  isLoading: boolean;
  toggleBookmark: (event: EventDoc) => Promise<void>;
};

// --- Location ---
export type LocationSlice = {
  coords: { latitude: number; longitude: number };
  locationError: string | null;
  isLocationOn: boolean;
  isLocationLoading: boolean;
  refreshLocation: () => Promise<LocationFetchResult>;
};

export type GlobalContextValue = {
  user: UserSlice;
  events: EventsSlice;
  bookmarks: BookmarksSlice;
  location: LocationSlice;
};

const GlobalContext = createContext<GlobalContextValue | null>(null);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const userData = useUser();
  const eventsSlice = useEventsInternal();
  const bookmarksSlice = useBookmarksInternal();
  const locationSlice = useLocationInternal();

  const value = useMemo<GlobalContextValue>(
    () => ({
      user: {
        userDoc: userData.userDoc,
        loading: userData.loading,
        error: userData.error,
      },
      events: eventsSlice,
      bookmarks: bookmarksSlice,
      location: locationSlice,
    }),
    [userData, eventsSlice, bookmarksSlice, locationSlice],
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

export function useGlobal(): GlobalContextValue {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
}

export const useAuthUser = () => {
  const { user } = useGlobal();
  return {
    userDoc: user.userDoc,
    loading: user.loading,
    error: user.error,
  };
};

export function useEvents(): EventsSlice {
  return useGlobal().events;
}

export const useBookmarks = () => {
  return useGlobal().bookmarks;
};

export function useAppLocation(): LocationSlice {
  return useGlobal().location;
}
