import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type Category = "all" | "connect" | "grow" | "thrive";

export type UserDoc = {
  email: string;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other" | null;
  dateOfBirth: FirebaseFirestoreTypes.Timestamp | null;
  role: string;
  selectedTags: string[];
  onboardingComplete: boolean;
  createdAt: FirebaseFirestoreTypes.FieldValue | FirebaseFirestoreTypes.Timestamp | null;
  // Optional fields used by social providers
  photoURL?: string;
  authProvider?: "google" | "facebook" | "password" | string;
};

export type EventDoc = {
  id: string;
  title: string;
  description: string;
  category: Category;
  address: string;
  location: FirebaseFirestoreTypes.GeoPoint;
  image: string; // URL string
  type: "free" | "paid";
  interestTags?: string[]; // Array of InterestKeys
  isAd?: boolean; // Flag to indicate if the event is an ad
  
  // Use Firestore Timestamp for better date handling
  dateTime: FirebaseFirestoreTypes.Timestamp; 
  
  // Better defined ticket structure
  totalTickets: number;
  ticketsSold?: number;
  attendees?: string[]; // Array of user UIDs

  memberPrice: number;
  nonMemberPrice: number;

  ticketPrices?: {
    member: number;
    nonMember: number;
  };
};

export type LearningDoc ={
  id: string;
  title: string;
  duration: string;
  description?: string;
  thumbnailUrl?: string;
  videoId?: string;
  cloudinaryPublicId?: string;
  accessType: "free" | "paid";
  isBookmarked: boolean;
  fileId?: string;
  interestTags?: string[];
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string; 
}
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
    { key: "Entrepreneurship", label: "Entrepreneurship" },
    { key: "Workshops & Skill Share", label: "Workshops & Skill Share" },
    { key: "Mentoring & Coaching", label: "Mentoring & Coaching" },
    { key: "Financial Literacy & Investing", label: "Financial Literacy & Investing" },
    { key: "Gym & Fitness", label: "Gym & Fitness" },
    { key: "Real Estate & Home Ownership", label: "Real Estate & Home Ownership"},
    { key: "Team Sports", label: "Team Sports" },
    { key: "Public Speaking & Communication",   label: "Public Speaking & Communication" },
    { key: "Yoga & Pilates", label: "Yoga & Pilates" },
    { key: "Running & Walking", label: "Running & Walking" },
    { key: "Hiking & Outdoor Adventure", label: "Hiking & Outdoor Adventure" },
    { key: "Wellness & Retreats", label: "Wellness & Retreats" },
    { key: "Climbing & Extreme Sports", label: "Climbing & Extreme Sports" },
    { key: "Cycling & Riding", label: "Cycling & Riding" },
    { key: "Healthy Eating", label: "Healthy Eating" },
  ];

export const EVENT_CATEGORIES = [
  {
    category: "Connect",
    focus: "Social & Cultural",
    items: [
      { id: 1, name: "Social Networking" },
      { id: 2, name: "Cultural & Community Events" },
      { id: 3, name: "Creative Arts & Crafts" },
      { id: 4, name: "Games, Trivia & Bingo" },
      { id: 5, name: "Food & Cooking" },
      { id: 6, name: "Music & Karaoke" },
      { id: 7, name: "Book Club" },
      { id: 8, name: "Theatre & Movies" }
    ]
  },
  {
    category: "Grow",
    focus: "Professional & Skills",
    items: [
      { id: 9, name: "Professional Networking" },
      { id: 10, name: "Career Development & Info" },
      { id: 11, name: "Workshops & Skill Share" },
      { id: 12, name: "Mentoring & Coaching" },
      { id: 13, name: "Financial Literacy & Investing" },
      { id: 14, name: "Real Estate & Home Ownership" },
      { id: 15, name: "Public Speaking & Communication" },
      { id: 16, name: "Entrepreneurship" }
    ]
  },
  {
    category: "Thrive",
    focus: "Health & Wellness",
    items: [
      { id: 17, name: "Running & Walking" },
      { id: 18, name: "Hiking & Outdoor Adventure" },
      { id: 19, name: "Yoga & Pilates" },
      { id: 20, name: "Gym & Fitness" },
      { id: 21, name: "Team Sports" },
      { id: 22, name: "Wellness & Retreats" },
      { id: 23, name: "Climbing & Extreme Sports" },
      { id: 24, name: "Cycling & Riding" },
      { id: 25, name: "Healthy Eating" }
    ]
  }
] as const;

// Extracts the individual item shape
export type EventItem = {
  id: number;
  name: string;
};

// Extracts the Category names: "Connect" | "Grow" | "Thrive"
export type CategoryName = (typeof EVENT_CATEGORIES)[number]["category"];

// Extracts the Focus strings: "Social & Cultural" | etc.
export type CategoryFocus = (typeof EVENT_CATEGORIES)[number]["focus"];

// Defines the structure for a single top-level category object
export type EventCategoryGroup = {
  readonly category: CategoryName;
  readonly focus: CategoryFocus;
  readonly items: readonly EventItem[];
};


// Represents the available payment methods in the application.
export type PaymentMethod =
  | "card"
  | "apple"
  | "google"
  | "afterpay";

export type Booking = {
  id: string;
  eventId: string;
  ticketCount: number;
  totalPaid: number;
  status: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;

  event: {
    title: string;
    image: string;
    dateTime: FirebaseFirestoreTypes.Timestamp;
    address: string;
  };
};
