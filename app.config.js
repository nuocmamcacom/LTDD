// app.config.js
// Dùng dotenv để đọc file .env rồi inject vào Expo config
const dotenv = require('dotenv');
dotenv.config();

module.exports = () => ({
  expo: {
    name: 'chess-online',
    slug: 'chess-online',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'chessonline',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png'
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.company.chessonline',
      googleServicesFile: './google-services.json'
    },
    web: {
      favicon: './assets/images/images.png',
      name: 'Chess Online ♔',
      shortName: 'Chess ♔',
      description: 'Play chess online with friends',
      themeColor: '#1a1a1a',
      backgroundColor: '#1a1a1a'
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/images/images.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: { backgroundColor: '#000000' }
        }
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.602154513833-j0rsaqlc8u3du7ta8suhno4h6po4aj2r'
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    extra: {
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
      API_URL: process.env.API_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '602154513833-j0rsaqlc8u3du7ta8suhno4h6po4aj2r.apps.googleusercontent.com'
    }
  }
});
