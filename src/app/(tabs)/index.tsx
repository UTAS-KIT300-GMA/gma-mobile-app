import { collection, getDocs, query } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { db } from "@/services/authService"
import { EventDoc } from "@/types/type";
import HomeScreen from "@/screens/home/home-screen"; 


export default function HomeRoute() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, "events")));
        const rows = snap.docs.map((d: { id: string; data: () => Document }) => ({
          id: d.id,
          ...d.data(),
        })) as EventDoc[];
        
        if (mounted) setEvents(rows);
      } catch (e: any) {
        Alert.alert("Failed to load events", e?.message ?? "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEvents();
    return () => { mounted = false; };
  }, []);

  return <HomeScreen events={events} loading={loading} />;
}