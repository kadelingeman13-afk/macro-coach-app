## Quick Start Guide

### 1. **Clone & Install**
```bash
git clone https://github.com/kadelingeman13-afk/macro-coach-app.git
cd macro-coach-app
npm install
```

### 2. **Get Free API Keys** (All Free!)

#### Claude API (for AI coaching)
- Go to https://console.anthropic.com
- Get free $5 credit (no credit card required for free tier)
- Create an API key

#### Firebase (for data storage)
- Go to https://console.firebase.google.com
- Create new project
- Go to Project Settings → Your apps → Web
- Copy the config object

#### Nutritionix (for food search)
- Free! No key needed for basic usage
- Optional: Get app keys at https://www.nutritionix.com/api

### 3. **Setup Environment Variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

### 4. **Run the App**
```bash
npm start

# Then press:
# 'i' for iOS simulator
# 'a' for Android emulator  
# 'w' for web browser
```

---

## What's Included

### Core Features ✅
- 📊 **Macro Tracking**: Track calories, protein, carbs, fat by meal
- 🤖 **AI Coaching**: Claude AI provides meal suggestions & "Fix My Day" feature
- 🍽️ **Food Database**: Search 500K+ foods from Nutritionix
- 📈 **Auto Calculations**: BMR, TDEE, macro targets based on your profile
- 🎯 **Meal Structure**: Customize meals and auto-split macros
- 💾 **State Management**: Zustand for fast, persistent state

### Screens
1. **Onboarding** - Profile setup (age, height, weight, goals)
2. **Meal Setup** - Choose meals & macro split style
3. **Dashboard** - Today's tracking & macro progress
4. **Food Logging** - Search & add foods to meals
5. **Fix My Day** - AI coaching for rest of day

### Tech Stack
- **React Native** + Expo
- **TypeScript** for type safety
- **Zustand** for state management
- **React Navigation** for routing
- **Axios** for API calls
- **Claude API** for AI coaching
- **Nutritionix** for food database

---

## File Structure

```
src/
├── types/          # TypeScript interfaces
├── utils/          # Calculations & formatting
├── store/          # Zustand state management
├── services/       # API integrations (Claude, Nutritionix)
├── screens/        # UI screens
│   ├── OnboardingScreen.tsx
│   ├── MealSetupScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── FoodLoggingScreen.tsx
│   └── FixMyDayScreen.tsx
└── App.tsx         # Main navigation

.env.example       # Template for API keys
package.json       # Dependencies
tsconfig.json      # TypeScript config
app.json          # Expo config
```

---

## Next Steps to Improve

### Phase 2 (Medium Priority)
- [ ] Progress charts (weight trends, macro consistency)
- [ ] Habit tracking system
- [ ] Weekly reports & insights
- [ ] Barcode scanning for quick food add
- [ ] Favorites/recent foods
- [ ] Custom recipes

### Phase 3 (Nice to Have)
- [ ] Push notifications for reminders
- [ ] Export data (PDF reports)
- [ ] Share progress with coach
- [ ] Offline mode
- [ ] Multiple users
- [ ] Dark mode

### Phase 4 (Backend)
- [ ] Firebase integration (real database)
- [ ] User authentication
- [ ] Cloud sync
- [ ] Backup/restore

---

## Development Tips

**Hot Reload**: Changes auto-reload on save  
**Debug**: Use React Native Debugger for console logs  
**State**: Check Zustand store in browser dev tools  
**API Testing**: Use Postman for API testing before integrating

---

## Troubleshooting

**"Cannot find module" errors**
```bash
rm -rf node_modules
npm install
```

**API key not working**
- Check `.env` file exists and is correct
- Make sure `EXPO_PUBLIC_` prefix is used
- Verify API key is active in respective console

**Nutritionix search returns nothing**
- Try different search term
- Service might be temporarily down
- Optional: Get free API keys at https://www.nutritionix.com/api

---

## Support

For issues or questions:
1. Check console logs in Expo Go app
2. Verify API keys are correct
3. Clear cache: `expo start --clear`

---

**Built with ❤️ for macro tracking. Now go crush your goals! 💪**
