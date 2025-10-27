import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { getUserMatches } from "../../services/api";
import { auth } from "../../services/firebaseConfig";

type Match = {
  _id: string;
  roomId: string;
  whitePlayer: string;
  blackPlayer: string;
  winner: "w" | "b" | "draw";
  endReason: string;
  duration: number;
  createdAt: string;
  moves: Array<{ san: string; fen: string; timestamp: string }>;
};

export default function History() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const currentUser = auth.currentUser?.email || "";
  const { t } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: chessColors.background,
      padding: chessTheme.spacing.md,
    },
    title: {
      ...chessStyles.textTitle,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: chessTheme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...chessStyles.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    matchCard: {
      ...chessStyles.card,
      marginBottom: chessTheme.spacing.sm,
    },
    matchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: chessTheme.spacing.sm,
    },
    roomId: {
      ...chessStyles.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    date: {
      ...chessStyles.textSecondary,
      fontSize: 12,
    },
    playersRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: chessTheme.spacing.xs,
    },
    player: {
      ...chessStyles.textPrimary,
      fontSize: 14,
    },
    result: {
      fontSize: 14,
      fontWeight: '600',
    },
    winResult: {
      color: chessColors.success,
    },
    loseResult: {
      color: chessColors.error,
    },
    drawResult: {
      color: chessColors.warning,
    },
    duration: {
      ...chessStyles.textSecondary,
      fontSize: 12,
      textAlign: 'center',
      marginTop: chessTheme.spacing.xs,
    },
  });

  const fetchMatches = async () => {
    try {
      const response = await getUserMatches(currentUser);
      setMatches(response.data);
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMatches();
    }
  }, [currentUser]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const getMatchResult = (match: Match) => {
    if (match.winner === "draw") return t('history', 'draw');
    
    const isWhite = match.whitePlayer === currentUser;
    const won = (isWhite && match.winner === "w") || (!isWhite && match.winner === "b");
    
    return won ? t('history', 'won') : t('history', 'lost');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatEndReason = (reason: string) => {
    const reasons: Record<string, string> = {
      checkmate: t('history', 'checkmate'),
      timeout: t('history', 'timeout'),
      resignation: t('history', 'resignation'),
      stalemate: t('history', 'stalemate'),
      draw: t('history', 'draw'),
      insufficient_material: t('history', 'insufficientMaterial'),
      threefold_repetition: t('history', 'threefoldRepetition'),
      fifty_move: t('history', 'fiftyMoveRule'),
    };
    return reasons[reason] || reason;
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const isWhite = item.whitePlayer === currentUser;
    const opponent = isWhite ? item.blackPlayer : item.whitePlayer;
    const myColor = isWhite ? "⚪" : "⚫";
    const result = getMatchResult(item);
    
    const resultColor = result.includes(t('history', 'won')) ? chessColors.success : 
                       result.includes(t('history', 'lost')) ? chessColors.error : 
                       chessColors.warning;
    
    return (
      <View style={dynamicStyles.matchCard}>
        <View style={dynamicStyles.matchHeader}>
          <Text style={dynamicStyles.roomId}>
            {t('history', 'room')} {item.roomId}
          </Text>
          <Text style={dynamicStyles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={dynamicStyles.playersRow}>
          <Text style={dynamicStyles.player}>
            {t('history', 'vs')} {opponent.split("@")[0]} {myColor}
          </Text>
          <Text style={[dynamicStyles.result, { color: resultColor }]}>
            {result}
          </Text>
        </View>
        
        <Text style={dynamicStyles.duration}>
          {formatEndReason(item.endReason)} • {formatDuration(item.duration)} • {item.moves.length} {t('history', 'moves')}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={dynamicStyles.emptyContainer}>
        <ActivityIndicator size="large" color={chessColors.primary} />
        <Text style={{ color: chessColors.text, marginTop: 8 }}>{t('history', 'loadingHistory')}...</Text>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>{t('history', 'title')}</Text>
      
      <FlatList
        data={matches}
        keyExtractor={(item) => item._id}
        renderItem={renderMatch}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={dynamicStyles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>{t('history', 'noMatches')}</Text>
            <Text style={[dynamicStyles.emptyText, { fontSize: 14, marginTop: 8 }]}>{t('history', 'playToSeeHistory')}</Text>
          </View>
        }
      />
    </View>
  );
}


