/**
 * HOME ROUTE
 * The logic controller for the Home tab.
 */
import { useEffect } from "react";
import { Alert } from "react-native";
import HomeScreen from "@/screens/home/home-screen";
import { useEvents } from "@/context/GlobalContext";

/**
 * @summary Connects home-tab event data and refresh actions to the home UI.
 * @throws {never} Errors are handled via alert side effects.
 * @Returns {React.JSX.Element} Home screen with event props.
 */
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
   * @throws {never} Delegates fetch errors to context state.
   * @Returns {void} Triggers events refresh.
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