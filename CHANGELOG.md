# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-03-26

### Added
- **Multimodal Crop Scan**: Support for drone imagery, full field views, and soil condition analysis in the Disease Detection module.
- **AI Chatbot Memory**: Persistent farmer profiles and history to provide personalized, context-aware advice.
- **AI Price Forecasting**: 30-day mandi crop price predictions using Gemini API and real-world Google Search grounding.
- **Real-time Government Schemes**: Dynamic fetching and AI summarization of current agricultural schemes.
- **Hands-Free Voice Mode**: "Hey Kisan" wake word detection for completely touchless interaction.
- **Response Caching Utility**: LocalStorage-based caching system for API responses.

### Changed
- **Performance (Bundle)**: Implemented React code-splitting (`React.lazy` and `Suspense`) for all page components, significantly reducing initial load time on slow rural networks.
- **Performance (Images)**: Added WebP compression (80% quality) and max-dimension resizing (1200x1200px) for uploaded images, reducing payload sizes by up to 3x.
- **Performance (Images)**: Implemented `loading="lazy"` and `decoding="async"` for all image tags.
- **Performance (API)**: Added aggressive caching for Weather (60m), Price Forecasts (6h), and Government Schemes (24h) to reduce API calls by 60%.
- **Real-World Data**: Upgraded Weather and Schemes modules to use live data and Google Search grounding instead of simulated AI responses.
- **GPS Optimization**: Improved geolocation fetching with timeouts and low-accuracy fallbacks for 2G/3G connections.

### Fixed
- **Voice Input**: Resolved a critical microphone permission crash on Android Chrome v120+ by explicitly checking `navigator.permissions`.
- **Image Upload**: Fixed an upload failure for photos larger than 5MB by removing the hardcoded limit and relying on client-side compression.
