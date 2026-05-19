import {
  downloadUrlForStoragePath,
  looksLikeFirebaseStorageObjectPath,
} from "@/services/learningStorageUrls";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface Props {
  videoUrl: string;
  videoStoragePath?: string;
}

/**
 * @summary Plays a learning video from an HTTPS URL (Firebase Storage download URL) or resolves a Storage object path.
 * @param videoUrl - Direct HTTPS stream URL when available.
 * @param videoStoragePath - Optional Storage path under `learning/…` when `videoUrl` is empty.
 */
const VideoPlayer: React.FC<Props> = ({ videoUrl, videoStoragePath }) => {
  const [playUrl, setPlayUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const direct = videoUrl.trim();

    if (direct) {
      setPlayUrl(direct);
      setResolving(false);
      setResolveError(false);
      return () => {
        cancelled = true;
      };
    }

    const path = videoStoragePath?.trim() ?? "";
    if (path && looksLikeFirebaseStorageObjectPath(path)) {
      setResolving(true);
      setResolveError(false);
      setPlayUrl("");
      void downloadUrlForStoragePath(path)
        .then((url) => {
          if (!cancelled) {
            setPlayUrl(url);
            setResolving(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setPlayUrl("");
            setResolving(false);
            setResolveError(true);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    setPlayUrl("");
    setResolving(false);
    setResolveError(false);
    return () => {
      cancelled = true;
    };
  }, [videoUrl, videoStoragePath]);

  const player = useVideoPlayer(playUrl, (playerInstance) => {
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
        key={playUrl}
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
