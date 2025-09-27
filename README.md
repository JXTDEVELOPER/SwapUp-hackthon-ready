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

### 💾 Local Database
- **Offline First**: Works completely without internet connection
- **Persistent Storage**: Data survives browser restarts
- **Firestore-like API**: Familiar database operations
- **Auto-Seeding**: Pre-populated with sample data
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
- **Database**: LocalStorage with custom database service
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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
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
│   ├── apiWithLocalDB.ts # Database API
│   ├── localDatabase.ts # Local database service
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

### Database Service
The local database provides Firestore-like operations:

```typescript
// Create
await localDb.createUser(user);

// Read
const user = await localDb.getUserById(id);

// Update
await localDb.updateUser(id, updates);

// Delete
await localDb.delete('users', id);

// Query
const users = await localDb.query('users', user => user.email === email);
```

## 🔄 API Migration

### Switching to Database API

To use the persistent local database instead of mock data:

```typescript
// Change from:
import { getCurrentUser, login } from './services/api';

// To:
import { getCurrentUser, login } from './services/apiWithLocalDB';
```

### Database Initialization
The database automatically initializes on app startup with sample data:

```typescript
// In App.tsx
useEffect(() => {
  const initDb = async () => {
    await initializeDatabase();
  };
  initDb();
}, []);
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
No environment variables required - the app works completely offline!

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

- [ ] User authentication improvements
- [ ] Advanced search and filtering
- [ ] Mobile app development
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support

---

**Built with ❤️ for community skill sharing**
