# Triplex

Triplex is a comprehensive Flutter application designed for trip planning and social sharing. It allows users to create detailed trip itineraries, interact with others through a social feed, and discover new destinations on an interactive map.

## Features

### Trip Planning
- Create detailed trip plans with titles, captions, and goals.
- Add waypoints and stops to build a complete itinerary.
- Route mapping and timeline visualization for your trips.

### Interactive Maps
- View trips and routes on an integrated, interactive map.
- Location tracking and permission handling for a seamless experience.
- Custom map styling support.

### Social Feed
- Explore trips created by other users in a social feed.
- Like, react, and comment on trip plans.
- Discover new destinations and get inspired for your next adventure.

### Messaging
- Built-in chat and messaging features to connect with other travelers.

### User Profiles & Accounts
- Customizable user profiles.
- Comprehensive account management center.
- Secure authentication system.

### App Settings & Architecture
- Beautiful UI with liquid glass widgets, progressive blur, and animations.
- Advanced caching for offline support and faster load times.
- Robust state management using Riverpod and functional programming paradigms.

## Getting Started

This project is a starting point for a Flutter application.

### Prerequisites
- Flutter SDK (>=3.5.0 <4.0.0)
- Dart SDK

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd triplex
   ```
3. Install dependencies:
   ```bash
   flutter pub get
   ```
4. Run the app:
   ```bash
   flutter run
   ```

## Tech Stack & Packages
- **State Management**: `flutter_riverpod`, `riverpod_annotation`
- **Navigation**: `go_router`
- **Database & Caching**: `drift` (SQLite), `flutter_cache_manager`, `dio_cache_interceptor`
- **Networking**: `dio`, `http`
- **UI & Animations**: `liquid_glass_widgets`, `flutter_animate`, `timelines_plus`, `progressive_blur`
- **Maps**: `google_maps_flutter`, `polyline_tools`, `geolocator`
- **Functional Programming**: `fpdart`
