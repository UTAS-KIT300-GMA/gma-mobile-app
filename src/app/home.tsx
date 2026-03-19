import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { colors } from "../theme/ThemeProvider";

// ✅ Local image import
const eventImage = require("../../assets/images/event.png");

const events = [
  {
    id: 1,
    title: "Event title",
    time: "Time",
    location: "Location",
    image: eventImage,
  },
  {
    id: 2,
    title: "Event title",
    time: "Time",
    location: "Location",
    image: eventImage,
  },
  {
    id: 3,
    title: "Event title",
    time: "Time",
    location: "Location",
    image: eventImage,
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logoText}>GMA Connect</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton}>
              <Feather name="user" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Event Feed */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {events.map((event) => (
            <View key={event.id} style={styles.card}>
              <ImageBackground
                source={event.image}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                <View style={styles.overlay}>
                  <View style={styles.cardBottomRow}>
                    <View style={styles.cardTextBlock}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventMeta}>{event.time}</Text>
                      <Text style={styles.eventMeta}>{event.location}</Text>
                    </View>

                    <TouchableOpacity style={styles.rsvpButton}>
                      <Text style={styles.rsvpButtonText}>RSVP/Book</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Feather name="home" size={26} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons
              name="compass-outline"
              size={26}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons
              name="document-text-outline"
              size={26}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Feather name="search" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  container: {
    width: 310,
    height: "95%",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.primary,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "#e4d7dd",
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  card: {
    marginBottom: 14,
    borderRadius: 14,
    overflow: "hidden",
  },
  cardImage: {
    height: 150,
    justifyContent: "flex-end",
  },
  cardImageStyle: {
    borderRadius: 14,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  eventTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  eventMeta: {
    color: "#ffffff",
    fontSize: 14,
  },
  rsvpButton: {
    backgroundColor: "#f1d326",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  rsvpButtonText: {
    fontWeight: "700",
  },
  bottomNav: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#e4d7dd",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    padding: 8,
  },
});
