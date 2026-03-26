/**
 * HOME ROUTE
 * The logic controller for the Home tab.
 * Fetches the list of events from Firestore and passes the data down to the presentation UI.
 */
import { collection, getDocs, query } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { db } from "@/services/authService"
import { EventDoc } from "@/types/type";
import HomeScreen from "@/screens/home/home-screen"; 

export default function HomeRoute() {
  // Stores the array of event objects fetched from Firestore in the events var.
  const [events, setEvents] = useState<any[]>([]);
  
  // Stores a boolean in the loading var to track the fetching status.
  const [loading, setLoading] = useState(true);

  // Runs once when this screen becomes active to fetch the initial data.
  useEffect(() => {
    // Stores a boolean to track if the screen is active to prevent memory leaks on unmounted screens.
    let mounted = true;
    
    // Stores the async fetching instructions in the fetchEvents function.
    const fetchEvents = async () => {
      // Sets loading var to true before starting the fetch.
      setLoading(true);
      try {
        // Retrieves the snapshot of the 'events' collection from Firestore.
        const snap = await getDocs(query(collection(db, "events")));
        
        // Maps through the snapshot docs and stores the formatted data in the rows var.
        const rows = snap.docs.map((d: { id: string; data: () => Document }) => ({
          id: d.id,
          ...d.data(),
        })) as EventDoc[];
        
        // Updates the events var using the setEvents function if the screen is still active.
        if (mounted) setEvents(rows);
      } catch (e: any) {
        // Checks if the error is a permission-denied error (usually caused by the user logging out).
        // Silently returns to prevent a crash or alert as the app navigates to the login screen.
        if (e?.code === 'firestore/permission-denied' || e?.message?.includes('permission-denied')) {
          console.log("Suppressed permission error during logout in Home.");
          return; 
        }
        
        // If it is a genuine fetching error, displays an alert to the user.
        if (mounted) {
          Alert.alert("Failed to load events", e?.message ?? "Something went wrong");
        }
      } finally {
        // setLoading function changes value of loading var to false as data is no longer being fetched.
        if (mounted) setLoading(false);
      }
    }; 

    // Executes the fetch instructions.
    fetchEvents();
    
    // Cleanup function: Sets mounted to false when the user navigates away and destroys the component.
    return () => { mounted = false; };
  }, []);

  return (
    // Passes the values of events and loading to the home-screen UI component.
    <HomeScreen events={events} loading={loading} />
  );
}