import { colors } from "@/theme/ThemeProvider";
import { doc, setDoc } from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../services/firebase";

type InterestKey =
  | "communityEvents"
  | "networking"
  | "careerDevelopment"
  | "workshops"
  | "hobbies"
  | "volunteering";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<InterestKey, boolean>>({
    communityEvents: false,
    networking: false,
    careerDevelopment: false,
    workshops: false,
    hobbies: false,
    volunteering: false,
  });
  const [saving, setSaving] = useState(false);

  const selectedTags = useMemo(() => {
    return (Object.keys(selected) as InterestKey[]).filter((k) => selected[k]);
  }, [selected]);

  const toggle = (key: InterestKey) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderPill = (label: string, key: InterestKey) => {
    const isActive = selected[key];
    return (
      <TouchableOpacity
        key={key}
        style={[styles.pill, isActive && styles.pillActive]}
        onPress={() => toggle(key)}
      >
        <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>U</Text>
          </View>
          <Text style={styles.username}>User name</Text>
        </View>

        <Text style={styles.heading1}>Select Your Interests (5)</Text>

        <Text style={styles.heading2}>
          Connect (community events, networking)
        </Text>
        <View style={styles.row}>
          {renderPill("Community Events", "communityEvents")}
          {renderPill("Networking", "networking")}
        </View>

        <Text style={styles.heading2}>Grow (career, workshop)</Text>
        <View style={styles.row}>
          {renderPill("Career Development", "careerDevelopment")}
          {renderPill("Workshops", "workshops")}
        </View>

        <Text style={styles.heading2}>Thrive (hobbies, volunteering)</Text>
        <View style={styles.row}>
          {renderPill("Hobbies", "hobbies")}
          {renderPill("Volunteering", "volunteering")}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
          onPress={async () => {
            if (saving) return;
            const uid = auth.currentUser?.uid;
            if (!uid) {
              Alert.alert("Not signed in", "Please log in again.");
              router.replace("/");
              return;
            }
            setSaving(true);
            try {
              console.log("selectedTags", selectedTags);
              await setDoc(
                doc(db, "users", uid),
                { interestTags: selectedTags },
                { merge: true },
              );
              router.replace("/home");
            } catch (e: any) {
              Alert.alert("Save failed", e?.message ?? "Something went wrong.");
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingTop: 64,
  },
  box: {
    backgroundColor: colors.secondary,
    alignSelf: "center",
    borderRadius: 12,
    padding: 24,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarInitials: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },
  username: {
    color: colors.textOnSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
  heading1: {
    color: colors.textOnSecondary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  heading2: {
    color: colors.textOnSecondary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c4c4c4",
    alignItems: "center",
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: "#a64d79",
    borderColor: "#a64d79",
  },
  pillText: {
    color: "#c4c4c4",
    fontSize: 13,
  },
  pillTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#a64d79",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
