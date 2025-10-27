import AsyncStorage from '@react-native-async-storage/async-storage';
import { BotConfig } from './aiChessEngine';

const AI_STATS_KEY = '@chess_ai_stats';

export interface AIGameResult {
  id: string;
  botConfig: BotConfig;
  result: 'win' | 'lose' | 'draw';
  moveCount: number;
  duration: number; // seconds
  date: string;
  pgn: string;
}

export interface AIPlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageGameLength: number;
  favoriteBot: string;
  longestGame: number;
  shortestWin: number;
  currentStreak: number;
  bestStreak: number;
  easyBotStats: BotLevelStats;
  mediumBotStats: BotLevelStats;
  hardBotStats: BotLevelStats;
}

export interface BotLevelStats {
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export class AIStatsManager {
  private static instance: AIStatsManager;
  private stats: AIPlayerStats | null = null;
  private games: AIGameResult[] = [];

  static getInstance(): AIStatsManager {
    if (!AIStatsManager.instance) {
      AIStatsManager.instance = new AIStatsManager();
    }
    return AIStatsManager.instance;
  }

  async loadStats(): Promise<AIPlayerStats> {
    try {
      const stored = await AsyncStorage.getItem(AI_STATS_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.stats = data.stats;
        this.games = data.games || [];
      } else {
        this.stats = this.createEmptyStats();
        this.games = [];
      }
      return this.stats!;
    } catch (error) {
      console.error('Failed to load AI stats:', error);
      this.stats = this.createEmptyStats();
      return this.stats;
    }
  }

  async saveGame(gameResult: AIGameResult): Promise<void> {
    try {
      // Add game to history
      this.games.unshift(gameResult);
      
      // Keep only last 100 games
      if (this.games.length > 100) {
        this.games = this.games.slice(0, 100);
      }

      // Update stats
      if (!this.stats) {
        this.stats = this.createEmptyStats();
      }

      this.updateStatsWithGame(gameResult);

      // Save to storage
      await AsyncStorage.setItem(AI_STATS_KEY, JSON.stringify({
        stats: this.stats,
        games: this.games
      }));
    } catch (error) {
      console.error('Failed to save AI game:', error);
    }
  }

  private updateStatsWithGame(game: AIGameResult): void {
    if (!this.stats) return;

    // Update overall stats
    this.stats.totalGames++;
    
    if (game.result === 'win') {
      this.stats.wins++;
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.currentStreak;
      }
    } else {
      this.stats.currentStreak = 0;
      if (game.result === 'lose') {
        this.stats.losses++;
      } else {
        this.stats.draws++;
      }
    }

    // Update difficulty-specific stats
    const difficultyStats = this.getDifficultyStats(game.botConfig.difficulty);
    difficultyStats.games++;
    
    if (game.result === 'win') {
      difficultyStats.wins++;
    } else if (game.result === 'lose') {
      difficultyStats.losses++;
    } else {
      difficultyStats.draws++;
    }

    // Recalculate rates
    this.recalculateStats();

    // Update favorite bot
    this.updateFavoriteBot();

    // Update game length records
    this.updateGameLengthRecords(game);
  }

  private recalculateStats(): void {
    if (!this.stats) return;

    // Overall win rate
    this.stats.winRate = this.stats.totalGames > 0 
      ? Math.round((this.stats.wins / this.stats.totalGames) * 100) 
      : 0;

    // Average game length
    const totalMoves = this.games.reduce((sum, game) => sum + game.moveCount, 0);
    this.stats.averageGameLength = this.games.length > 0 
      ? Math.round(totalMoves / this.games.length) 
      : 0;

    // Difficulty-specific win rates
    this.stats.easyBotStats.winRate = this.calculateWinRate(this.stats.easyBotStats);
    this.stats.mediumBotStats.winRate = this.calculateWinRate(this.stats.mediumBotStats);
    this.stats.hardBotStats.winRate = this.calculateWinRate(this.stats.hardBotStats);
  }

  private calculateWinRate(stats: BotLevelStats): number {
    return stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  }

  private getDifficultyStats(difficulty: string): BotLevelStats {
    if (!this.stats) throw new Error('Stats not initialized');
    
    switch (difficulty) {
      case 'easy': return this.stats.easyBotStats;
      case 'medium': return this.stats.mediumBotStats;
      case 'hard': return this.stats.hardBotStats;
      default: return this.stats.easyBotStats;
    }
  }

  private updateFavoriteBot(): void {
    if (!this.stats || this.games.length === 0) return;

    const botCounts: { [key: string]: number } = {};
    this.games.forEach(game => {
      botCounts[game.botConfig.name] = (botCounts[game.botConfig.name] || 0) + 1;
    });

    const mostPlayedBot = Object.keys(botCounts).reduce((a, b) => 
      botCounts[a] > botCounts[b] ? a : b
    );

    this.stats.favoriteBot = mostPlayedBot;
  }

  private updateGameLengthRecords(game: AIGameResult): void {
    if (!this.stats) return;

    // Longest game
    if (game.moveCount > this.stats.longestGame) {
      this.stats.longestGame = game.moveCount;
    }

    // Shortest win
    if (game.result === 'win') {
      if (this.stats.shortestWin === 0 || game.moveCount < this.stats.shortestWin) {
        this.stats.shortestWin = game.moveCount;
      }
    }
  }

  private createEmptyStats(): AIPlayerStats {
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      averageGameLength: 0,
      favoriteBot: '',
      longestGame: 0,
      shortestWin: 0,
      currentStreak: 0,
      bestStreak: 0,
      easyBotStats: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
      mediumBotStats: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 },
      hardBotStats: { games: 0, wins: 0, losses: 0, draws: 0, winRate: 0 }
    };
  }

  async getStats(): Promise<AIPlayerStats> {
    if (!this.stats) {
      return await this.loadStats();
    }
    return this.stats;
  }

  async getRecentGames(limit: number = 10): Promise<AIGameResult[]> {
    if (this.games.length === 0) {
      await this.loadStats();
    }
    return this.games.slice(0, limit);
  }

  async clearStats(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AI_STATS_KEY);
      this.stats = this.createEmptyStats();
      this.games = [];
    } catch (error) {
      console.error('Failed to clear AI stats:', error);
    }
  }
}

// Export singleton instance
export const aiStatsManager = AIStatsManager.getInstance();