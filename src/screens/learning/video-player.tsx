import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});

interface Props {
  publicId: string; 
}

const VideoPlayer: React.FC<Props> = ({ publicId }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // LOGS IMMEDIATELY ON MOUNT
  useEffect(() => {
    console.log("--- VideoPlayer Mounted ---");
    console.log("Using Public ID:", publicId);
    console.log("Cloud Name:", process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);
  }, [publicId]);

  const optimizedUrl = useMemo(() => {
    if (!publicId?.trim()) return "";
    return cld.video(publicId).format("auto").quality("auto").toURL();
  }, [publicId]);

  const player = useVideoPlayer(optimizedUrl, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.play();
  });

  useEffect(() => {
    if (!player) return;
    const sub = player.addListener("playingChange", ({ isPlaying }) => setIsPlaying(isPlaying));
    return () => sub.remove();
  }, [player]);

  if (!optimizedUrl) {
    return (
      <View style={[styles.wrapper, styles.center]}>
        <Text style={{color: '#fff'}}>ID Missing or Invalid</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <VideoView player={player} style={styles.surface} nativeControls={false} contentFit="cover" />
      <Pressable style={StyleSheet.absoluteFill} onPress={() => isPlaying ? player.pause() : player.play()}>
        {!isPlaying && (
          <View style={styles.overlay}><Ionicons name="play" size={60} color="#fff" /></View>
        )}
      </Pressable>
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  wrapper: { height: 230, backgroundColor: "#000" },
  surface: { width: "100%", height: "100%" },
  center: { justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }
});