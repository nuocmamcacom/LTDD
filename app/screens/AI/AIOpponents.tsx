import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";

const { width: screenWidth } = Dimensions.get('window');

type DifficultyLevel = 'easy' | 'medium' | 'hard';
type BotPersonality = 'balanced' | 'aggressive' | 'defensive';

interface BotConfig {
  difficulty: DifficultyLevel;
  personality: BotPersonality;
  name: string;
  rating: number;
  description: string;
  color: string;
}

export default function AIOpponents({ navigation }: any) {
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  // Responsive calculations
  const isTablet = screenWidth > 768;
  const isSmallScreen = screenWidth < 375;

  const botConfigs: BotConfig[] = [
    // Easy Bots
    {
      difficulty: 'easy',
      personality: 'balanced',
      name: t('ai', 'chessBuddy'),
      rating: 800,
      description: t('ai', 'chessBuddyDesc'),
      color: '#27ae60'
    },
    {
      difficulty: 'easy', 
      personality: 'defensive',
      name: t('ai', 'castleGuardian'),
      rating: 900,
      description: t('ai', 'castleGuardianDesc'),
      color: '#3498db'
    },
    {
      difficulty: 'easy',
      personality: 'aggressive',
      name: t('ai', 'pawnStorm'),
      rating: 950,
      description: t('ai', 'pawnStormDesc'),
      color: '#e74c3c'
    },
    // Medium Bots
    {
      difficulty: 'medium',
      personality: 'balanced',
      name: t('ai', 'chessScholar'),
      rating: 1300,
      description: t('ai', 'chessScholarDesc'),
      color: '#f39c12'
    },
    {
      difficulty: 'medium',
      personality: 'aggressive',
      name: t('ai', 'knightRider'),
      rating: 1400,
      description: t('ai', 'knightRiderDesc'),
      color: '#e67e22'
    },
    {
      difficulty: 'medium',
      personality: 'defensive',
      name: t('ai', 'fortressMaster'),
      rating: 1350,
      description: t('ai', 'fortressMasterDesc'),
      color: '#8e44ad'
    },
    // Hard Bots
    {
      difficulty: 'hard',
      personality: 'balanced',
      name: t('ai', 'grandMasterAI'),
      rating: 1800,
      description: t('ai', 'grandMasterAIDesc'),
      color: '#2c3e50'
    },
    {
      difficulty: 'hard',
      personality: 'aggressive',
      name: t('ai', 'chessDestroyer'),
      rating: 1900,
      description: t('ai', 'chessDestroyerDesc'),
      color: '#c0392b'
    },
    {
      difficulty: 'hard',
      personality: 'defensive',
      name: t('ai', 'endgameWizard'),
      rating: 1850,
      description: t('ai', 'endgameWizardDesc'),
      color: '#34495e'
    }
  ];

  const startAIGame = (bot: BotConfig) => {
    navigation.navigate('AIGameBoard', {
      botConfig: bot,
      gameType: 'ai'
    });
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return chessColors.success;
      case 'medium': return chessColors.warning;
      case 'hard': return chessColors.error;
      default: return chessColors.primary;
    }
  };

  const renderBotCard = (bot: BotConfig) => (
    <TouchableOpacity
      key={`${bot.difficulty}-${bot.name}`}
      style={[
        dynamicStyles.botCard,
        { backgroundColor: chessColors.cardBackground },
        selectedBot?.name === bot.name && {
          borderColor: chessColors.primary,
          borderWidth: 2
        }
      ]}
      onPress={() => setSelectedBot(bot)}
      activeOpacity={0.8}
    >
      {/* Bot Avatar */}
      <View style={[dynamicStyles.botAvatar, { backgroundColor: bot.color }]}>
        <Text style={dynamicStyles.botInitial}>
          {bot.name.charAt(0)}
        </Text>
      </View>

      {/* Bot Info */}
      <View style={dynamicStyles.botInfo}>
        <Text style={[dynamicStyles.botName, { color: chessColors.text }]}>
          {bot.name}
        </Text>
        <View style={dynamicStyles.botMeta}>
          <View style={[dynamicStyles.difficultyBadge, { backgroundColor: getDifficultyColor(bot.difficulty) }]}>
            <Text style={dynamicStyles.difficultyText}>
              {bot.difficulty.toUpperCase()}
            </Text>
          </View>
          <Text style={[dynamicStyles.botRating, { color: chessColors.textSecondary }]}>
            ⭐ {bot.rating}
          </Text>
        </View>
        <Text style={[dynamicStyles.botDescription, { color: chessColors.textSecondary }]}>
          {bot.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: chessColors.background,
    },
    scrollContainer: {
      padding: isSmallScreen ? 16 : 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: isTablet ? 40 : 30,
    },
    title: {
      ...chessStyles.textTitle,
      fontSize: isTablet ? 32 : (isSmallScreen ? 24 : 28),
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      ...chessStyles.textSecondary,
      fontSize: isTablet ? 18 : (isSmallScreen ? 14 : 16),
      textAlign: 'center',
    },
    difficultySection: {
      marginBottom: 30,
    },
    difficultyTitle: {
      ...chessStyles.textSubtitle,
      fontSize: isTablet ? 22 : (isSmallScreen ? 18 : 20),
      fontWeight: '600',
      marginBottom: 16,
    },
    botCard: {
      ...chessStyles.card,
      flexDirection: 'row',
      padding: isTablet ? 20 : 16,
      marginBottom: 12,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    botAvatar: {
      width: isTablet ? 60 : 50,
      height: isTablet ? 60 : 50,
      borderRadius: isTablet ? 30 : 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    botInitial: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: 'bold',
      color: '#fff',
    },
    botInfo: {
      flex: 1,
    },
    botName: {
      fontSize: isTablet ? 18 : (isSmallScreen ? 16 : 17),
      fontWeight: '600',
      marginBottom: 8,
    },
    botMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 12,
    },
    difficultyText: {
      fontSize: isTablet ? 12 : 10,
      fontWeight: 'bold',
      color: '#fff',
    },
    botRating: {
      fontSize: isTablet ? 14 : 12,
      fontWeight: '500',
    },
    botDescription: {
      fontSize: isTablet ? 14 : (isSmallScreen ? 12 : 13),
      lineHeight: isTablet ? 20 : 18,
    },
    startButton: {
      ...chessStyles.buttonPrimary,
      backgroundColor: chessColors.primary,
      margin: 20,
      padding: isTablet ? 18 : 16,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    startButtonDisabled: {
      backgroundColor: chessColors.textTertiary,
    },
    startButtonText: {
      ...chessStyles.buttonText,
      fontSize: isTablet ? 18 : 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <ScrollView style={dynamicStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.title}>🤖 {t('ai', 'title')}</Text>
          <Text style={dynamicStyles.subtitle}>
            {t('ai', 'subtitle')}
          </Text>
        </View>

        {/* Easy Bots */}
        <View style={dynamicStyles.difficultySection}>
          <Text style={[dynamicStyles.difficultyTitle, { color: getDifficultyColor('easy') }]}>
            🟢 {t('ai', 'easyBots')}
          </Text>
          {botConfigs.filter(bot => bot.difficulty === 'easy').map(renderBotCard)}
        </View>

        {/* Medium Bots */}
        <View style={dynamicStyles.difficultySection}>
          <Text style={[dynamicStyles.difficultyTitle, { color: getDifficultyColor('medium') }]}>
            🟡 {t('ai', 'mediumBots')}
          </Text>
          {botConfigs.filter(bot => bot.difficulty === 'medium').map(renderBotCard)}
        </View>

        {/* Hard Bots */}
        <View style={dynamicStyles.difficultySection}>
          <Text style={[dynamicStyles.difficultyTitle, { color: getDifficultyColor('hard') }]}>
            🔴 {t('ai', 'hardBots')}
          </Text>
          {botConfigs.filter(bot => bot.difficulty === 'hard').map(renderBotCard)}
        </View>
      </ScrollView>

      {/* Start Game Button */}
      <TouchableOpacity
        style={[
          dynamicStyles.startButton,
          !selectedBot && dynamicStyles.startButtonDisabled
        ]}
        onPress={() => selectedBot && startAIGame(selectedBot)}
        disabled={!selectedBot}
        activeOpacity={0.8}
      >
        <Text style={dynamicStyles.startButtonText}>
          {selectedBot ? `🎮 ${t('ai', 'playVs')} ${selectedBot.name}` : `🤖 ${t('ai', 'selectOpponent')}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}