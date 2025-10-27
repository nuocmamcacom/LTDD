# ♟️ Chess Online

A real-time multiplayer chess application built with React Native, Node.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd chess-online
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Configure environment variables**

Create `.env` in root directory:
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
GOOGLE_CLIENT_ID=your_google_client_id
API_URL=http://localhost:5000
```

Create `.env` in backend directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chess-online
PORT=5000
NODE_ENV=development
```

5. **Start the applications**

Backend server:
```bash
cd backend
npm run dev
```

Frontend app:
```bash
npm start
```

## 🎮 Features

### ✅ Implemented Features
- **Authentication**: Email/Password + Google Sign-In
- **Real-time Chess**: Multiplayer gameplay with Socket.IO
- **Time Controls**: 3, 5, 7, and 10-minute games
- **Room System**: Create and join game rooms
- **User Management**: Profile, history, settings
- **Admin Panel**: User moderation and ban system
- **Cross-platform**: Web, iOS, and Android support
- **Responsive Design**: Mobile-first UI/UX

### � In Development
- Tournament system
- ELO rating system
- Friend system improvements
- AI opponents
- Chess puzzles

## 🏗️ Tech Stack

### Frontend
- **React Native** + **Expo** - Cross-platform framework
- **TypeScript** - Type safety
- **Socket.IO Client** - Real-time communication
- **Firebase Auth** - Authentication
- **React Navigation** - Navigation system

### Backend
- **Node.js** + **Express.js** - Server framework
- **Socket.IO** - WebSocket server
- **MongoDB** with **Mongoose** - Database
- **Firebase Admin SDK** - Authentication verification

### Database
- **MongoDB Atlas** - Cloud NoSQL database
- **Collections**: Users, Rooms, Matches
- **Indexing**: Optimized queries
- **Validation**: Schema validation

## � Platform Support

- **Web Browser** - Full-featured web app
- **iOS** - Native iOS application
- **Android** - Native Android application

## 🔐 Security

- JWT token authentication
- Role-based access control (Admin/User)
- Input validation and sanitization
- CORS protection
- Firebase security rules

## 🎯 Architecture

```
Frontend (React Native)
        ↕
Backend API (Express.js)
        ↕
Database (MongoDB Atlas)
        ↕
Authentication (Firebase)
```

## 📊 Project Structure

```
chess-online/
├── app/                    # React Native app
│   ├── components/         # Reusable UI components
│   ├── screens/           # App screens
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and external services
│   └── navigation/        # Navigation configuration
├── backend/               # Node.js backend
│   └── src/
│       ├── models/        # Database models
│       ├── routes/        # API routes
│       ├── controllers/   # Route controllers
│       └── sockets/       # Socket.IO handlers
├── assets/                # Static assets
└── constants/             # App constants
```

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm start          # Start Expo development server
npm run web        # Start web development
npm run build      # Build for production
```

**Backend:**
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
```

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📈 Performance

- Optimized bundle size
- Efficient state management
- Real-time updates with minimal latency
- Responsive UI animations

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community
- Expo team
- Socket.IO developers
- Firebase team
- MongoDB team

## 📞 Support

For support and questions:
- Email: support@chess-online.com
- Issues: GitHub Issues
- Documentation: See [TECH_STACK.md](TECH_STACK.md) for detailed technical information

---

**Happy Chess Playing! ♟️**
