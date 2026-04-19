import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- Cloudinary Integration ---
import { Cloudinary } from "@cloudinary/url-gen";

// Initialize Cloudinary instance
// Replace 'YOUR_CLOUD_NAME' with your actual cloud name from the dashboard
const cld = new Cloudinary({
  cloud: {
    cloudName: "YOUR_CLOUD_NAME",
  },
});

interface Props {
  publicId: string; // The unique identifier for your video in Cloudinary
}

const VideoPlayer: React.FC<Props> = ({ publicId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [trackWidth, setTrackWidth] = useState(1);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Generate optimized URL using the Cloudinary SDK
  const optimizedUrl = useMemo(() => {
    if (!publicId?.trim()) return "";
    return cld
      .video(publicId)
      .format("auto")   // Best format (WebM/MP4) for the device
      .quality("auto")  // Compressed without losing visual quality
      .toURL();
  }, [publicId]);

  const hasValidVideo = Boolean(optimizedUrl);

  // 2. Initialize the Expo Video Player with the Cloudinary URL
  const player = useVideoPlayer(hasValidVideo ? optimizedUrl : null, (playerInstance) => {
    playerInstance.loop = false;
    playerInstance.timeUpdateEventInterval = 0.25;
    playerInstance.playbackRate = 1;

    try {
      playerInstance.play();
    } catch (error) {
      console.log("Autoplay failed:", error);
    }
  });

  // --- UI Helpers ---
  const clearHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const resetHideTimer = () => {
    clearHideTimer();
    hideTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // --- Listeners & Effects ---
  useEffect(() => {
    if (!player) return;

    const playingSub = player.addListener("playingChange", ({ isPlaying }) => {
      setIsPlaying(isPlaying);
    });

    const timeSub = player.addListener("timeUpdate", (payload) => {
      setPosition(payload.currentTime ?? 0);
      setDuration(player.duration ?? 0);
    });

    return () => {
      playingSub.remove();
      timeSub.remove();
    };
  }, [player]);

  useEffect(() => {
    if (showControls && hasValidVideo) {
      resetHideTimer();
    }
    return () => clearHideTimer();
  }, [showControls, isPlaying, hasValidVideo]);

  // --- Interaction Handlers ---
  const togglePlayPause = () => {
    if (!player || !hasValidVideo) return;
    isPlaying ? player.pause() : player.play();
    setShowControls(true);
  };

  const seekBy = (seconds: number) => {
    if (!player || !hasValidVideo) return;
    const next = Math.max(0, Math.min(position + seconds, duration));
    player.currentTime = next;
    setShowControls(true);
  };

  const cycleRate = () => {
    if (!player || !hasValidVideo) return;
    const rates = [1, 1.25, 1.5, 2];
    const nextRate = rates[(rates.indexOf(rate) + 1) % rates.length];
    player.playbackRate = nextRate;
    setRate(nextRate);
    setShowControls(true);
  };

  const progressPercent = useMemo(() => {
    return duration > 0 ? (position / duration) * 100 : 0;
  }, [position, duration]);

  if (!hasValidVideo) {
    return (
      <View style={[styles.wrapper, styles.emptyWrapper]}>
        <Ionicons name="videocam-off-outline" size={36} color="#fff" />
        <Text style={styles.emptyText}>No video available</Text>
      </View>
    );
  }

  return (
    <Pressable 
      style={styles.wrapper} 
      onPress={() => setShowControls(!showControls)}
    >
      <VideoView
        player={player}
        style={styles.videoSurface}
        nativeControls={false}
        contentFit="cover"
      />

      {showControls && (
        <View style={styles.overlay}>
          {/* Top/Middle Section */}
          <View style={styles.middleControls}>
            <TouchableOpacity style={styles.smallControl} onPress={cycleRate}>
              <Text style={styles.controlLabel}>{rate}x</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallControl} onPress={() => seekBy(-15)}>
              <Ionicons name="play-back-outline" size={34} color="#fff" />
              <Text style={styles.controlLabel}>15</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainControl} onPress={togglePlayPause}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={44} color="#111" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallControl} onPress={() => seekBy(15)}>
              <Ionicons name="play-forward-outline" size={34} color="#fff" />
              <Text style={styles.controlLabel}>15</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallControl}>
              <Ionicons name="timer-outline" size={34} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Bottom Progress Section */}
          <View style={styles.bottomBlock}>
            <Pressable
              style={styles.progressTrack}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              onPress={(event) => {
                const ratio = Math.max(0, Math.min(event.nativeEvent.locationX / trackWidth, 1));
                player.currentTime = duration * ratio;
                setShowControls(true);
              }}
            >
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
            </Pressable>

            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>
                -{formatTime(Math.max(duration - position, 0))}
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  wrapper: {
    height: 230,
    backgroundColor: "#000",
    justifyContent: "center",
    overflow: "hidden",
  },
  emptyWrapper: {
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    color: "#fff",
    fontSize: 14,
  },
  videoSurface: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)", // Slightly darker for better UI visibility
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  middleControls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomBlock: {
    gap: 8,
    paddingBottom: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 999,
    position: "relative",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#fff", // White progress bar looks cleaner
    borderRadius: 999,
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    marginLeft: -9,
    width: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 13,
    minWidth: 58,
  },
  smallControl: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  mainControl: {
    width: 72, // Slightly smaller for a more refined look
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  controlLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
});