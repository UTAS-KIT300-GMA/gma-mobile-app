
/* Defines the `EventDoc` type, which represents the structure of an event document in the application. */
export type EventDoc = {
  ticketPrices: any;
  category: string;
  id: string;
  description: string;
  title?: string;
  address?: string;
  type?: string;
  totalTickets: any;
  dateTime?: any;
  image?: string;
};

/* Defines the `Category` type, which represents the different categories of events or content in the application.

- The `Category` type is a union type that can take on one of the following string values: "all", "connect", "growth", or "thrive".
- This type is used to categorise events or content, allowing for filtering and organisation based on these categories.
- The "all" category likely represents a catch-all category that includes all events or content, while the other categories represent specific themes or focuses within the application. */
export type Category = "all" | "connect" | "growth" | "thrive";
