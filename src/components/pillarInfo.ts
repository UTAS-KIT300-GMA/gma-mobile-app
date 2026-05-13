import { Alert } from "react-native";

const PILLAR_INFO_MESSAGE: Record<"connect" | "grow" | "thrive", string> = {
  grow:
    "Career-oriented pillar: networking, workshops and learning so migrants can use their skills, grow professionally and improve employment prospects.",

  connect:
    "Community pillar: cultural, social and lifestyle events in one discoverable place to reduce isolation and help you take part locally.",

  thrive:
    "Lifestyle pillar: activities and communities that match your interests and wellbeing, supporting a stronger sense of belonging in Tasmania.",
};

/**
 * Shows an alert explaining Connect / Grow / Thrive (onboarding and similar UX).
 */
export function showPillarCategoryInfo(pillarKey: string) {
  const key = pillarKey.toLowerCase();
  if (key !== "connect" && key !== "grow" && key !== "thrive") return;
  const message = PILLAR_INFO_MESSAGE[key];
  const title =
    key === "connect" ? "Connect" : key === "grow" ? "Grow" : "Thrive";
  Alert.alert(title, message);
}
