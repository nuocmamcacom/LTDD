import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { getPuzzleThemes, getRandomPuzzle, getUserPuzzleStats } from "../../services/api";
import { auth } from "../../services/firebaseConfig";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PuzzlesDashboard({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [themes, setThemes] = useState<any[]>([]);
  const [loadingPuzzle, setLoadingPuzzle] = useState(false);

  const email = auth.currentUser?.email || "";
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  // Responsive calculations
  const isTablet = screenWidth > 768;
  const isSmallScreen = screenWidth < 375;
  const cardPadding = isTablet ? chessTheme.spacing.xl : chessTheme.spacing.lg;
  const containerPadding = isSmallScreen ? chessTheme.spacing.md : chessTheme.spacing.lg;
  
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: chessColors.background,
    },
    scrollContainer: {
      padding: containerPadding,
      paddingBottom: containerPadding * 2, // Extra bottom padding
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: chessColors.background,
    },
    loadingText: {
      marginTop: chessTheme.spacing.md,
      color: chessColors.text,
      fontSize: isTablet ? 18 : 16,
    },
    title: {
      ...chessStyles.textTitle,
      fontSize: isTablet ? 36 : (isSmallScreen ? 24 : 28),
      fontWeight: 'bold',
      marginBottom: chessTheme.spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      ...chessStyles.textSecondary,
      fontSize: isTablet ? 18 : (isSmallScreen ? 14 : 16),
      textAlign: 'center',
    },
    card: {
      ...chessStyles.card,
      padding: cardPadding,
      marginBottom: chessTheme.spacing.xl,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      ...chessStyles.textSubtitle,
      fontSize: isTablet ? 22 : (isSmallScreen ? 16 : 18),
      fontWeight: '600',
      marginBottom: chessTheme.spacing.md,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: chessTheme.spacing.sm,
      flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
      gap: isSmallScreen ? chessTheme.spacing.xs : 0,
    },
    statLabel: {
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
      color: chessColors.textSecondary,
      flex: isSmallScreen ? 1 : undefined,
    },
    statValue: {
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
      fontWeight: '600',
      color: chessColors.primary,
      flex: isSmallScreen ? 1 : undefined,
      textAlign: isSmallScreen ? 'right' : 'left',
    },
    quickStartSection: {
      marginBottom: chessTheme.spacing.lg,
    },
    buttonContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: chessTheme.spacing.sm,
      justifyContent: 'center',
    },
    button: {
      ...chessStyles.buttonPrimary,
      padding: isTablet ? chessTheme.spacing.lg : chessTheme.spacing.md,
      alignItems: 'center',
      minWidth: isTablet ? 140 : (isSmallScreen ? 80 : 100),
      flex: isSmallScreen ? 1 : undefined,
      maxWidth: isSmallScreen ? '48%' : undefined,
    },
    buttonSecondary: {
      backgroundColor: chessColors.buttonSecondary,
    },
    buttonText: {
      ...chessStyles.buttonText,
      fontWeight: '600',
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    },
    themesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: chessTheme.spacing.sm,
      justifyContent: 'space-between',
    },
    themeButton: {
      backgroundColor: chessColors.info,
      padding: isTablet ? chessTheme.spacing.md : chessTheme.spacing.sm,
      borderRadius: chessTheme.borderRadius.md,
      width: isTablet ? '31%' : (isSmallScreen ? '100%' : '48%'),
      alignItems: 'center',
      marginBottom: chessTheme.spacing.xs,
    },
    themeButtonText: {
      color: chessColors.textInverse,
      fontSize: isTablet ? 14 : (isSmallScreen ? 11 : 12),
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user stats and themes in parallel
      const [statsRes, themesRes] = await Promise.all([
        getUserPuzzleStats(email),
        getPuzzleThemes()
      ]);
      
      setUserStats(statsRes.data);
      setThemes(themesRes.data.slice(0, 8)); // Show top 8 themes
      
    } catch (error: any) {
      console.error("Failed to load puzzle dashboard:", error);
      Alert.alert(t('puzzles', 'error'), t('puzzles', 'failedToLoadPuzzleData'));
    } finally {
      setLoading(false);
    }
  };

  const startRandomPuzzle = async (difficulty?: string, theme?: string) => {
    try {
      setLoadingPuzzle(true);
      const response = await getRandomPuzzle(email, difficulty, theme);
      
      navigation.navigate("PuzzleSolve", { 
        puzzle: response.data,
        onComplete: () => {
          loadDashboardData();
        }
      });
    } catch (error: any) {
      console.error("Failed to get random puzzle:", error);
      Alert.alert(t('puzzles', 'error'), error?.response?.data?.error || t('puzzles', 'failedToLoadPuzzle'));
    } finally {
      setLoadingPuzzle(false);
    }
  };

  if (loading) {
    return (
      <View style={dynamicStyles.loadingContainer}>
        <ActivityIndicator size="large" color={chessColors.primary} />
        <Text style={dynamicStyles.loadingText}>{t('puzzles', 'loadingPuzzleData')}...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={dynamicStyles.container} contentContainerStyle={dynamicStyles.scrollContainer}>
      {/* Header */}
      <View style={{ marginBottom: chessTheme.spacing.xl }}>
        <Text style={dynamicStyles.title}>{t('puzzles', 'title')}</Text>
        <Text style={dynamicStyles.subtitle}>{t('puzzles', 'improveSkills')}</Text>
      </View>

      {/* User Stats Card */}
      {userStats && (
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>{t('puzzles', 'yourProgress')}</Text>
          <View style={dynamicStyles.statsRow}>
            <Text style={dynamicStyles.statLabel}>{t('puzzles', 'rating')}</Text>
            <Text style={dynamicStyles.statValue}>{userStats.puzzleRating}</Text>
          </View>
          <View style={dynamicStyles.statsRow}>
            <Text style={dynamicStyles.statLabel}>{t('puzzles', 'solved')}</Text>
            <Text style={dynamicStyles.statValue}>{userStats.puzzlesSolved}</Text>
          </View>
          <View style={dynamicStyles.statsRow}>
            <Text style={dynamicStyles.statLabel}>{t('puzzles', 'streak')}</Text>
            <Text style={dynamicStyles.statValue}>{userStats.currentStreak}</Text>
          </View>
          <View style={dynamicStyles.statsRow}>
            <Text style={dynamicStyles.statLabel}>{t('puzzles', 'accuracy')}</Text>
            <Text style={dynamicStyles.statValue}>{Math.round(userStats.averageAccuracy)}%</Text>
          </View>
          
          {/* Daily Progress */}
          <View style={{ marginTop: chessTheme.spacing.md }}>
            <Text style={{ fontSize: 14, color: chessColors.textSecondary, marginBottom: chessTheme.spacing.xs }}>
              {t('puzzles', 'today')}: {userStats.dailyProgress}/{userStats.dailyGoal} {t('puzzles', 'puzzles')}
            </Text>
            <View style={{ height: 8, backgroundColor: chessColors.border, borderRadius: 4 }}>
              <View 
                style={{
                  height: '100%',
                  backgroundColor: chessColors.success,
                  borderRadius: 4,
                  width: `${Math.min(100, (userStats.dailyProgress / userStats.dailyGoal) * 100)}%`
                }} 
              />
            </View>
          </View>
        </View>
      )}

      {/* Quick Start */}
      <View style={dynamicStyles.quickStartSection}>
        <Text style={dynamicStyles.cardTitle}>{t('puzzles', 'quickStart')}</Text>
        <TouchableOpacity
          style={dynamicStyles.button}
          onPress={() => startRandomPuzzle()}
          disabled={loadingPuzzle}
        >
          {loadingPuzzle ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={dynamicStyles.buttonText}>🎯 {t('puzzles', 'randomPuzzle')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Difficulty Levels */}
      <View style={dynamicStyles.card}>
        <Text style={dynamicStyles.cardTitle}>{t('puzzles', 'byDifficulty')}</Text>
        <View style={dynamicStyles.buttonContainer}>
          {["beginner", "intermediate", "advanced", "expert"].map((difficulty) => (
            <TouchableOpacity
              key={difficulty}
              style={[dynamicStyles.button, dynamicStyles.buttonSecondary]}
              onPress={() => startRandomPuzzle(difficulty)}
              disabled={loadingPuzzle}
            >
              <Text style={dynamicStyles.buttonText}>
                {difficulty === "beginner" ? "🟢" : 
                 difficulty === "intermediate" ? "🟡" :
                 difficulty === "advanced" ? "🟠" : "🔴"} {t('puzzles', difficulty)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Popular Themes */}
      {themes.length > 0 && (
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>{t('puzzles', 'popularThemes')}</Text>
          <View style={dynamicStyles.themesGrid}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme._id}
                style={dynamicStyles.themeButton}
                onPress={() => startRandomPuzzle(undefined, theme._id)}
                disabled={loadingPuzzle}
              >
                <Text style={dynamicStyles.themeButtonText}>{theme._id.replace(/_/g, ' ')}</Text>
                <Text style={[dynamicStyles.themeButtonText, { fontSize: 10, opacity: 0.8 }]}>
                  {theme.count} {t('puzzles', 'puzzles')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activity */}
      {userStats?.recentAttempts && userStats.recentAttempts.length > 0 && (
        <View style={dynamicStyles.card}>
          <Text style={dynamicStyles.cardTitle}>{t('puzzles', 'recentActivity')}</Text>
          {userStats.recentAttempts.slice(0, 5).map((attempt: any, index: number) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: chessTheme.spacing.sm }}>
              <Text style={{ fontSize: 16, marginRight: chessTheme.spacing.sm }}>
                {attempt.solved ? "✅" : "❌"}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: chessColors.text }}>
                  {attempt.solved ? t('puzzles', 'solved') : t('puzzles', 'failed')} • {attempt.timeSpent}s
                </Text>
                <Text style={{ fontSize: 12, color: chessColors.textSecondary }}>
                  {Math.round(attempt.accuracy)}% {t('puzzles', 'accuracy')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}