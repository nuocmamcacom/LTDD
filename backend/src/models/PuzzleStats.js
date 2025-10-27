const mongoose = require("mongoose");

const puzzleAttemptSchema = new mongoose.Schema({
  // User & Puzzle identification
  userEmail: { type: String, required: true },
  puzzleId: { type: String, required: true },
  
  // Attempt details
  solved: { type: Boolean, required: true },
  timeSpent: { type: Number, required: true }, // seconds
  movesPlayed: [{ type: String }], // User's attempted moves
  hintsUsed: { type: Number, default: 0 },
  
  // Performance metrics
  ratingChange: { type: Number, default: 0 }, // +/- rating change
  accuracy: { type: Number, min: 0, max: 100 }, // Percentage accuracy
  
  // Metadata
  attemptNumber: { type: Number, default: 1 }, // If user retries same puzzle
  deviceType: { type: String, enum: ["mobile", "web", "tablet"], default: "web" },
}, { timestamps: true });

// User puzzle statistics
const userPuzzleStatsSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  
  // Overall statistics  
  puzzleRating: { type: Number, default: 1200 }, // User's puzzle rating
  puzzlesSolved: { type: Number, default: 0 },
  puzzlesAttempted: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // Total seconds on puzzles
  
  // Performance metrics
  averageAccuracy: { type: Number, default: 0 },
  averageTime: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 }, // Current solving streak
  longestStreak: { type: Number, default: 0 },
  
  // Daily tracking
  lastPuzzleDate: { type: Date },
  dailyGoal: { type: Number, default: 5 }, // Daily puzzle goal
  dailyProgress: { type: Number, default: 0 },
  
  // Themed progress
  themeStats: [{
    theme: { type: String, required: true },
    solved: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    rating: { type: Number, default: 1200 }
  }]
}, { timestamps: true });

// Indexes
puzzleAttemptSchema.index({ userEmail: 1, puzzleId: 1 });
puzzleAttemptSchema.index({ userEmail: 1, createdAt: -1 });
// userEmail index already created by unique constraint

module.exports = {
  PuzzleAttempt: mongoose.model("PuzzleAttempt", puzzleAttemptSchema),
  UserPuzzleStats: mongoose.model("UserPuzzleStats", userPuzzleStatsSchema)
};