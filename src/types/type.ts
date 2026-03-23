import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Category = "all" | "connect" | "growth" | "thrive";

export type EventDoc = {
  id: string;
  title: string;
  description: string;
  category: Category;
  address: string;
  image: string; // URL string
  type: "free" | "paid";
  
  // Use Firestore Timestamp for better date handling
  dateTime: FirebaseFirestoreTypes.Timestamp; 
  
  // Better defined ticket structure
  totalTickets: number;
  attendees?: string[]; // Array of user UIDs
  
  // Pricing structure to support Member/Non-Member logic
  memberPrice: number;
  nonMemberPrice: number;
  
  // Optional: 
  ticketPrices?: {
    member: number;
    nonMember: number;
  };
};

// Stores the valid spelling for every Hobart category.
export type InterestKey =
  | "Social Networking" | "Cultural & Community Events" | "Creative Arts & Crafts"
  | "Games, Trivia & Bingo" | "Food & Cooking" | "Music & Karaoke"
  | "Book Club" | "Theatre & Movies" | "Professional Networking"
  | "Career Development & Info" | "Workshops & Skill Share" | "Mentoring & Coaching"
  | "Financial Literacy & Investing" | "Real Estate & Home Ownership" 
  | "Public Speaking & Communication" | "Entrepreneurship" | "Running & Walking"
  | "Hiking & Outdoor Adventure" | "Yoga & Pilates" | "Gym & Fitness"
  | "Team Sports" | "Wellness & Retreats" | "Climbing & Extreme Sports"
  | "Cycling & Riding" | "Healthy Eating";
  
  // Data store for UI
  export const INTEREST_TAGS: { key: InterestKey; label: string }[] = [
  { key: "Social Networking", label: "Social Networking" },
  { key: "Cultural & Community Events", label: "Cultural & Community Events" },
  { key: "Creative Arts & Crafts", label: "Creative Arts & Crafts" },
  { key: "Games, Trivia & Bingo", label: "Games, Trivia & Bingo" },
  { key: "Food & Cooking", label: "Food & Cooking" },
  { key: "Music & Karaoke", label: "Music & Karaoke" },
  { key: "Book Club", label: "Book Club" },
  { key: "Theatre & Movies", label: "Theatre & Movies" },
  { key: "Professional Networking", label: "Professional Networking" },
  { key: "Career Development & Info", label: "Career Development & Info" },
  { key: "Workshops & Skill Share", label: "Workshops & Skill Share" },
  { key: "Mentoring & Coaching", label: "Mentoring & Coaching" },
  { key: "Financial Literacy & Investing", label: "Financial Literacy & Investing" },
  { key: "Real Estate & Home Ownership", label: "Real Estate & Home Ownership" },
  { key: "Public Speaking & Communication", label: "Public Speaking & Communication" },
  { key: "Entrepreneurship", label: "Entrepreneurship" },
  { key: "Running & Walking", label: "Running & Walking" },
  { key: "Hiking & Outdoor Adventure", label: "Hiking & Outdoor Adventure" },
  { key: "Yoga & Pilates", label: "Yoga & Pilates" },
  { key: "Gym & Fitness", label: "Gym & Fitness" },
  { key: "Team Sports", label: "Team Sports" },
  { key: "Wellness & Retreats", label: "Wellness & Retreats" },
  { key: "Climbing & Extreme Sports", label: "Climbing & Extreme Sports" },
  { key: "Cycling & Riding", label: "Cycling & Riding" },
  { key: "Healthy Eating", label: "Healthy Eating" }
];