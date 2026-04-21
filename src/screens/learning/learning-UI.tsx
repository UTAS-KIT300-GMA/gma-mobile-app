import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LearningVideo } from "@/types/type";

// IMPORTANT: Default imports match the 'export default' in the component files
import LearningCard from "@/components/LearningCard"; 
import VideoPlayer from "./video-player"; 

interface Props {
  events: LearningVideo[];
  loading: boolean;
  expandedId: string | null;
  onBookmarkPress?: (id: string) => void;
  onCardPress?: (item: LearningVideo) => void;
}

export const LearningScreenUI: React.FC<Props> = ({ 
  events, 
  expandedId, 
  onBookmarkPress, 
  onCardPress 
}) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {events.map((item) => {
          const isExpanded = expandedId === item.id;

          // RENDER CARD VIEW
          if (!isExpanded) {
            return (
              <LearningCard
                key={item.id}
                item={item}
                onPressCard={() => onCardPress?.(item)}
                onBookmarkPress={() => onBookmarkPress?.(item.id)}
              />
            );
          }

          // RENDER EXPANDED VIDEO VIEW
          return (
            <View key={item.id} style={styles.expanded}>
              <VideoPlayer publicId={item.cloudinaryPublicId || ""} />
              <View style={{ padding: 15 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={{ marginTop: 10, color: '#444' }}>{item.description}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  expanded: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    overflow: 'hidden', 
    elevation: 4, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  title: { fontSize: 18, fontWeight: '800' }
});