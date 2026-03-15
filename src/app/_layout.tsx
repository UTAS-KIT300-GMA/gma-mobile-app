import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../hooks/useAuth";

export default function RootLayout() {
  const { initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
