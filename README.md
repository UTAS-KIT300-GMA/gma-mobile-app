# 🌏 GMA Connect
**Tasmania's Migrant Integration Platform**

GMA Connect is a mobile-first digital ecosystem built to support skilled migrants in Tasmania through intelligent event discovery, professional growth tracking, and community integration. 

## 🛠 Technical Stack

* **Language:** TypeScript (Strict typing for robust, error-resistant mobile development)
* **Frontend:** React Native (Expo)
* **Routing:** Expo Router (File-based routing)
* **Backend:** Firebase (Authentication & Firestore)
* **Payments:** Google Play Billing Library (In-App Subscriptions)
* **Architecture:** Modular Service-Controller-UI pattern

## 🏗 Project Structure

The codebase strictly follows a separation of concerns, dividing logic, navigation, and presentation:

* **`/app` (Routes):** Manages screen-specific logic and navigation "handshakes" (e.g., passing `eventId` safely).
* **`/services` (Logic):** Handles raw Firebase API calls and business logic (e.g., `authService.ts`).
* **`/components` (UI):** Reusable, styled, "dumb" components (e.g., `<EventCard />`).
* **`/theme`:** Centralized styling and color palettes.

## ✨ Core Features & Technical Highlights

* **End-to-End Type Safety:** Utilizes TypeScript interfaces for Firebase documents and component props, ensuring reliable data structures and predicting errors at compile time.
* **Atomic Registration:** The `authService` implements an automatic rollback. If a user's Firestore profile creation fails during sign-up, the Firebase Auth account is immediately deleted to prevent orphaned "ghost" accounts.
* **Smart Navigation Handshakes:** Implements strict parameter handling (`eventId`) and `finally` blocks in route controllers to guarantee loading states resolve, preventing infinite spinners.
* **Optimistic Bookmarking:** UI updates instantly when saving events, syncing with Firestore in the background.
* **Subscription Model:** Handles free vs. premium tier access via Google Play Store integration, restricting access to member-only events.

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed on your local machine:

* **[Git](https://git-scm.com/):** For version control and cloning the repository.
* **[Node.js](https://nodejs.org/) & npm:** The JavaScript/TypeScript runtime and package manager required to run the Expo server.
* **[Expo CLI](https://docs.expo.dev/):** The command-line tool for React Native app development.
* **[Android Studio](https://developer.android.com/studio):** For running virtual device emulators (alternatively, you can use the Expo Go app on a physical phone).
* **Code Editor:** [Visual Studio Code](https://code.visualstudio.com/) is highly recommended, especially for its excellent TypeScript and React Native support.

### 1. Installation
Clone the repository and install dependencies:
```bash
# Clone the repository into a local folder named 'gma-connect'
git clone https://github.com/UTAS-KIT300-GMA/gma-mobile-app.git gma-connect

# Navigate into the project directory
cd gma-connect

# Install all required packages
npm install
