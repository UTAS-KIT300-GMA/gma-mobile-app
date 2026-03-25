import { 
  collection, 
  getDocs, 
  limit, 
  query, 
  FirebaseFirestoreTypes 
} from "@react-native-firebase/firestore";
import { useEffect, useState } from 'react';
import { db } from '@/services/authService';
import { LearningScreenUI } from '@/screens/learning/learning-UI';


export interface LearningEvent {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  isBookmarked: boolean;
}

export default function LearningRoute() {
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, limit(5));
        
        
        const snap: FirebaseFirestoreTypes.QuerySnapshot = await getDocs(q);
        
        const data = snap.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
          id: doc.id,
          ...(doc.data() as Omit<LearningEvent, 'id'>),
        }));

        setEvents(data);
      } catch (e) {
        console.error("Firestore Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return <LearningScreenUI events={events} loading={loading} />;
}