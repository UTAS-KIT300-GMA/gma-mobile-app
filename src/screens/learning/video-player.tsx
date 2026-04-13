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

interface Props {
  videoUrl: string;
}

const VideoPlayer: React.FC<Props> = ({ videoUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [trackWidth, setTrackWidth] = useState(1);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasValidVideo = Boolean(videoUrl?.trim());

  const player = useVideoPlayer(hasValidVideo ? videoUrl : null, (player) => {
    player.loop = false;
    player.timeUpdateEventInterval = 0.25;
    player.playbackRate = 1;

    // One-click autoplay:
    // as soon as the player is created for the mounted view, start playback
    try {
      player.play();
    } catch (error) {
      console.log("Initial play attempt failed:", error);
    }
  });

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
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    }

    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!player) return;

    const playingSub = player.addListener("playingChange", ({ isPlaying }) => {
      setIsPlaying(isPlaying);
    });

    const timeSub = player.addListener("timeUpdate", (payload) => {
      setPosition(payload.currentTime ?? 0);
      setDuration(player.duration ?? 0);
    });

    const statusSub = player.addListener("statusChange", ({ status, error }) => {
      if (status === "error") {
        console.error("Video playback error:", error);
      }

      // Backup autoplay in case the first play call happens a little early
      if (status === "readyToPlay") {
        try {
          player.play();
        } catch (playError) {
          console.log("Ready-to-play autoplay failed:", playError);
        }
      }

      if (status === "idle") {
        setIsPlaying(false);
      }
    });

    return () => {
      playingSub.remove();
      timeSub.remove();
      statusSub.remove();
    };
  }, [player]);

  useEffect(() => {
    setPosition(0);
    setDuration(0);
    setIsPlaying(false);
    setShowControls(true);
    setRate(1);
  }, [videoUrl]);

  useEffect(() => {
    if (showControls && hasValidVideo) {
      resetHideTimer();
    }

    return () => {
      clearHideTimer();
    };
  }, [showControls, isPlaying, hasValidVideo]);

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, []);

  const togglePlayPause = () => {
    if (!player || !hasValidVideo) return;

    if (isPlaying) {
      player.pause();
      clearHideTimer();
    } else {
      player.play();
      resetHideTimer();
    }

    setShowControls(true);
  };

  const seekBy = (seconds: number) => {
    if (!player || !hasValidVideo) return;

    const next = Math.max(
      0,
      Math.min(position + seconds, duration || position + seconds)
    );

    player.currentTime = next;
    setPosition(next);
    setShowControls(true);
    resetHideTimer();
  };

  const cycleRate = () => {
    if (!player || !hasValidVideo) return;

    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(rate);
    const nextRate = rates[(currentIndex + 1) % rates.length];

    player.playbackRate = nextRate;
    setRate(nextRate);
    setShowControls(true);
    resetHideTimer();
  };

  const progressPercent = useMemo(() => {
    if (!duration || duration <= 0) return 0;
    return (position / duration) * 100;
  }, [position, duration]);

  const handleSeekFromBar = (ratio: number) => {
    if (!player || !hasValidVideo || !duration || duration <= 0) return;

    const nextTime = Math.max(0, Math.min(duration * ratio, duration));
    player.currentTime = nextTime;
    setPosition(nextTime);
    setShowControls(true);
    resetHideTimer();
  };

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

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
      onPress={() => {
        const nextVisible = !showControls;
        setShowControls(nextVisible);

        if (nextVisible && isPlaying) {
          resetHideTimer();
        } else {
          clearHideTimer();
        }
      }}
    >
      <VideoView
        player={player}
        style={styles.videoSurface}
        nativeControls={false}
        contentFit="cover"
      />

      {showControls && (
        <View style={styles.overlay}>
          <View style={styles.middleControls}>
            <TouchableOpacity style={styles.smallControl} onPress={cycleRate}>
              <Text style={styles.controlLabel}>{rate}x</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallControl}
              onPress={() => seekBy(-15)}
            >
              <Ionicons name="play-back-outline" size={34} color="#fff" />
              <Text style={styles.controlLabel}>15</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mainControl}
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={44}
                color="#111"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallControl}
              onPress={() => seekBy(15)}
            >
              <Ionicons name="play-forward-outline" size={34} color="#fff" />
              <Text style={styles.controlLabel}>15</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallControl}>
              <Ionicons name="timer-outline" size={34} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomBlock}>
            <Pressable
              style={styles.progressTrack}
              onLayout={handleTrackLayout}
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const ratio = Math.max(0, Math.min(locationX / trackWidth, 1));
                handleSeekFromBar(ratio);
              }}
            >
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
              <View
                style={[styles.progressThumb, { left: `${progressPercent}%` }]}
              />
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
    backgroundColor: "rgba(0,0,0,0.12)",
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
    overflow: "visible",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#6D6D6D",
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
    color: "#D3D3D3",
    fontSize: 13,
    minWidth: 58,
  },
  smallControl: {
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  mainControl: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  controlLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
});