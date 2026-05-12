import "@react-native-firebase/app";
import messaging from "@react-native-firebase/messaging";

messaging().setBackgroundMessageHandler(async () => {
  // Notification payloads are displayed by the OS; data-only messages can be handled here if needed.
});

import "expo-router/entry";
