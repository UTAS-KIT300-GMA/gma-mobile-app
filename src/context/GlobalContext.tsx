import React, {
  createContext,
  useContext,
  useMemo,
} from "react";

import { useUser } from "@/hooks/useUser";
import type { EventDoc, LearningDoc, UserDoc } from "@/types/type";
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
  toggleBookmark: (item: EventDoc | LearningDoc) => Promise<void>;
};

// --- Location ---
export type LocationSlice = {
  coords: { latitude: number; longitude: number };
  locationError: string | null;
  isLocationOn: boolean;
  isLocationLoading: boolean;
  refreshLocation: (options?: {
    forceFresh?: boolean;
    maxAgeMs?: number;
  }) => Promise<LocationFetchResult>;
};

export type GlobalContextValue = {
  user: UserSlice;
  events: EventsSlice;
  bookmarks: BookmarksSlice;
  location: LocationSlice;
};

const GlobalContext = createContext<GlobalContextValue | null>(null);

/**
 * @summary Composes all global slices (user, events, bookmarks, location) into a single context provider for the app.
 * @param children - The React subtree that will have access to the global context.
 */
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

/**
 * @summary Returns the full global context value; throws if called outside GlobalProvider.
 */
export function useGlobal(): GlobalContextValue {
  const ctx = useContext(GlobalContext);
  if (!ctx) throw new Error("useGlobal must be used within GlobalProvider");
  return ctx;
}

/**
 * @summary Selects the user slice from the global context, exposing the Firestore profile, loading flag, and error.
 */
export const useAuthUser = () => {
  const { user } = useGlobal();
  return {
    userDoc: user.userDoc,
    loading: user.loading,
    error: user.error,
  };
};

/**
 * @summary Selects the events slice from the global context.
 */
export function useEvents(): EventsSlice {
  return useGlobal().events;
}

/**
 * @summary Selects the bookmarks slice from the global context.
 */
export const useBookmarks = () => {
  return useGlobal().bookmarks;
};

/**
 * @summary Selects the location slice from the global context.
 */
export function useAppLocation(): LocationSlice {
  return useGlobal().location;
}
