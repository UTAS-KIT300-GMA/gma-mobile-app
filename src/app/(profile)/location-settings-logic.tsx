// This file acts as the 'Route' (the URL)
import LocationSettingsUI from "@/screens/profile/notification-settings-UI";

/**
 * @summary Renders the location settings screen route wrapper.
 * @throws {never} Pure route rendering does not throw.
 * @Returns {React.JSX.Element} Location settings UI.
 */
export default function LocationSettingsRoute() {
  // It simply renders the UI you already built
  return <LocationSettingsUI />;
}