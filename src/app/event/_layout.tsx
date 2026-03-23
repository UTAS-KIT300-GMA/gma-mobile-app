import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';

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
        options={{ title: 'Event Details' }} 
      />
      <Stack.Screen 
      // efines the 'Booking Confirmed' screen and hides the back button.
        name="confirmation" 
        options={{ title: 'Booking Confirmed', headerLeft: () => null }} 
      />
    </Stack>
  );
}