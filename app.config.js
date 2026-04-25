import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    plugins: [
      [
        "react-native-fbsdk-next",
        {
          appID: "2197146364354785",
          clientToken: process.env.FB_CLIENT_TOKEN,
          displayName: "GMA Connect",
          scheme: "fb2197146364354785",
        },
      ],
      "@react-native-firebase/app",
      "expo-build-properties",
      "expo-video", // ✅ ADD THIS LINE
    ],
  };
};
