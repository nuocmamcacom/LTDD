import { Chess, Square } from "chess.js";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import { submitPuzzleAttempt } from "../../services/api";
import { auth } from "../../services/firebaseConfig";
import { soundManager } from "../../services/soundManager";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Props = {
  route: any;
  navigation: any;
};

const unicode: Record<string, string> = {
  pw: "♙", nw: "♘", bw: "♗", rw: "♖", qw: "♕", kw: "♔",
  pb: "♟", nb: "♞", bb: "♝", rb: "♜", qb: "♛", kb: "♚",
};

export default function PuzzleSolve({ route, navigation }: Props) {
  const { puzzle, onComplete } = route.params;
  const [game] = useState(() => new Chess(puzzle.fen));
  const [fen, setFen] = useState(puzzle.fen);
  const [from, setFrom] = useState<Square | null>(null);
  const [legal, setLegal] = useState<Square[]>([]);
  const [moveIndex, setMoveIndex] = useState(0);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [status, setStatus] = useState<"solving" | "correct" | "wrong" | "completed">("solving");
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const email = auth.currentUser?.email || "";
  const solutionMoves = puzzle.moves;
  const isPlayerToMove = moveIndex % 2 === 0; // Player makes first move, then opponent responds
  const { t, language } = useLanguage();
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();

  // Responsive calculations
  const isTablet = screenWidth > 768;
  const isSmallScreen = screenWidth < 375;
  const availableWidth = screenWidth - (isSmallScreen ? 32 : 48); // Subtract padding
  const S = Math.min(availableWidth / 8, isTablet ? 60 : (isSmallScreen ? 38 : 45)); // Dynamic square size
  
  // Dynamic styles with responsive values
  const dynamicStyles = StyleSheet.create({
    ...styles,
    container: {
      ...styles.container,
      padding: isSmallScreen ? 12 : (isTablet ? 24 : 16),
    },
    header: {
      ...styles.header,
      marginBottom: isSmallScreen ? 12 : (isTablet ? 20 : 16),
    },
    headerInfo: {
      ...styles.headerInfo,
      flex: isSmallScreen ? 0 : 1,
    },
    puzzleTitle: {
      ...styles.puzzleTitle,
      fontSize: isTablet ? 20 : (isSmallScreen ? 16 : 18),
    },
    puzzleRating: {
      ...styles.puzzleRating,
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    },
    timerText: {
      ...styles.timerText,
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    },
    square: {
      ...styles.square,
      width: S,
      height: S,
    },
    piece: {
      ...styles.piece,
      fontSize: isTablet ? Math.min(S * 0.7, 38) : Math.min(S * 0.7, 32),
    },
    controls: {
      ...styles.controls,
      flexDirection: isSmallScreen ? 'column' : 'row',
      gap: isSmallScreen ? 8 : 12,
    },
    controlButton: {
      ...styles.controlButton,
      flex: isSmallScreen ? 0 : 1,
      padding: isTablet ? 16 : (isSmallScreen ? 10 : 12),
    },
    controlButtonText: {
      ...styles.controlButtonText,
      fontSize: isTablet ? 16 : (isSmallScreen ? 12 : 14),
    },
  });

  // Helper functions to translate puzzle data
  const puzzleTranslations = {
    en: {
      titles: {
        "Double Attack": "Double Attack",
        "Fork": "Fork",
        "Pin": "Pin",
        "Skewer": "Skewer",
        "Discovered Attack": "Discovered Attack",
        "Back Rank Mate": "Back Rank Mate",
        "Smothered Mate": "Smothered Mate",
      },
      descriptions: {
        "Attack two pieces at once": "Attack two pieces at once",
        "Win material with a fork": "Win material with a fork", 
        "Pin the opponent's piece": "Pin the opponent's piece",
        "Attack through another piece": "Attack through another piece",
        "Checkmate on the back rank": "Checkmate on the back rank",
      }
    },
    vi: {
      titles: {
        "Double Attack": "Tấn Công Kép",
        "Fork": "Nĩa",
        "Pin": "Ghim", 
        "Skewer": "Xiên",
        "Discovered Attack": "Tấn Công Phát Hiện",
        "Back Rank Mate": "Chiếu Bí Hàng Cuối",
        "Smothered Mate": "Chiếu Bí Ngạt Thở",
      },
      descriptions: {
        "Attack two pieces at once": "Tấn công hai quân cờ cùng lúc",
        "Win material with a fork": "Thắng quân bằng chiêu nĩa",
        "Pin the opponent's piece": "Ghim quân cờ của đối thủ", 
        "Attack through another piece": "Tấn công qua quân cờ khác",
        "Checkmate on the back rank": "Chiếu bí ở hàng cuối",
      }
    }
  };

  const getTranslatedTitle = (title: string) => {
    return (puzzleTranslations[language]?.titles as any)?.[title] || title;
  };

  const getTranslatedDescription = (description: string) => {
    return (puzzleTranslations[language]?.descriptions as any)?.[description] || description;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    soundManager.loadSounds();
    return () => {
      clearInterval(timer);
      soundManager.cleanup();
    };
  }, [startTime]);

  const board = React.useMemo(() => {
    return game.board();
  }, [fen]);

  const algebraicAt = (rowIdx: number, colIdx: number): Square => {
    const file = "abcdefgh"[colIdx];
    const rank = 8 - rowIdx;
    return `${file}${rank}` as Square;
  };

  const onSquarePress = (rowIdx: number, colIdx: number) => {
    if (status !== "solving" || !isPlayerToMove) return;

    const sq = algebraicAt(rowIdx, colIdx);
    const piece = game.get(sq);

    if (!from) {
      // Select piece
      if (!piece || piece.color !== game.turn()) return;
      setFrom(sq);
      const moves = game.moves({ square: sq, verbose: true }) as any[];
      setLegal(moves.map((m) => m.to as Square));
      return;
    }

    // If clicking on the same square, deselect
    if (from === sq) {
      setFrom(null);
      setLegal([]);
      return;
    }

    // If clicking on another piece of the same color, change selection
    if (piece && piece.color === game.turn()) {
      setFrom(sq);
      const moves = game.moves({ square: sq, verbose: true }) as any[];
      setLegal(moves.map((m) => m.to as Square));
      return;
    }

    // Try to make move
    const move = game.move({ from, to: sq, promotion: "q" as any });
    if (move) {
      const newUserMoves = [...userMoves, move.san];
      setUserMoves(newUserMoves);
      setFen(game.fen());
      
      // Check if move matches solution
      if (move.san === solutionMoves[moveIndex]) {
        // Correct move!
        soundManager.playSound('move');
        
        // Check if puzzle is completed
        if (moveIndex + 1 >= solutionMoves.length) {
          setStatus("completed");
          soundManager.playSound('gameOver');
          submitAttempt(true, newUserMoves);
        } else {
          // Make opponent's response automatically
          setTimeout(() => {
            makeOpponentMove();
          }, 800);
        }
        setMoveIndex(moveIndex + 1);
      } else {
        // Wrong move
        setStatus("wrong");
        soundManager.playSound('capture'); // Error sound
        setTimeout(() => {
          submitAttempt(false, newUserMoves);
        }, 1500);
      }
    }
    
    setFrom(null);
    setLegal([]);
  };

  const makeOpponentMove = () => {
    if (moveIndex + 1 < solutionMoves.length) {
      const opponentMove = solutionMoves[moveIndex + 1];
      const move = game.move(opponentMove);
      if (move) {
        setFen(game.fen());
        setMoveIndex(moveIndex + 2);
        soundManager.playSound('move');
      }
    }
  };

  const getHint = () => {
    if (hintsUsed >= 3) {
      Alert.alert(t('puzzles', 'actionHints'), t('puzzles', 'noMoreHints'));
      return;
    }

    const nextMove = solutionMoves[moveIndex];
    if (nextMove) {
      // Show piece type and target square as hint
      const move = game.move(nextMove);
      game.undo(); // Undo to restore position
      
      if (move) {
        setHint(`${t('puzzles', 'tryMoving')} ${move.piece} ${t('puzzles', 'to')} ${move.to}`);
        setHintsUsed(hintsUsed + 1);
        setTimeout(() => setHint(null), 4000);
      }
    }
  };

  const submitAttempt = async (solved: boolean, moves: string[]) => {
    try {
      setSubmitting(true);
      
      const attemptData = {
        userEmail: email,
        puzzleId: puzzle.puzzleId,
        solved,
        timeSpent: timeElapsed,
        movesPlayed: moves,
        hintsUsed
      };

      const response = await submitPuzzleAttempt(attemptData);
      
      // Show result
      const result = response.data;
      const message = solved
        ? `${t('puzzles', 'resultPuzzleSolved')}\n\n${t('puzzles', 'resultRating')}: ${result.newRating} (${result.ratingChange >= 0 ? '+' : ''}${result.ratingChange})\n${t('puzzles', 'resultAccuracy')}: ${result.accuracy}%\n${t('puzzles', 'resultTime')}: ${timeElapsed}s`
        : `${t('puzzles', 'resultIncorrectSolution')}\n\n${t('puzzles', 'resultRating')}: ${result.newRating} (${result.ratingChange >= 0 ? '+' : ''}${result.ratingChange})\n${t('puzzles', 'resultTime')}: ${timeElapsed}s`;

      Alert.alert(
        solved ? t('puzzles', 'resultSuccess') : t('puzzles', 'resultTryAgain'),
        message,
        [
          {
            text: t('puzzles', 'resultContinue'),
            onPress: () => {
              onComplete?.();
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error("Failed to submit puzzle attempt:", error);
      Alert.alert(t('puzzles', 'error'), t('puzzles', 'failedToSaveResult'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetPuzzle = () => {
    game.load(puzzle.fen);
    setFen(puzzle.fen);
    setFrom(null);
    setLegal([]);
    setMoveIndex(0);
    setUserMoves([]);
    setStatus("solving");
    setHint(null);
  };

  const renderBoard = () => {
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
              onPress={() => onSquarePress(r, c)}
              disabled={status !== "solving" || !isPlayerToMove}
            >
              <Text style={dynamicStyles.piece}>{pieceChar}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  return (
    <View style={[dynamicStyles.container, { backgroundColor: chessColors.background }]}>
      {/* Header */}
      <View style={[dynamicStyles.header, { backgroundColor: chessColors.cardBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[dynamicStyles.backButton, { color: chessColors.primary }]}>{t('puzzles', 'back')}</Text>
        </TouchableOpacity>
        <View style={dynamicStyles.headerInfo}>
          <Text style={[dynamicStyles.puzzleTitle, { color: chessColors.text }]}>{getTranslatedTitle(puzzle.title)}</Text>
          <Text style={[dynamicStyles.puzzleRating, { color: chessColors.textSecondary }]}>{t('puzzles', 'resultRating')}: {puzzle.rating}</Text>
        </View>
        <View style={dynamicStyles.timer}>
          <Text style={[dynamicStyles.timerText, { color: chessColors.text }]}>{timeElapsed}s</Text>
        </View>
      </View>

      {/* Status */}
      <View style={[dynamicStyles.statusContainer, { backgroundColor: chessColors.cardBackground }]}>
        {status === "solving" && (
          <Text style={[styles.statusText, { color: chessColors.text }]}>
            {isPlayerToMove ? t('puzzles', 'statusYourTurn') : t('puzzles', 'statusOpponentThinking')}
          </Text>
        )}
        {status === "wrong" && (
          <Text style={[styles.statusText, { color: chessColors.error }]}>
            {t('puzzles', 'statusTryAgain')}
          </Text>
        )}
        {status === "completed" && (
          <Text style={[styles.statusText, { color: chessColors.success }]}>
            {t('puzzles', 'statusPuzzleSolved')}
          </Text>
        )}
      </View>

      {/* Hint */}
      {hint && (
        <View style={[dynamicStyles.hintContainer, { backgroundColor: chessColors.cardBackground }]}>
          <Text style={[dynamicStyles.hintText, { color: chessColors.text }]}>💡 {hint}</Text>
        </View>
      )}

      {/* Description */}
      {puzzle.description && (
        <View style={[dynamicStyles.descriptionContainer, { backgroundColor: chessColors.cardBackground }]}>
          <Text style={[dynamicStyles.description, { color: chessColors.textSecondary }]}>{getTranslatedDescription(puzzle.description)}</Text>
        </View>
      )}

      {/* Board */}
      <View style={dynamicStyles.boardContainer}>
        {renderBoard()}
      </View>

      {/* Controls */}
      <View style={dynamicStyles.controls}>
        <TouchableOpacity
          style={[dynamicStyles.controlButton, dynamicStyles.hintButton]}
          onPress={getHint}
          disabled={hintsUsed >= 3 || status !== "solving"}
        >
          <Text style={[dynamicStyles.controlButtonText, { color: chessColors.text }]}>
            💡 {t('puzzles', 'actionHint')} ({3 - hintsUsed} {t('puzzles', 'hintLeft')})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[dynamicStyles.controlButton, dynamicStyles.resetButton]}
          onPress={resetPuzzle}
          disabled={submitting}
        >
          <Text style={[dynamicStyles.controlButtonText, { color: chessColors.text }]}>🔄 {t('puzzles', 'reset')}</Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {submitting && (
        <View style={dynamicStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={chessColors.primary} />
          <Text style={[dynamicStyles.loadingText, { color: chessColors.text }]}>Saving result...</Text>
        </View>
      )}
    </View>
  );
}

// Styles cho PuzzleSolve
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  backButton: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "600",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  puzzleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  puzzleRating: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  timer: {
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "monospace",
  },
  statusContainer: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  hintContainer: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  hintText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
  },
  descriptionContainer: {
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#2c3e50",
    textAlign: "center",
    fontStyle: "italic",
  },
  boardContainer: {
    alignSelf: "center",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
  },
  square: {
    width: 45, // Will be overridden by dynamicStyles
    height: 45, // Will be overridden by dynamicStyles
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  piece: {
    fontSize: 32,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  hintButton: {
    backgroundColor: "#f39c12",
  },
  resetButton: {
    backgroundColor: "#95a5a6",
  },
  controlButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
});