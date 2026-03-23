import { db } from "@/services/firebase";
import { collection, getDocs } from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";


//setting gma colours to call
const Colours = {
    gmaPurple: "", gmaGold: "", gmaBackground:""
};

/*Use state stores the data useEffect runs the code when the screen loads.
chose flatlist instead of scrollview to limit memory used.  scrollview appreantly loads all data at once
while flatlist while only load what is on the screen.
*/
export default function listedEvents() {
    const [events, setEvents] = useState([]);  //holds the list of events. starts empty so doesnt crash
    const [loading, setLoading] = useState(true); //loading has no data so starts with a true value

    useEffect (() => {  //starts when the screen loads
        fetchEvents();  // using [] so it only runs once
    }, []);

//fetches the event data from Firebase
    const fetchEvents  = async () => {
        try{
            const snapshot = await getDocs(collection(db, "events"));  //looks at the firebase and gets all the events

            const eventList = snapshot.docs.map(doc => ({              //makes the array of events
                id: doc.id, ...doc.data(),                             //unique ID for all events and ...doc.data collects the seperate fields ie date, pillar, membership etc
            }))
            setEvents(eventList);   //saves data to events
        }
        catch(error){
            console.error(error);   //display error
            
        }
        finally {setLoading(false); //stops showing the loading of data
    }
    
};

//Fetch events user is attending.  Comment out until function is implemented.
const renderItem = ({item}) => (
    <View style={{padding:20, borderBottomWidth:1}}>
        <Text style={{fontSize:20, fontWeight:"bold"}}>
            {item.title}
        </Text>
        <text>{item.address}</text>     //display address of event
        <text>{item.catagory}</text>    //display catagory of event
        <text>{item.dateTime}</text>    //display date and time of event
    </View>
);
if (loading) return <ActivityIndicator size="small" />; //display spinning icon to show loading phase

return (
    <FlatList       //calls for each event
    data={events}   
    keyExtractor={(item) => item.id}
    renderItem={renderItem}
    ListEmptyComponent={<text>No Events available at this time</text>}
    />
);
}
//Unsure if needed. testing
// useEffect(() => ){
//     fetchEvents
// }



//making of flatlist (calling for info on RSVP events).  Comment out until function is implemented.
{/* <View style={styles.container}> 
    <FlatList
    data={}   
    />
</View> */}

//Flatlist to show all events currently in database (will be adapted to RSVP events once that is ready to go)

//possible sort by newest (suggestions from video tutorial / AI)
// import { query, orderBy } from "firebase/firestore";

// const q = query(
//   collection(db, "events"),
//   orderBy("date", "asc") // upcoming events first
// );