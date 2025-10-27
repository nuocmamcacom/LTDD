import { useNavigation } from "@react-navigation/native";
import { Audio } from 'expo-av';
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import { useLanguage } from "../../providers/LanguageProvider";
import { auth } from "../../services/firebaseConfig";

// Import the epic sound
const epicSound = require('../../../assets/sounds/epic.mp3');

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: chessColors.background,
      padding: chessTheme.spacing.lg,
    },
    title: {
      ...chessStyles.textTitle,
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: chessTheme.spacing.xxl,
      color: chessColors.primary,
      textAlign: 'center',
    },
    input: {
      ...chessStyles.input,
      width: "100%",
      marginBottom: chessTheme.spacing.md,
    },
    button: {
      ...chessStyles.buttonPrimary,
      width: "100%",
      marginBottom: chessTheme.spacing.sm,
    },
    buttonText: {
      ...chessStyles.buttonText,
      fontSize: 18,
      fontWeight: '600',
    },
    link: {
      ...chessStyles.textLink,
      marginTop: chessTheme.spacing.sm,
      fontSize: 16,
      textAlign: 'center',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: chessTheme.spacing.lg,
      width: '100%',
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: chessColors.border,
    },
    dividerText: {
      ...chessStyles.textTertiary,
      fontSize: 14,
      marginHorizontal: chessTheme.spacing.md,
    },
    googleButton: {
      width: '100%',
      marginBottom: chessTheme.spacing.md,
    },
  });

  useEffect(() => {
    // Only show Google Sign-In on web platform
    setShowGoogleSignIn(Platform.OS === 'web');
  }, []);

  const playEpicSound = async () => {
    console.log('🎵 Starting epic sound for login celebration...');
    try {
      // Use expo-av for both web and mobile
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('🔊 Audio mode set');

      console.log('📂 Loading epic sound...');
      const { sound } = await Audio.Sound.createAsync(
        epicSound,
        { 
          shouldPlay: true, 
          isLooping: false, 
          volume: 0.8  // 80% volume as requested
        }
      );
      console.log('✅ Epic sound started playing at 80% volume!');

      // Stop after 5 seconds as requested
      setTimeout(async () => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
          console.log('⏹️ Epic sound stopped after 5 seconds');
        } catch (error) {
          console.log('❌ Sound stop error:', error);
        }
      }, 5000);

    } catch (error) {
      console.error('❌ Epic sound error:', error);
    }
  };

  const handleGoogleSignIn = async (user: any) => {
    console.log('✅ Google Sign-In successful:', user.email);
    Alert.alert(t('common', 'success'), `${t('auth', 'googleLoginSuccess')} ${user.displayName || user.email}`);
    await playEpicSound(); // Epic sound enabled for Google login
  };

  const handleGoogleError = (error: string) => {
    console.error('❌ Google Sign-In Error:', error);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common', 'error'), t('auth', 'enterEmailPassword'));
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert(t('common', 'success'), t('auth', 'loginSuccess'));
      await playEpicSound(); // Epic sound enabled for email/password login
      // Sau này điều hướng vào Dashboard
      navigation.navigate("Dashboard" as never);
    } catch (error: any) {
      Alert.alert(t('common', 'error'), error.message);
    }
  };

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{t('auth', 'chessOnline')}</Text>

      <TextInput
        style={dynamicStyles.input}
        placeholder={t('auth', 'email')}
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={chessColors.textTertiary}
      />

      <TextInput
        style={dynamicStyles.input}
        placeholder={t('auth', 'password')}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        placeholderTextColor={chessColors.textTertiary}
      />

      <TouchableOpacity style={dynamicStyles.button} onPress={handleLogin}>
        <Text style={dynamicStyles.buttonText}>{t('auth', 'login')}</Text>
      </TouchableOpacity>

      {/* Conditional Google Sign-In for web only */}
      {showGoogleSignIn && (
        <>
          {/* Divider */}
          <View style={dynamicStyles.divider}>
            <View style={dynamicStyles.dividerLine} />
            <Text style={dynamicStyles.dividerText}>{t('auth', 'or')}</Text>
            <View style={dynamicStyles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            onSuccess={handleGoogleSignIn}
            onError={handleGoogleError}
            style={dynamicStyles.googleButton}
          />
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
        <Text style={dynamicStyles.link}>{t('auth', 'noAccount')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword" as never)}>
        <Text style={dynamicStyles.link}>{t('auth', 'forgotPassword')}</Text>
      </TouchableOpacity>
    </View>
  );
}

