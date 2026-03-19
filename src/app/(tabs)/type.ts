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
export type Category = "all" | "connect" | "growth" | "thrive";
