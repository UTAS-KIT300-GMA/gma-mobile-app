import { resolveLearningVideoUrl } from "@/services/learningStorageUrls";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface Props {
  videoUrl: string;
  videoStoragePath?: string;
}

/**
 * @summary Plays a learning video from Firebase Storage (HTTPS URL or resolved object path).
 */
const VideoPlayer: React.FC<Props> = ({ videoUrl, videoStoragePath }) => {
  const [playUrl, setPlayUrl] = useState("");
  const [resolving, setResolving] = useState(true);
  const [resolveError, setResolveError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setResolving(true);
    setResolveError(false);
    setPlayUrl("");

    void resolveLearningVideoUrl({
      videoDownloadUrl: videoUrl,
      videoStoragePath,
    })
      .then((url) => {
        if (cancelled) return;
        setPlayUrl(url);
        setResolving(false);
        setResolveError(!url);
      })
      .catch((err) => {
        console.error("resolveLearningVideoUrl failed:", err);
        if (cancelled) return;
        setPlayUrl("");
        setResolving(false);
        setResolveError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [videoUrl, videoStoragePath]);

  const player = useVideoPlayer(playUrl || null, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.pause();
  });

  if (resolving) {
    return (
      <View style={[styles.wrapper, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (resolveError || !playUrl) {
    return (
      <View style={[styles.wrapper, styles.center]}>
        <Text style={styles.fallbackText}>
          {resolveError ? "Could not load video." : "Video not available."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <VideoView
        player={player}
        style={styles.surface}
        nativeControls
        contentFit="cover"
      />
    </View>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  wrapper: { height: 230, backgroundColor: "#000" },
  surface: { width: "100%", height: "100%" },
  center: { justifyContent: "center", alignItems: "center" },
  fallbackText: { color: "#fff", textAlign: "center", paddingHorizontal: 16 },
});
