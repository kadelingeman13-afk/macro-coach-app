# Setup Guide - MacroCoach

Complete step-by-step setup to get the app running locally and deployed.

## 1. Clone and Install

```bash
git clone https://github.com/kadelingeman13-afk/macro-coach-app.git
cd macro-coach-app
npm install
```

## 2. Get API Keys (All Free)

### Firebase Setup

1. Go to https://console.firebase.google.com
2. Click "Create Project"
3. Name it "macro-coach"
4. Enable Google Analytics (optional)
5. Create project
6. Go to Project Settings (⚙️ icon)
7. Scroll to "Your apps" → Click "</> Web"
8. Copy the config object
9. Create `src/config/firebase.ts` (see example below)

### Claude API Key

1. Go to https://console.anthropic.com
2. Sign up / Log in
3. Click "API Keys" in sidebar
4. Click "Create Key"
5. Copy and save in `.env`

### Create `.env` file

```bash
# In project root, create .env file:
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_KEY_HERE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN_HERE
EXPO_PUBLIC_FIREBASE_PROJECT_ID=YOUR_ID_HERE
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET_HERE
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID_HERE
EXPO_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID_HERE
EXPO_PUBLIC_CLAUDE_API_KEY=YOUR_CLAUDE_KEY_HERE
```

## 3. Firebase Configuration

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

## 4. Run Locally

```bash
npm start

# Then:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Press 'w' for web browser
```

## 5. Deploy to App Stores (Later)

### iOS App Store

```bash
expо publish:ios
# OR use Expo Go for testing first
```

### Google Play Store

```bash
expo publish:android
```

Full guide: https://docs.expo.dev/submit/ios/ and https://docs.expo.dev/submit/android/

## Troubleshooting

**"Cannot find module" errors:**
```bash
rm -rf node_modules
npm install
```

**Expo server won't start:**
```bash
npm start -- --clear
```

**Firebase auth not working:**
- Check .env file has correct keys
- Make sure Firebase project has Authentication enabled
- Check firestore.rules allows read/write for auth users

**Claude API errors:**
- Verify API key is correct in .env
- Check you have API quota available
- Check request format matches Claude API docs

## Next Steps

1. Run the app locally
2. Test onboarding flow
3. Add test data
4. Test AI coaching features
5. Iterate based on UX feedback
