/**
 * HOME ROUTE
 * The logic controller for the Home tab.
 */
import { useEffect } from "react";
import { Alert } from "react-native";
import HomeScreen from "@/screens/home/home-screen";
import { useEvents } from "@/context/GlobalContext";

export default function HomeRoute() {
  const { events, isLoading, error, refresh } = useEvents();

  useEffect(() => {
    if (!error) return;
    if (
      (error ?? "").includes("permission-denied") ||
      (error ?? "").includes("firestore/permission-denied")
    ) {
      return;
    }
    Alert.alert("Failed to load events", error);
  }, [error]);

  /**
   * @summary Handler for the Pull-to-Refresh action.
   */
  const onRefresh = () => {
    // We pass true to indicate this is a refresh action
    refresh();
  };

  return (
      // Passes the values of events, loading and onRefresh to the home-screen UI component.
      <HomeScreen
          events={events}
          loading={isLoading}
          onRefresh={onRefresh}
      />
  );
}