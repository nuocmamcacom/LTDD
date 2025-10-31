// app/screens/Game/GameBoard.tsx
import { Chess, Square } from "chess.js";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useChessColors, useChessStyles, useChessTheme } from "../../../constants/ChessThemeProvider";
import { ChessTimer } from "../../components/ChessTimer";
import { useLanguage } from "../../providers/LanguageProvider";
import { soundManager } from "../../services/soundManager";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Props = {
  myColor: "w" | "b";
  onMove?: (san: string, fen: string) => void;
  remoteFen?: string | null;
  onGameEnd?: (result: { winner: "w" | "b" | "draw", reason: string }) => void;
  gameTimeMinutes?: number; // Add timer duration
};

const unicode: Record<string, string> = {
  pw: "♙", nw: "♘", bw: "♗", rw: "♖", qw: "♕", kw: "♔",
  pb: "♟", nb: "♞", bb: "♝", rb: "♜", qb: "♛", kb: "♚",
};

export default function GameBoard({ myColor, onMove, onGameEnd, gameTimeMinutes = 10 }: Props) {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [from, setFrom] = useState<Square | null>(null);
  const [legal, setLegal] = useState<Square[]>([]);
  const [gameStatus, setGameStatus] = useState<string>("");
  
  // ✅ Timer states
  const [whiteTime, setWhiteTime] = useState(gameTimeMinutes * 60);
  const [blackTime, setBlackTime] = useState(gameTimeMinutes * 60);
  const [gameStarted, setGameStarted] = useState(false);
  
  // ✅ Promotion states
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{from: Square, to: Square} | null>(null);
  
  // Theme and responsive sizing
  const chessTheme = useChessTheme();
  const chessStyles = useChessStyles();
  const chessColors = useChessColors();
  
  // Calculate responsive board size
  const boardPadding = 40; // Total padding around board
  const availableWidth = screenWidth - boardPadding;
  const availableHeight = screenHeight * 0.6; // Use 60% of screen height for board area
  const maxBoardSize = Math.min(availableWidth, availableHeight);
  const squareSize = Math.floor(maxBoardSize / 8);
  const boardSize = squareSize * 8;
  
  const remoteFenProp = (arguments[0] as any)?.remoteFen as string | null | undefined;
  const { t } = useLanguage();

  // 🔊 Initialize sound manager
  useEffect(() => {
    soundManager.loadSounds();
    
    return () => {
      soundManager.cleanup();
    };
  }, []);

  // Timer handlers
  const handleTimeUp = (color: 'w' | 'b') => {
    const winner = color === 'w' ? 'b' : 'w';
    onGameEnd?.({ winner, reason: 'timeout' });
  };

  // ✅ Function to check game status
  const checkGameStatus = () => {
    let status = "";
    
    if (game.isCheckmate()) {
      const winner = game.turn() === "w" ? "b" : "w"; // Opposite of current turn won
      status = `🏆 ${winner === "w" ? t('game', 'white') : t('game', 'black')} ${t('game', 'wins')}! (${t('game', 'checkmate')})`;
      soundManager.playSound('gameOver');
      onGameEnd?.({ winner, reason: "checkmate" });
    } else if (game.isDraw()) {
      status = `🤝 ${t('game', 'draw')}!`;
      if (game.isStalemate()) status += ` (${t('game', 'stalemate')})`;
      else if (game.isThreefoldRepetition()) status += ` (${t('game', 'threefoldRepetition')})`;
      else if (game.isInsufficientMaterial()) status += ` (${t('game', 'insufficientMaterial')})`;
      else status += ` (${t('game', 'fiftyMoveRule')})`;
      soundManager.playSound('gameOver');
      onGameEnd?.({ winner: "draw", reason: "draw" });
    } else if (game.isCheck()) {
      status = `⚠️ ${game.turn() === "w" ? t('game', 'white') : t('game', 'black')} ${t('game', 'isInCheck')}!`;
      soundManager.playSound('check');
    } else {
      status = `${t('game', 'turn')}: ${game.turn() === "w" ? t('game', 'white') : t('game', 'black')}`;
    }
    
    setGameStatus(status);
    return status;
  };

  const board = useMemo(() => {
    // ✅ KHÔNG reverse board, luôn giữ nguyên layout của chess.js
    // Thay đổi cách render và coordinate mapping
    return game.board();
  }, [fen]);

  const algebraicAt = (rowIdx: number, colIdx: number): Square => {
    // Simple coordinate mapping - no complex logic
    const file = "abcdefgh"[colIdx];
    const rank = 8 - rowIdx;
    
    return `${file}${rank}` as Square;
  };

  const renderBoard = () => {
    // ✅ Simplified approach: Always render in the same order
    // Only change coordinate mapping, not the rendering order
    const rowsToRender = myColor === "w" ? board : [...board].reverse();
    
    return rowsToRender.map((row, r) => {
      const colsToRender = myColor === "w" ? row : [...row].reverse();
      
      return (
        <View key={`r${r}`} style={styles.row}>
          {colsToRender.map((cell, c) => {
            // Calculate the actual board position based on player color
            const actualR = myColor === "w" ? r : (7 - r);
            const actualC = myColor === "w" ? c : (7 - c);
            
            return renderSquare(r, c, cell, actualR, actualC);
          })}
        </View>
      );
    });
  };

  const renderSquare = (displayR: number, displayC: number, cell: any, actualR: number, actualC: number) => {
    const sq = algebraicAt(actualR, actualC);
    const isDark = (displayR + displayC) % 2 === 1;
    const isFrom = from === sq;
    const isLegal = legal.includes(sq);

    let bg = isDark ? "#769656" : "#eeeed2";
    if (isFrom) bg = "#f7dc6f";
    else if (isLegal) bg = "#baca44";

    const key = cell ? `${cell.type}${cell.color}` : "";
    const pieceChar = cell && key ? unicode[`${cell.type}${cell.color}`] : "";

    // Dynamic font size based on square size
    const fontSize = squareSize * 0.7; // 70% of square size

    return (
      <TouchableOpacity
        key={`c${displayC}`}
        style={[
          styles.square, 
          { 
            backgroundColor: bg,
            width: squareSize,
            height: squareSize,
            borderColor: chessColors.border,
          }
        ]}
        activeOpacity={0.8}
        onPress={() => onSquarePress(actualR, actualC)}
      >
        <Text style={[styles.piece, { fontSize }]}>{pieceChar}</Text>
      </TouchableOpacity>
    );
  };

  const onSquarePress = (rowIdx: number, colIdx: number) => {
    const sq = algebraicAt(rowIdx, colIdx);
    const currentPiece = game.get(sq);

    // Check if it's player's turn
    const currentTurn = game.turn();
    
    if (currentTurn !== myColor) {
      return;
    }

    // If no piece selected, select piece of correct color
    if (!from) {
      if (!currentPiece || currentPiece.color !== myColor) {
        return;
      }
      setFrom(sq);
      const moves = game.moves({ square: sq, verbose: true }) as any[];
      setLegal(moves.map((m) => m.to as Square));
      return;
    }

    // If selecting a different piece of same color, change selection
    if (currentPiece && currentPiece.color === myColor && sq !== from) {
      setFrom(sq);
      const moves = game.moves({ square: sq, verbose: true }) as any[];
      setLegal(moves.map((m) => m.to as Square));
      return;
    }

    // Check if move is valid first
    const testMove = game.moves({ square: from, verbose: true }).find((m: any) => m.to === sq);
    if (!testMove) {
      setFrom(null);
      setLegal([]);
      return;
    }

    // Check if this is a pawn promotion
    const selectedPiece = game.get(from);
    const isPromotion = selectedPiece?.type === 'p' && 
      ((selectedPiece.color === 'w' && sq[1] === '8') || (selectedPiece.color === 'b' && sq[1] === '1'));

    if (isPromotion) {
      // Show promotion dialog
      setPendingMove({ from, to: sq });
      setShowPromotionDialog(true);
      setFrom(null);
      setLegal([]);
      return;
    }

    // Try to make move (non-promotion)
    const move = game.move({ from, to: sq });
    if (move) {
      setFen(game.fen());
      
      // Play appropriate sound
      if (move.captured) {
        soundManager.playSound('capture');
      } else {
        soundManager.playSound('move');
      }
      
      // Start game timer on first move
      if (!gameStarted) {
        setGameStarted(true);
      }
      
      onMove?.(move.san, game.fen());
      
      // Check game status after move
      setTimeout(() => checkGameStatus(), 100);
    }
    setFrom(null);
    setLegal([]);
  };

  // Handle promotion piece selection
  const handlePromotion = (promotionPiece: 'q' | 'r' | 'b' | 'n') => {
    if (!pendingMove) return;

    const game = new Chess(fen);
    const move = game.move({ 
      from: pendingMove.from, 
      to: pendingMove.to, 
      promotion: promotionPiece 
    });
    
    if (move) {
      setFen(game.fen());
      
      // Play appropriate sound
      if (move.captured) {
        soundManager.playSound('capture');
      } else {
        soundManager.playSound('move');
      }
      
      // Start game timer on first move
      if (!gameStarted) {
        setGameStarted(true);
      }
      
      onMove?.(move.san, game.fen());
      
      // Check game status after move
      setTimeout(() => checkGameStatus(), 100);
    }

    // Close dialog and clear pending move
    setShowPromotionDialog(false);
    setPendingMove(null);
  };

  // Apply remote FEN when parent provides an update (from socket)
  React.useEffect(() => {
    const remoteFen = remoteFenProp;
    
    if (!remoteFen) {
      return;
    }
    if (remoteFen === fen) {
      return;
    }
    
    try {
      game.load(remoteFen);
      setFen(game.fen());
      setFrom(null);
      setLegal([]);
      // Check status after remote move
      setTimeout(() => checkGameStatus(), 100);
    } catch (e) {
      // ignore invalid FENs
      console.warn("❌ Invalid remote FEN", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteFenProp]);

  // ✅ Check initial status
  React.useEffect(() => {
    checkGameStatus();
  }, []);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: chessColors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Chess.com style timers */}
          <View style={[styles.timersContainer, { width: boardSize }]}>
            <ChessTimer
              initialTime={myColor === 'b' ? blackTime : whiteTime}
              isActive={gameStarted && game.turn() === (myColor === 'b' ? 'b' : 'w')}
              playerColor={myColor === 'b' ? 'b' : 'w'}
              playerName={t('game', 'you')}
              onTimeUp={() => handleTimeUp(myColor === 'b' ? 'b' : 'w')}
            />
            <ChessTimer
              initialTime={myColor === 'b' ? whiteTime : blackTime}
              isActive={gameStarted && game.turn() === (myColor === 'b' ? 'w' : 'b')}
              playerColor={myColor === 'b' ? 'w' : 'b'}
              playerName={t('game', 'opponent')}
              onTimeUp={() => handleTimeUp(myColor === 'b' ? 'w' : 'b')}
            />
          </View>

          <View style={[styles.boardContainer, { width: boardSize, height: boardSize }]}>
            {renderBoard()}
          </View>

          <View style={[styles.info, { width: boardSize, backgroundColor: chessColors.backgroundSecondary, borderColor: chessColors.border }]}>
            <Text style={[styles.statusText, { 
              color: gameStatus.includes("wins") || gameStatus.includes(t('game', 'wins')) ? chessColors.success : 
                    gameStatus.includes("Check") || gameStatus.includes(t('game', 'isInCheck')) ? chessColors.primary : chessColors.text
            }]}>
              {gameStatus}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.btn, styles.undoBtn, { backgroundColor: chessColors.buttonSecondary }]}
                onPress={() => {
                  game.undo();
                  setFen(game.fen());
                  setFrom(null);
                  setLegal([]);
                  checkGameStatus();
                }}
              >
                <Text style={[styles.btnText, { color: chessColors.textInverse }]}>{t('game', 'undo')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.resetBtn, { backgroundColor: chessColors.error }]}
                onPress={() => {
                  game.reset();
                  setFen(game.fen());
                  setFrom(null);
                  setLegal([]);
                  setGameStarted(false);
                  checkGameStatus();
                }}
              >
                <Text style={[styles.btnText, { color: chessColors.textInverse }]}>{t('game', 'reset')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Promotion Dialog */}
      <Modal
        visible={showPromotionDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowPromotionDialog(false);
          setPendingMove(null);
        }}
      >
        <View style={styles.promotionOverlay}>
          <View style={[styles.promotionDialog, { backgroundColor: chessColors.backgroundSecondary }]}>
            <Text style={[styles.promotionTitle, { color: chessColors.text }]}>
              {t('game', 'choosePromotionPiece') || 'Choose piece to promote to:'}
            </Text>
            
            <View style={styles.promotionPieces}>
              <TouchableOpacity 
                style={[styles.promotionPiece, { backgroundColor: chessColors.background }]} 
                onPress={() => handlePromotion('q')}
              >
                <Text style={styles.promotionPieceText}>
                  {myColor === 'w' ? '♕' : '♛'}
                </Text>
                <Text style={[styles.promotionLabel, { color: chessColors.textSecondary }]}>
                  {t('game', 'queen') || 'Queen'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.promotionPiece, { backgroundColor: chessColors.background }]} 
                onPress={() => handlePromotion('r')}
              >
                <Text style={styles.promotionPieceText}>
                  {myColor === 'w' ? '♖' : '♜'}
                </Text>
                <Text style={[styles.promotionLabel, { color: chessColors.textSecondary }]}>
                  {t('game', 'rook') || 'Rook'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.promotionPiece, { backgroundColor: chessColors.background }]} 
                onPress={() => handlePromotion('b')}
              >
                <Text style={styles.promotionPieceText}>
                  {myColor === 'w' ? '♗' : '♝'}
                </Text>
                <Text style={[styles.promotionLabel, { color: chessColors.textSecondary }]}>
                  {t('game', 'bishop') || 'Bishop'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.promotionPiece, { backgroundColor: chessColors.background }]} 
                onPress={() => handlePromotion('n')}
              >
                <Text style={styles.promotionPieceText}>
                  {myColor === 'w' ? '♘' : '♞'}
                </Text>
                <Text style={[styles.promotionLabel, { color: chessColors.textSecondary }]}>
                  {t('game', 'knight') || 'Knight'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  wrapper: { 
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: screenHeight * 0.9,
  },
  timersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  boardContainer: {
    marginBottom: 20,
  },
  row: { 
    flexDirection: "row" 
  },
  square: { 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 0.5,
  },
  piece: { 
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  info: { 
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statusText: { 
    fontSize: 20,
    fontWeight: '600',
    textAlign: "center",
    marginBottom: 8,
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  btn: { 
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  undoBtn: {
    // backgroundColor will be dynamic
  },
  resetBtn: {
    // backgroundColor will be dynamic
  },
  btnText: { 
    fontSize: 16,
    fontWeight: '600',
  },
  // Promotion dialog styles
  promotionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionDialog: {
    padding: 20,
    borderRadius: 16,
    margin: 20,
    alignItems: 'center',
    minWidth: 280,
  },
  promotionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  promotionPieces: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  promotionPiece: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 60,
    margin: 4,
  },
  promotionPieceText: {
    fontSize: 32,
    marginBottom: 4,
  },
  promotionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
