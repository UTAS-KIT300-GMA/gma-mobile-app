import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { ThemeProvider } from "../theme/ThemeProvider";

const STRIPE_PUBLISHABLE_KEY = "xyz";

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="index" />
          <Stack.Screen name="pages" />
        </Stack>
      </ThemeProvider>
    </StripeProvider>
  );
}
