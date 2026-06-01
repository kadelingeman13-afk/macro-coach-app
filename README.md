# MacroCoach - AI-Powered Nutrition Tracking

A React Native app that combines AI coaching with macro tracking to make nutrition simple and automatic.

## Features

- 🤖 AI nutrition coach (powered by Claude)
- 📊 Smart macro tracking with exchange system
- 🔄 Meal structure customization (auto-splits macros)
- 🍽️ Food logging with Nutritionix database
- 📈 Progress tracking (weight, water, sleep, habits)
- 🎯 Daily coaching with "Fix My Day" feature
- 💧 Water, weight, sleep tracking
- 📱 Cross-platform (iOS, Android, Web)

## Tech Stack

- **Frontend:** React Native (Expo)
- **State Management:** Zustand
- **Backend:** Firebase
- **AI:** Claude API
- **Nutrition Data:** Nutritionix + USDA FoodData Central

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
# Clone the repo
git clone https://github.com/kadelingeman13-afk/macro-coach-app.git
cd macro-coach-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your API keys (see SETUP.md)
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## API Keys Needed

1. **Claude API** — Get free $5 credit at https://console.anthropic.com
2. **Firebase** — Create project at https://console.firebase.google.com
3. **Nutritionix** — Free, no key required
4. **USDA FoodData Central** — Free, API key optional

See `SETUP.md` for detailed setup instructions.

## Project Structure

```
src/
├── screens/          # App screens (onboarding, dashboard, etc)
├── components/       # Reusable UI components
├── services/         # API integrations
├── store/           # Zustand state management
├── types/           # TypeScript types
├── utils/           # Helper functions
└── styles/          # Theme and styling
App.tsx              # Entry point
```

## Development

### Contributing

This is a solo project in development. For suggestions, open an issue.

### Testing

```bash
npm test
```

## License

MIT License - See LICENSE.md

## Support

For issues or questions, open a GitHub issue.
