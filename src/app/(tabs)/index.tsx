/**
 * HOME ROUTE
 * The logic controller for the Home tab.
 * Fetches the list of events from Firestore and passes the data down to the presentation UI.
 */
import { collection, getDocs, query } from "@react-native-firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { Alert } from "react-native";
import { db } from "@/services/authService"
import { EventDoc } from "@/types/type";
import HomeScreen from "@/screens/home/home-screen";

export default function HomeRoute() {
  // Stores the array of event objects fetched from Firestore in the events var.
  const [events, setEvents] = useState<any[]>([]);

  // Stores a boolean in the loading var to track the fetching status.
  const [loading, setLoading] = useState(true);

  /**
   * @summary Fetches events from Firestore.
   * Wrapped in useCallback so it can be safely passed as a prop without
   * causing unnecessary re-renders of the child UI.
   */
  const fetchEvents = useCallback(async (isRefreshing = false) => {
    // Only set the main loading state if we aren't already "refreshing"
    // (FlatList handles its own refresh spinner)
    if (!isRefreshing) setLoading(true);

    try {
      const snap = await getDocs(query(collection(db, "events")));

      const rows = snap.docs.map((d: { id: any; data: () => any; }) => ({
        id: d.id,
        ...d.data(),
      })) as EventDoc[];

      setEvents(rows);
    } catch (e: any) {
      if (e?.code === 'firestore/permission-denied' || e?.message?.includes('permission-denied')) {
        console.log("Suppressed permission error during logout in Home.");
        return;
      }

      Alert.alert("Failed to load events", e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

// Initial load
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /**
   * @summary Handler for the Pull-to-Refresh action.
   */
  const onRefresh = () => {
    // We pass true to indicate this is a refresh action
    fetchEvents(true);
  };

  return (
      // Passes the values of events, loading and onRefresh to the home-screen UI component.
      <HomeScreen
          events={events}
          loading={loading}
          onRefresh={onRefresh}
      />
  );
}