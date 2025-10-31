import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ThemeToggle from "../../components/ThemeToggle";
import { useLanguage } from "../../providers/LanguageProvider";
import { getUserPuzzleStats } from "../../services/api";
import { auth } from "../../services/firebaseConfig";
import { useChessColors, useChessStyles, useChessTheme } from '@/constants/ChessThemeProvider';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(true); // TEMP: Force admin for testing
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();
  
  const email = auth.currentUser?.email || "";
  const displayName = auth.currentUser?.displayName || email.split('@')[0];

  useEffect(() => {
    loadUserData();
    // Removed setupAudio() to eliminate background sound
  }, []);

  const loadUserData = async () => {
    try {
      const response = await getUserPuzzleStats(email);
      setUserStats(response.data);
      
      // Check if user is admin
      const API_URL = process.env.API_URL || 'http://localhost:5000';
      try {
        const userResponse = await fetch(`${API_URL}/api/users/${email}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setIsAdmin(userData.role === 'admin');
        }
      } catch (adminCheckError) {
        // Could not check admin status
      }
    } catch (error) {
      // Could not load user stats (probably first time)
    } finally {
      setLoading(false);
    }
  };

  // Only show the six main features on the home screen.
  // Settings has been collapsed into the ThemeToggle in the top bar.
  const features = [
    {
      id: 'rooms',
      title: t('home', 'rooms'),
      subtitle: t('home', 'roomsSubtitle'),
      color: chessColors.primary,
      onPress: () => navigation.navigate('Dashboard')
    },
    {
      id: 'puzzles',
      title: t('home', 'puzzles'),
      subtitle: `${t('home', 'puzzlesSubtitle')} ${userStats?.puzzleRating || 1200}`,
      color: chessColors.info,
      onPress: () => navigation.navigate('PuzzlesDashboard')
    },
    {
      id: 'profile',
      title: t('home', 'profile'),
      subtitle: t('home', 'profileSubtitle'),
      color: chessColors.success,
      onPress: () => navigation.navigate('Profile')
    },
    {
      id: 'ai-opponents',
      title: t('home', 'aiOpponents'),
      subtitle: t('ai', 'subtitle'),
      color: chessColors.warning,
      onPress: () => {
        navigation.navigate('AIOpponents');
      }
    },
    {
      id: 'friends',
      title: t('home', 'friends'),
      subtitle: t('friends', 'friendsList'),
      color: chessColors.buttonSecondary,
      onPress: () => {
        navigation.navigate('FriendsList');
      }
    },
    {
      id: 'analysis',
      title: t('home', 'analysis'),
      subtitle: t('home', 'analysisSubtitle'),
      color: chessColors.textTertiary,
      onPress: () => alert(t('home', 'comingSoonMessage'))
    }
  ];

  if (loading) {
    return (
      <View style={[chessStyles.loadingContainer, { backgroundColor: chessColors.background }]}>
        <ActivityIndicator size="large" color={chessColors.primary} />
        <Text style={[chessStyles.loadingText, { color: chessColors.text }]}>{t('home', 'loadingChessWorld')}</Text>
      </View>
    );
  }

  return (
    <View style={[chessStyles.container, { backgroundColor: chessColors.background }]}>
      {/* Rick Roll Animated Background */}
      <View style={[styles.backgroundGradient, { backgroundColor: chessColors.background }]} />
      
      {/* Dark Overlay */}
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
      
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar with Settings, Admin (if admin), and Theme Toggle */}
        <View style={styles.topBar}>
          <View style={styles.leftButtons}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <Ionicons 
                name="settings-outline" 
                size={28} 
                color={chessColors.text} 
              />
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity 
                style={[styles.settingsButton, { marginLeft: 10 }]}
                onPress={() => navigation.navigate('AdminPanel')}
                accessibilityLabel="Admin Panel"
                accessibilityRole="button"
              >
                <Ionicons 
                  name="shield-outline" 
                  size={28} 
                  color={chessColors.warning} 
                />
              </TouchableOpacity>
            )}
          </View>
          <ThemeToggle size={28} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[chessStyles.textTitle, { color: chessColors.text }]}>{t('home', 'welcomeBack')}</Text>
          <Text style={[chessStyles.textTitle, { color: chessColors.primary, fontSize: 28 }]}>{displayName}</Text>
          <Text style={[chessStyles.textSubtitle, { color: chessColors.textSecondary }]}>{t('home', 'chooseAdventure')}</Text>
        </View>

        {/* Feature Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={feature.id}
              style={[
                styles.featureCard,
                { backgroundColor: feature.color },
                index % 2 === 1 && styles.featureCardRight
              ]}
              onPress={feature.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Stats */}
        {userStats && (
          <View style={[chessStyles.card, { 
            backgroundColor: chessColors.backgroundSecondary, 
            borderColor: chessColors.border,
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: 20
          }]}>
            <View style={styles.statItem}>
              <Text style={[chessStyles.textTitle, { color: chessColors.primary }]}>{userStats.puzzlesSolved}</Text>
              <Text style={[chessStyles.textSecondary, { color: chessColors.textSecondary }]}>{t('home', 'puzzlesSolved')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[chessStyles.textTitle, { color: chessColors.primary }]}>{userStats.currentStreak}</Text>
              <Text style={[chessStyles.textSecondary, { color: chessColors.textSecondary }]}>{t('home', 'currentStreak')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[chessStyles.textTitle, { color: chessColors.primary }]}>{Math.round(userStats.averageAccuracy)}%</Text>
              <Text style={[chessStyles.textSecondary, { color: chessColors.textSecondary }]}>{t('home', 'accuracy')}</Text>
            </View>
          </View>
        )}

        {/* Fun Message */}
        {/* <View style={[chessStyles.card, { backgroundColor: chessColors.cardBackground, borderColor: chessColors.primary }]}>
           <Text style={[chessStyles.textPrimary, { color: chessColors.text }]}>
             {t('home', 'rickRollMessage')}
           </Text>
           <Text style={[chessStyles.textSecondary, { color: chessColors.textSecondary }]}>
             {t('home', 'readyToDominate')}
           </Text>
        </View> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    zIndex: 1,
    minHeight: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  leftButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  featureCardRight: {},
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  featureSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
});