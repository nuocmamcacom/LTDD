import { Chess, Square } from "chess.js";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemedStyles } from "../../hooks/useThemedStyles";
import { useLanguage } from "../../providers/LanguageProvider";
import { AIChessEngine, BotConfig } from "../../services/aiChessEngine";
import { aiStatsManager } from "../../services/aiStatsManager";
import { soundManager } from "../../services/soundManager";

const { width: screenWidth } = Dimensions.get('window');

type Props = {
  route: any;
  navigation: any;
};

const unicode: Record<string, string> = {
  pw: "♙", nw: "♘", bw: "♗", rw: "♖", qw: "♕", kw: "♔",
  pb: "♟", nb: "♞", bb: "♝", rb: "♜", qb: "♛", kb: "♚",
};

export default function AIGameBoard({ route, navigation }: Props) {
  const { botConfig }: { botConfig: BotConfig } = route.params;
  
  const [aiEngine] = useState(() => new AIChessEngine(botConfig));
  const [fen, setFen] = useState(aiEngine.getGameState().fen);
  const [from, setFrom] = useState<Square | null>(null);
  const [legal, setLegal] = useState<Square[]>([]);
  const [gameState, setGameState] = useState(aiEngine.getGameState());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [gameStartTime] = useState(Date.now());
  const [moveCount, setMoveCount] = useState(0);

  const { t } = useLanguage();
  const themedStyles = useThemedStyles();

  // Responsive calculations
  const isTablet = screenWidth > 768;
  const isSmallScreen = screenWidth < 375;
  const availableWidth = screenWidth - (isSmallScreen ? 32 : 48);
  const S = Math.min(availableWidth / 8, isTablet ? 60 : (isSmallScreen ? 38 : 45));

  useEffect(() => {
    // Human plays as white, AI plays as black
    if (gameState.turn === 'b' && !gameState.isGameOver && !gameResult) {
      makeAIMove();
    }
  }, [gameState.turn, gameState.isGameOver, gameResult]);

  useEffect(() => {
    checkGameStatus();
  }, [gameState]);

  const makeAIMove = async () => {
    setIsAIThinking(true);
    try {
      const aiMove = await aiEngine.makeAIMove();
      if (aiMove) {
        await soundManager.playMoveSound();
        updateGameState();
      }
    } catch (error) {
      console.error('AI Move Error:', error);
    } finally {
      setIsAIThinking(false);
    }
  };

  const updateGameState = () => {
    const newState = aiEngine.getGameState();
    setGameState(newState);
    setFen(newState.fen);
  };

  const checkGameStatus = async () => {
    let result: 'win' | 'lose' | 'draw' | null = null;
    let resultMessage = '';

    if (gameState.isCheckmate) {
      const winner = gameState.turn === 'w' ? 'Black (AI)' : 'White (You)';
      result = gameState.turn === 'w' ? 'lose' : 'win';
      resultMessage = `Checkmate! ${winner} wins!`;
    } else if (gameState.isStalemate) {
      result = 'draw';
      resultMessage = 'Draw by stalemate!';
    } else if (gameState.isDraw) {
      result = 'draw';
      resultMessage = 'Draw!';
    }

    if (result && resultMessage) {
      setGameResult(resultMessage);
      
      // Save game stats
      const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
      await aiStatsManager.saveGame({
        id: `ai_game_${Date.now()}`,
        botConfig,
        result,
        moveCount: gameState.moveHistory.length,
        duration: gameDuration,
        date: new Date().toISOString(),
        pgn: gameState.pgn
      });
    }
  };

  const handleSquarePress = async (row: number, col: number) => {
    if (gameState.isGameOver || gameResult || isAIThinking) return;
    if (gameState.turn !== 'w') return; // Only allow human moves on white's turn

    const sq = algebraicAt(row, col);

    if (from === null) {
      // Selecting a piece
      const moves = aiEngine.getLegalMoves(sq);
      if (moves.length > 0) {
        setFrom(sq);
        setLegal(moves.map((m: any) => m.to));
      }
    } else {
      // Making a move
      if (from === sq) {
        // Deselect
        setFrom(null);
        setLegal([]);
      } else if (legal.includes(sq)) {
        // Valid move
        const success = aiEngine.makePlayerMove(from, sq);
        if (success) {
          await soundManager.playMoveSound();
          updateGameState();
          setMoveCount(prev => prev + 1);
          setFrom(null);
          setLegal([]);
        }
      } else {
        // Try to select a new piece
        const moves = aiEngine.getLegalMoves(sq);
        if (moves.length > 0) {
          setFrom(sq);
          setLegal(moves.map((m: any) => m.to));
        } else {
          setFrom(null);
          setLegal([]);
        }
      }
    }
  };

  const algebraicAt = (r: number, c: number): Square => {
    const files = "abcdefgh";
    const ranks = "87654321";
    return (files[c] + ranks[r]) as Square;
  };

  const renderBoard = () => {
    const game = new Chess(fen);
    const board = game.board();

    return board.map((row, r) => (
      <View key={`r${r}`} style={dynamicStyles.row}>
        {row.map((cell, c) => {
          const sq = algebraicAt(r, c);
          const isDark = (r + c) % 2 === 1;
          const isFrom = from === sq;
          const isLegal = legal.includes(sq);

          let bg = isDark ? "#769656" : "#eeeed2";
          if (isFrom) bg = "#f7dc6f";
          else if (isLegal) bg = "#baca44";

          const key = cell ? `${cell.type}${cell.color}` : "";
          const pieceChar = cell && key ? unicode[key] : "";

          return (
            <TouchableOpacity
              key={`c${c}`}
              style={[dynamicStyles.square, { backgroundColor: bg }]}
              activeOpacity={0.8}
              onPress={() => handleSquarePress(r, c)}
              disabled={gameState.isGameOver || gameResult !== null || isAIThinking}
            >
              <Text style={dynamicStyles.piece}>{pieceChar}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  const resetGame = () => {
    aiEngine.reset();
    updateGameState();
    setFrom(null);
    setLegal([]);
    setGameResult(null);
    setMoveCount(0);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themedStyles.theme.colors.background,
      padding: isSmallScreen ? 12 : (isTablet ? 24 : 16),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: isSmallScreen ? 12 : (isTablet ? 20 : 16),
      flexWrap: 'wrap',
      gap: 8,
    },
    backButton: {
      fontSize: isTablet ? 18 : 16,
      color: themedStyles.theme.colors.primary,
      fontWeight: "600",
    },
    headerInfo: {
      flex: isSmallScreen ? 0 : 1,
      alignItems: "center",
    },
    gameTitle: {
      fontSize: isTablet ? 20 : (isSmallScreen ? 16 : 18),
      fontWeight: "bold",
      color: themedStyles.theme.colors.text,
    },
    botInfo: {
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
      color: themedStyles.theme.colors.textSecondary,
    },
    statusContainer: {
      backgroundColor: themedStyles.theme.colors.backgroundCard,
      padding: isTablet ? 16 : 12,
      borderRadius: 8,
      marginBottom: isTablet ? 16 : 12,
      alignItems: "center",
    },
    statusText: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: "500",
      color: themedStyles.theme.colors.text,
    },
    aiThinkingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    boardContainer: {
      alignSelf: "center",
      borderWidth: 2,
      borderColor: themedStyles.theme.colors.border,
      borderRadius: 8,
      marginBottom: isTablet ? 20 : 16,
      shadowColor: themedStyles.theme.colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
    },
    square: {
      width: S,
      height: S,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0.5,
      borderColor: "#ddd",
    },
    piece: {
      fontSize: isTablet ? Math.min(S * 0.7, 38) : Math.min(S * 0.7, 32),
      textShadowColor: "rgba(0,0,0,0.1)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 1,
    },
    controls: {
      flexDirection: isSmallScreen ? 'column' : 'row',
      justifyContent: 'space-around',
      gap: isSmallScreen ? 8 : 12,
    },
    controlButton: {
      flex: isSmallScreen ? 0 : 1,
      backgroundColor: themedStyles.theme.colors.secondary,
      padding: isTablet ? 16 : (isSmallScreen ? 10 : 12),
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: isSmallScreen ? 0 : 6,
    },
    resetButton: {
      backgroundColor: themedStyles.theme.colors.accent,
    },
    controlButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    },
    gameResultModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    gameResultContainer: {
      backgroundColor: themedStyles.theme.colors.backgroundCard,
      padding: isTablet ? 32 : 24,
      borderRadius: 16,
      alignItems: 'center',
      marginHorizontal: 20,
    },
    gameResultText: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: 'bold',
      color: themedStyles.theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    gameResultButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    gameResultButton: {
      backgroundColor: themedStyles.theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    gameResultButtonSecondary: {
      backgroundColor: themedStyles.theme.colors.secondary,
    },
    gameResultButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={dynamicStyles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={dynamicStyles.headerInfo}>
          <Text style={dynamicStyles.gameTitle}>vs {botConfig.name}</Text>
          <Text style={dynamicStyles.botInfo}>
            {botConfig.difficulty.toUpperCase()} • ⭐ {botConfig.rating}
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* Status */}
      <View style={dynamicStyles.statusContainer}>
        {isAIThinking ? (
          <View style={dynamicStyles.aiThinkingContainer}>
            <ActivityIndicator size="small" color={themedStyles.theme.colors.primary} />
            <Text style={dynamicStyles.statusText}>
              {botConfig.name} is thinking...
            </Text>
          </View>
        ) : gameResult ? (
          <Text style={[dynamicStyles.statusText, { color: themedStyles.theme.colors.accent }]}>
            {gameResult}
          </Text>
        ) : (
          <Text style={dynamicStyles.statusText}>
            {gameState.turn === 'w' ? 'Your turn (White)' : `${botConfig.name}'s turn (Black)`}
            {gameState.isCheck && ' • Check!'}
          </Text>
        )}
      </View>

      {/* Board */}
      <View style={dynamicStyles.boardContainer}>
        {renderBoard()}
      </View>

      {/* Controls */}
      <View style={dynamicStyles.controls}>
        <TouchableOpacity
          style={[dynamicStyles.controlButton, dynamicStyles.resetButton]}
          onPress={resetGame}
        >
          <Text style={dynamicStyles.controlButtonText}>🔄 New Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={dynamicStyles.controlButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={dynamicStyles.controlButtonText}>🏠 Back to AI</Text>
        </TouchableOpacity>
      </View>

      {/* Game Result Modal */}
      {gameResult && (
        <View style={dynamicStyles.gameResultModal}>
          <View style={dynamicStyles.gameResultContainer}>
            <Text style={dynamicStyles.gameResultText}>{gameResult}</Text>
            <View style={dynamicStyles.gameResultButtons}>
              <TouchableOpacity
                style={dynamicStyles.gameResultButton}
                onPress={resetGame}
              >
                <Text style={dynamicStyles.gameResultButtonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[dynamicStyles.gameResultButton, dynamicStyles.gameResultButtonSecondary]}
                onPress={() => navigation.goBack()}
              >
                <Text style={dynamicStyles.gameResultButtonText}>Back to AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}