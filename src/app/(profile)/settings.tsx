// This file acts as the 'Route' (the URL)
import NotificationSettingsUI from "@/screens/profile/notification-settings-UI";

/**
 * @summary Renders the notification settings route wrapper.
 * @throws {never} Pure route rendering does not throw.
 * @Returns {React.JSX.Element} Notification settings UI.
 */
export default function NotificationSettingsRoute() {
  // It simply renders the UI you already built
  return <NotificationSettingsUI />;
}