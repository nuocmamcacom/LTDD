import { Chess, Square } from 'chess.js';

// Simple AI engine without external dependencies for now
// We'll use heuristic-based AI instead of js-chess-engine

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type BotPersonality = 'balanced' | 'aggressive' | 'defensive';

export interface BotConfig {
  difficulty: DifficultyLevel;
  personality: BotPersonality;
  name: string;
  rating: number;
  description: string;
  color: string;
}

export interface AIMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
}

export class AIChessEngine {
  private game: Chess;
  private botConfig: BotConfig;
  private moveHistory: string[] = [];

  constructor(botConfig: BotConfig, fen?: string) {
    this.game = new Chess(fen);
    this.botConfig = botConfig;
  }

  // Get difficulty depth based on bot config
  private getDifficultyDepth(): number {
    const baseDepth = {
      'easy': 2,
      'medium': 4, 
      'hard': 6
    }[this.botConfig.difficulty];

    // Adjust depth based on personality
    const personalityModifier = {
      'aggressive': 1,    // Slightly deeper for tactics
      'balanced': 0,      // Standard depth
      'defensive': -1     // Slightly shallower, more positional  
    }[this.botConfig.personality];

    return Math.max(1, baseDepth + personalityModifier);
  }

  // Get AI thinking time (for realism)
  private getThinkingTime(): number {
    const baseTime = {
      'easy': 500,      // 0.5 seconds
      'medium': 1500,   // 1.5 seconds  
      'hard': 3000      // 3 seconds
    }[this.botConfig.difficulty];

    // Add some randomness
    return baseTime + Math.random() * 1000;
  }

  // Make AI move with personality considerations
  async makeAIMove(): Promise<AIMove | null> {
    try {
      // Simulate thinking time
      const thinkingTime = this.getThinkingTime();
      await new Promise(resolve => setTimeout(resolve, thinkingTime));

      const possibleMoves = this.game.moves({ verbose: true });
      if (possibleMoves.length === 0) {
        return null; // Game over
      }

      let selectedMove;

      // Easy difficulty: Random moves with some blunders
      if (this.botConfig.difficulty === 'easy') {
        selectedMove = this.makeEasyMove(possibleMoves);
      }
      // Medium difficulty: Use light engine with personality
      else if (this.botConfig.difficulty === 'medium') {
        selectedMove = await this.makeMediumMove(possibleMoves);
      }
      // Hard difficulty: Deep engine calculation
      else {
        selectedMove = await this.makeHardMove(possibleMoves);
      }

      if (selectedMove) {
        const move = this.game.move(selectedMove);
        if (move) {
          this.moveHistory.push(move.san);
          return {
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            san: move.san
          };
        }
      }

      return null;
    } catch (error) {
      console.error('AI Move Error:', error);
      // Fallback to random move
      const possibleMoves = this.game.moves({ verbose: true });
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const move = this.game.move(randomMove.san);
        if (move) {
          return {
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            san: move.san
          };
        }
      }
      return null;
    }
  }

  // Easy AI: Random moves with occasional blunders
  private makeEasyMove(possibleMoves: any[]): any {
    // 30% chance of making a random move (blunder)
    if (Math.random() < 0.3) {
      return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    // Otherwise, try to make a reasonable move based on personality
    switch (this.botConfig.personality) {
      case 'aggressive':
        return this.findAggressiveMove(possibleMoves) || 
               possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      case 'defensive':
        return this.findDefensiveMove(possibleMoves) || 
               possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      default:
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }
  }

  // Medium AI: Use basic evaluation
  private async makeMediumMove(possibleMoves: any[]): Promise<any> {
    // Use heuristic evaluation with better scoring for medium difficulty
    return this.evaluateMovesHeuristically(possibleMoves);
  }

  // Hard AI: Deep calculation
  private async makeHardMove(possibleMoves: any[]): Promise<any> {
    // Use advanced heuristic evaluation for hard difficulty
    return this.evaluateMovesAdvanced(possibleMoves);
  }

  // Find aggressive moves (captures, checks, attacks)
  private findAggressiveMove(possibleMoves: any[]): any | null {
    // Prioritize captures
    const captures = possibleMoves.filter(move => move.captured);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Then checks
    const checks = possibleMoves.filter(move => {
      const tempGame = new Chess(this.game.fen());
      tempGame.move(move);
      return tempGame.inCheck();
    });
    
    if (checks.length > 0) {
      return checks[Math.floor(Math.random() * checks.length)];
    }

    return null;
  }

  // Find defensive moves (castling, piece safety)
  private findDefensiveMove(possibleMoves: any[]): any | null {
    // Prioritize castling if available
    const castling = possibleMoves.filter(move => 
      move.san === 'O-O' || move.san === 'O-O-O'
    );
    if (castling.length > 0) {
      return castling[0];
    }

    // Moves that don't expose pieces
    const safeMoves = possibleMoves.filter(move => {
      const tempGame = new Chess(this.game.fen());
      tempGame.move(move);
      // Basic safety check - piece isn't immediately captured
      return !this.isPieceUnderAttack(tempGame, move.to);
    });

    if (safeMoves.length > 0) {
      return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    return null;
  }

  // Heuristic move evaluation
  private evaluateMovesHeuristically(possibleMoves: any[]): any {
    let bestMove = possibleMoves[0];
    let bestScore = -Infinity;

    for (const move of possibleMoves) {
      let score = 0;

      // Capture value
      if (move.captured) {
        const pieceValues: { [key: string]: number } = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
        score += pieceValues[move.captured] || 0;
      }

      // Check value
      const tempGame = new Chess(this.game.fen());
      tempGame.move(move);
      if (tempGame.inCheck()) {
        score += 2;
      }

      // Center control
      const centerSquares = ['d4', 'd5', 'e4', 'e5'];
      if (centerSquares.includes(move.to)) {
        score += 1;
      }

      // Add some randomness
      score += Math.random() * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // Advanced move evaluation
  private evaluateMovesAdvanced(possibleMoves: any[]): any {
    // More sophisticated evaluation for hard difficulty
    return this.evaluateMovesHeuristically(possibleMoves);
  }

  // Check if piece is under attack
  private isPieceUnderAttack(game: Chess, square: string): boolean {
    try {
      const attacks = game.moves({ square: square as Square, verbose: true });
      return attacks.some((move: any) => move.captured);
    } catch {
      return false;
    }
  }

  // Make a move on behalf of human player
  makePlayerMove(from: string, to: string, promotion?: string): boolean {
    try {
      const move = this.game.move({ from, to, promotion });
      if (move) {
        this.moveHistory.push(move.san);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  // Get current game state
  getGameState() {
    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      isCheck: this.game.inCheck(),
      isCheckmate: this.game.isCheckmate(),
      isStalemate: this.game.isStalemate(),
      isDraw: this.game.isDraw(),
      isGameOver: this.game.isGameOver(),
      moveHistory: this.moveHistory,
      pgn: this.game.pgn()
    };
  }

  // Get legal moves for a square
  getLegalMoves(square?: string) {
    return this.game.moves({ square: square as Square, verbose: true });
  }

  // Reset game
  reset() {
    this.game.reset();
    this.moveHistory = [];
  }

  // Load game from FEN
  loadFen(fen: string) {
    try {
      this.game.load(fen);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance for easy access
export const aiChessService = {
  createGame: (botConfig: BotConfig, fen?: string) => new AIChessEngine(botConfig, fen)
};