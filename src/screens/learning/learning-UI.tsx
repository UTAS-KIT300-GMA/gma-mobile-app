import { LearningVideo } from "@/types/type";
import { LearningCard } from "@/components/LearningCard";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VideoPlayer from "./video-player";

interface Props {
  events: LearningVideo[];
  loading: boolean;
  expandedId: string | null;
  onBookmarkPress?: (id: string) => void;
  onCardPress?: (item: LearningVideo) => void;
}

export const LearningScreenUI: React.FC<Props> = ({ events, expandedId, onBookmarkPress, onCardPress }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {events.map((item) => {
          const isExpanded = expandedId === item.id;

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

          return (
            <View key={item.id} style={styles.expanded}>
              <VideoPlayer publicId={item.cloudinaryPublicId || ""} />
              <View style={{ padding: 15 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={{ marginTop: 10 }}>{item.description}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  expanded: { backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', elevation: 4, marginBottom: 15 },
  title: { fontSize: 18, fontWeight: '800' }
});