import { useTheme } from '@/theme/ThemeProvider';
import { Stack } from 'expo-router';

/**
 * @summary Configures stack headers for event-related routes.
 * @throws {never} Pure layout rendering does not throw.
 * @Returns {React.JSX.Element} Event stack navigator.
 */
export default function EventLayout() {
  // Stores the active color palette and style settings in the theme var
  const theme = useTheme(); 

  return (
    <Stack
      screenOptions={{
        // Maps the secondary color store to the header's background.
        headerStyle: { backgroundColor: theme.secondary },
        
        // Maps the primary color store to the text and back icons.
        headerTintColor: theme.primary,

        // Sets the title font weight to bold for better visibility.
        headerTitleStyle: { fontWeight: 'bold' },

        // Hides the header shadow to keep the UI clean and flat.
        headerShadowVisible: false,

      }}
    >
      <Stack.Screen 
      //Defines the 'Event Details' screen and stores its title.
        name="event-details" 
        options={{ title: 'Event Details', headerShown: false }}
      />
      <Stack.Screen 
      // Defines the 'Booking Confirmed' screen and hides the back button.
        name="confirmation" 
        options={{ title: 'Booking Confirmed', headerLeft: () => null, headerShown: false }}
      />
    <Stack.Screen
        name="booking"
        options={{ title: 'Booking', headerLeft: () => null, headerShown: false }}
    />

    <Stack.Screen
  name="payment"
  options={{
    title: "Payment",
    headerStyle: { backgroundColor: "#FFFFFF" },
    headerTintColor: theme.primary,
    headerTitleStyle: { fontWeight: "bold" },
    headerShadowVisible: false,
  }}
/>
    </Stack>
  );
}