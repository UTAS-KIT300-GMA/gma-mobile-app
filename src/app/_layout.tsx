import { useAuth } from "@/hooks/useAuth";
import { Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/* The `RootLayout` component serves as the main layout for the app. 
It checks if the authentication state is still initialising and displays a loading indicator if it is. 
Once the initialisation is complete, it renders the child components using the `Slot` component 
from `expo-router`, which allows for nested routing and layout management. This structure ensures that 
the app can handle authentication states gracefully while providing a consistent layout for all screens. */
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
