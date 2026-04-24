// This file acts as the 'Route' (the URL)
import ManagePaymentMethodScreen from "@/screens/profile/manage-payment-method-UI";

/**
 * @summary Renders the payment-method management route wrapper.
 * @throws {never} Pure route rendering does not throw.
 * @Returns {React.JSX.Element} Manage payment method UI.
 */
export default function ManagePaymentMethodRoute() {
  // It simply renders the UI you already built
  return <ManagePaymentMethodScreen />;
}