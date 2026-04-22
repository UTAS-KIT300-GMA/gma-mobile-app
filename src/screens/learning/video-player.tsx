import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
});

interface Props {
  publicId: string; 
}

/**
 * @summary A specialized video playback component that leverages Cloudinary for on-the-fly optimization and `expo-video` for native performance.
 * @param publicId - The Cloudinary public identifier for the video asset to be streamed.
 */
const VideoPlayer: React.FC<Props> = ({ publicId }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  
  useEffect(() => {
    /**
 * @summary Logs initialization metadata to the console for debugging deployment environments and asset loading.
 */
    
  }, [publicId]);

  /**
 * @summary Generates a performance-optimized streaming URL by enforcing low resolution (480p), high compression (eco mode), and automatic format selection.
 * @param publicId - Dependency: Triggers a new URL generation if the video source ID is updated.
 */
  const optimizedUrl = useMemo(() => {
    if (!publicId?.trim()) return "";
    
    return cld.video(publicId)
      // 1. Force the width to 480 pixels (Low Quality)
      .resize(scale().width(480)) 
      
      // 2. Force high compression. 'eco' prioritizes a smaller file size over visual quality.
      .quality("auto:eco") 
      
      // 3. Let Cloudinary pick the best efficient format (like webm for Android)
      .format("auto") 
      .toURL();
  }, [publicId]);


  const player = useVideoPlayer(optimizedUrl ?? "", (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.pause();
  });

  useEffect(() => {
 /**
* @summary Syncs the component's internal state with the native video player's playback events to manage the UI overlay.
*/
    if (!player) return;
    
    // LOG: Verification of optimization
    const isOptimized = optimizedUrl.includes('w_480') && optimizedUrl.includes('q_auto:eco');
    console.log("--- VideoPlayer Performance Check ---");
    console.log("Public ID:", publicId);
    console.log("Is 480p Eco active?:", isOptimized ? "✅ YES" : "❌ NO");
    const sub = player.addListener("playingChange", ({ isPlaying }) => {
    setIsPlaying(isPlaying);
    console.log(`Video Status: ${isPlaying ? "▶️ Playing" : "⏸️ Paused"}`);
  });

  return () => sub.remove();
  }, [player, optimizedUrl, publicId]);

  
    

    

  if (!optimizedUrl) {
    return (
      <View style={[styles.wrapper, styles.center]}>
        <Text style={{color: '#fff'}}>ID Missing or Invalid</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <VideoView 
        player={player} 
        style={styles.surface} 
        nativeControls={true}
        contentFit="cover" 
      />
      {!isPlaying && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => player.play()}>
          <View style={styles.overlay}>
            <Ionicons name="play" size={60} color="#fff" />
          </View>
        </Pressable>
      )}
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