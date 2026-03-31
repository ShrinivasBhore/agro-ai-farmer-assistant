# KisanAI - AI Farmer Assistant 🌾 (v4.0)

KisanAI (Kisan Mitra) is a multilingual, AI-powered smart agriculture assistant designed to empower farmers with real-time data, expert advice, and actionable insights. Built with modern web technologies and Google's Gemini AI, it provides a comprehensive suite of tools to improve crop yields and farm management, optimized for rural connectivity.

## 🌟 New in v4.0

*   **📸 Multimodal Crop Scan:** Analyze leaves, full field views, drone imagery, and soil conditions for pests and diseases.
*   **🧠 Personalized AI Chatbot Memory:** Kisan Mitra now remembers your farmer profile, past issues, and crops for tailored advice.
*   **📈 AI Price Forecasting:** 30-day AI-driven mandi price predictions using real-time market data.
*   **⚡ Rural-Optimized Performance:** Code-splitting, WebP image compression, and aggressive caching for fast loading on 2G/3G networks.
*   **🎙️ Hands-Free Voice Mode:** Say "Hey Kisan" to wake the assistant and interact completely hands-free.
*   **🏛️ Real-Time Government Schemes:** Up-to-date agricultural schemes and subsidies fetched via Google Search grounding.

## 📸 Screenshots

*(Placeholders for actual screenshots)*

| Dashboard | AI Chatbot (Kisan Mitra) | Multimodal Scan |
| :---: | :---: | :---: |
| ![Dashboard](https://placehold.co/600x400?text=Dashboard) | ![Chatbot](https://placehold.co/600x400?text=AI+Chatbot) | ![Scan](https://placehold.co/600x400?text=Crop+Scan) |

| Market Prices | Weather & GPS | Crop Planner |
| :---: | :---: | :---: |
| ![Prices](https://placehold.co/600x400?text=Market+Prices) | ![Weather](https://placehold.co/600x400?text=Weather) | ![Planner](https://placehold.co/600x400?text=Crop+Planner) |

## 🛠️ Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **Charts:** Recharts
*   **AI Integration:** Google Gemini API (`@google/genai`) with Search Grounding
*   **APIs:** OpenWeatherMap API
*   **State Management:** React Context API
*   **Routing:** React Router DOM (with Lazy Loading)

## 🚀 Setup Guide

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Gemini API Key
*   An OpenWeatherMap API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/kisan-ai.git
    cd kisan-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your API keys:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key_here
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to `http://localhost:3000` (or the port specified by Vite/Express).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open-source and available under the MIT License.
