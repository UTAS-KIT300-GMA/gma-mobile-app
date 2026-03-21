import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "../../components/AppHeader";

export default function LearningScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="GMA Connect" showNotiAndProfile/>
      <View style={styles.container}>
        <Text style={styles.text}>To be updated</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16, fontWeight: "700", color: "#374151" },
});
