import { Cloudinary } from "@cloudinary/url-gen";
import { scale } from "@cloudinary/url-gen/actions/resize";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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
 * @throws {never} Internal effects/logging handle non-fatal states.
 * @Returns {React.JSX.Element} Video player surface with optional fallback.
 */
const VideoPlayer: React.FC<Props> = ({ publicId }) => {

    const [isPlaying, setIsPlaying] = useState(false); // Stores whether the video is currently playing for overlay state.

  useEffect(() => {
    /**
 * @summary Logs initialization metadata to the console for debugging deployment environments and asset loading.
 */
    
  }, [publicId]);

  /**
 * @summary Generates a performance-optimized streaming URL by enforcing low resolution (480p), high compression (eco-mode), and automatic format selection.
 * @param publicId - Dependency: Triggers a new URL generation if the video source ID is updated.
 * @throws {never} URL builder returns empty string on invalid input.
 * @Returns {string} Optimized streaming URL.
 */
  const optimizedUrl = useMemo(() => {
    if (!publicId?.trim()) return "";
    
    return cld.video(publicId)
      .resize(scale().width(480))    // Force Low Quality.
      .quality("auto:eco")      // Force high compression.
      .format("auto")          // Cloudinary pick efficient format.
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