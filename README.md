# 🚀 SwapUp - Community Skill Sharing Platform

A modern, offline-first community skill sharing platform built with React, TypeScript, and a local database system. Connect with neighbors, learn new skills, and share your expertise in a credit-based exchange system.

## ✨ Features

### 🎯 Core Functionality
- **Skill Exchange**: Browse and offer skills in your community
- **Credit System**: Earn and spend credits for skill exchanges
- **Real-time Chat**: Communicate with other users during skill swaps
- **Location-based**: Find skills and users near you
- **Reviews & Ratings**: Build reputation through community feedback
- **Volunteer Opportunities**: Connect with local NGOs and volunteer work

### 💾 Database Options
- **Local Database**: Offline-first localStorage implementation
- **Firebase Firestore**: Cloud database with real-time sync
- **Firebase Authentication**: Secure user authentication
- **Hybrid Mode**: Switch between local and cloud databases
- **Type Safety**: Full TypeScript support

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile
- **Interactive Maps**: Location-based skill discovery
- **AI Chatbot**: Get help and suggestions
- **Modern UI**: Clean, intuitive interface

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet, React Leaflet
- **Database**: 
  - LocalStorage with custom database service (offline)
  - Firebase Firestore (cloud with real-time sync)
- **Authentication**: 
  - Local authentication (offline)
  - Firebase Authentication (cloud)
- **AI**: Google Gemini AI integration
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swapup---community-skill-sharing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase (Optional)**
   ```bash
   # For Firebase integration
   npm install firebase
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
swapup---community-skill-sharing/
├── components/           # Reusable UI components
│   ├── Chatbot.tsx      # AI chatbot component
│   ├── Header.tsx       # Navigation header
│   ├── Map.tsx          # Interactive map component
│   └── SkillCard.tsx    # Skill display card
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
├── pages/               # Application pages
│   ├── HomePage.tsx     # Landing page
│   ├── LoginPage.tsx    # User authentication
│   ├── BrowsePage.tsx   # Skill browsing
│   ├── DashboardPage.tsx # User dashboard
│   └── ChatPage.tsx     # Chat interface
├── services/            # API and database services
│   ├── api.ts           # Original mock API
│   ├── apiWithLocalDB.ts # Local database API
│   ├── apiWithFirebase.ts # Firebase API
│   ├── localDatabase.ts # Local database service
│   ├── firebaseConfig.ts # Firebase configuration
│   └── geminiService.ts # AI service
├── types.ts             # TypeScript type definitions
└── App.tsx              # Main application component
```

## 🗄️ Database Architecture

### Collections
- **Users**: User profiles, authentication, credits
- **Skills**: Skills offered by users
- **Swaps**: Skill exchange requests and status
- **Messages**: Chat messages between users
- **Reviews**: User reviews and ratings
- **Notifications**: User notifications

### Database Options

#### 1. Local Database (Offline)
```typescript
// Local database operations
await localDb.createUser(user);
const user = await localDb.getUserById(id);
await localDb.updateUser(id, updates);
```

#### 2. Firebase Firestore (Cloud)
```typescript
// Firebase operations
import { collection, addDoc, getDoc, updateDoc } from 'firebase/firestore';

// Create
await addDoc(collection(db, 'users'), user);

// Read
const userDoc = await getDoc(doc(db, 'users', id));

// Update
await updateDoc(doc(db, 'users', id), updates);
```

### Authentication Options

#### 1. Local Authentication
```typescript
// Local auth (offline)
const user = await localDb.getCurrentUser();
await localDb.setCurrentUserId(userId);
```

#### 2. Firebase Authentication
```typescript
// Firebase auth
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Sign in
await signInWithEmailAndPassword(auth, email, password);

// Sign up
await createUserWithEmailAndPassword(auth, email, password);
```

## 🔄 API Migration

### Database Options

#### 1. Local Database (Offline)
```typescript
// Change from:
import { getCurrentUser, login } from './services/api';

// To:
import { getCurrentUser, login } from './services/apiWithLocalDB';
```

#### 2. Firebase Database (Cloud)
```typescript
// Change from:
import { getCurrentUser, login } from './services/api';

// To:
import { getCurrentUser, login } from './services/apiWithFirebase';
```

### Database Initialization

#### Local Database
```typescript
// In App.tsx
useEffect(() => {
  const initDb = async () => {
    await initializeLocalDatabase();
  };
  initDb();
}, []);
```

#### Firebase Database
```typescript
// In App.tsx
import { initializeFirebase } from './services/firebaseConfig';

useEffect(() => {
  const initFirebase = async () => {
    await initializeFirebase();
  };
  initFirebase();
}, []);
```

### Firebase Configuration

Create a `firebaseConfig.ts` file:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

## 🎮 Usage Guide

### For Users

1. **Sign Up**: Create an account with email and password
2. **Add Skills**: Offer skills you can teach others
3. **Browse Skills**: Find skills you want to learn
4. **Request Swaps**: Send requests to learn from others
5. **Chat**: Communicate with other users
6. **Complete Swaps**: Finish skill exchanges and leave reviews

### For Developers

1. **Database Operations**: Use the local database service for CRUD operations
2. **API Integration**: Switch between mock and database APIs
3. **Type Safety**: All operations are fully typed
4. **Testing**: Use the database test utilities

## 🔥 Firebase Features

### Firebase Authentication
- **Email/Password**: Traditional authentication
- **Google Sign-In**: One-click Google authentication
- **Anonymous Auth**: Guest user support
- **Password Reset**: Email-based password recovery
- **User Management**: Profile updates and account deletion

### Firebase Firestore
- **Real-time Sync**: Live updates across devices
- **Offline Support**: Works offline with sync when online
- **Security Rules**: Granular access control
- **Scalability**: Handles millions of users
- **Backup**: Automatic data backup and recovery

### Firebase Integration Example
```typescript
// Authentication
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Firestore
import { collection, addDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

// Real-time listeners
import { onSnapshot } from 'firebase/firestore';

// Listen to real-time updates
const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      console.log('New user:', change.doc.data());
    }
  });
});
```

## 🧪 Testing

### Database Testing
```typescript
import { testDatabase } from './services/databaseTest';

// Run database tests
await testDatabase();
```

### Migration Utilities
```typescript
import { migrateToLocalDatabase, clearAllData } from './services/migration';

// Migrate to database
await migrateToLocalDatabase();

// Clear all data (for testing)
await clearAllData();
```

### Firebase Testing
```typescript
import { initializeTestApp } from 'firebase/testing';

// Initialize Firebase test environment
const testApp = initializeTestApp({
  projectId: 'test-project',
  auth: { uid: 'test-user' }
});
```

## 🎨 Customization

### Themes
The app supports light and dark themes. Users can toggle between them using the theme switcher in the header.

### Adding New Features
1. Define types in `types.ts`
2. Add database operations in `localDatabase.ts`
3. Create API functions in `apiWithLocalDB.ts`
4. Build UI components in `components/`
5. Add pages in `pages/`

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables

#### For Local Database (Default)
No environment variables required - the app works completely offline!

#### For Firebase Integration
Create a `.env.local` file:
```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the database migration guide
- Test with the provided utilities

## 🎯 Roadmap

- [x] Local database implementation
- [x] Firebase integration support
- [ ] User authentication improvements
- [ ] Advanced search and filtering
- [ ] Mobile app development
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Hybrid database mode (local + cloud sync)
- [ ] Offline-first with cloud backup

---

**Built with ❤️ for community skill sharing**
