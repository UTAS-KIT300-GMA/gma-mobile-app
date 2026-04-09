import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.timeUpdateEventInterval = 0.25;
  });

  useEffect(() => {
    const playingSub = player.addListener("playingChange", ({ isPlaying }) => {
      setIsPlaying(isPlaying);
    });

    const timeSub = player.addListener("timeUpdate", (payload) => {
      setPosition(payload.currentTime ?? 0);
      setDuration(payload.duration ?? 0);
    });

    const statusSub = player.addListener(
      "statusChange",
      ({ status, error }) => {
        if (status === "error") {
          console.error("Video playback error:", error);
        }
      },
    );

    return () => {
      playingSub.remove();
      timeSub.remove();
      statusSub.remove();
    };
  }, [player]);

  const remaining = Math.max(duration - position, 0);

  const formatTime = (seconds: number) => {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0",
      )}`;
    }

    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const resetHideTimer = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }

    hideTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  useEffect(() => {
    if (showControls) {
      resetHideTimer();
    }

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [showControls, isPlaying]);

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }

    setShowControls(true);
    resetHideTimer();
  };

  const seekBy = (seconds: number) => {
    const next = Math.max(
      0,
      Math.min(position + seconds, duration || position + seconds),
    );
    player.currentTime = next;
    setPosition(next);
    setShowControls(true);
    resetHideTimer();
  };

  const cycleRate = () => {
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
    if (!duration || duration <= 0) return;
    const nextTime = Math.max(0, Math.min(duration * ratio, duration));
    player.currentTime = nextTime;
    setPosition(nextTime);
    setShowControls(true);
    resetHideTimer();
  };

  return (
    <Pressable
      style={styles.wrapper}
      onPress={() => {
        setShowControls((prev) => !prev);
        resetHideTimer();
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
              onPress={(event) => {
                const { locationX } = event.nativeEvent;
                const ratio = locationX / 300;
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
              <Text style={styles.timeText}>-{formatTime(remaining)}</Text>
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
