// backend/src/routes/puzzleRoutes.js
const express = require("express");
const Puzzle = require("../models/Puzzle");
const { PuzzleAttempt, UserPuzzleStats } = require("../models/PuzzleStats");

const router = express.Router();

// 📌 Get random puzzle based on user rating
router.get("/random", async (req, res) => {
  try {
    const { userEmail, difficulty, theme } = req.query;
    console.log("📥 [GET /api/puzzles/random]", { userEmail, difficulty, theme });

    // Get user's current puzzle rating
    let userStats = await UserPuzzleStats.findOne({ userEmail });
    const userRating = userStats?.puzzleRating || 1200;
    
    // Calculate rating range (±300 points, more flexible)
    const minRating = Math.max(600, userRating - 300);
    const maxRating = Math.min(3000, userRating + 300);
    
    // Build query
    let query = {
      isActive: true,
      rating: { $gte: minRating, $lte: maxRating }
    };
    
    if (difficulty) query.difficulty = difficulty;
    if (theme) query.themes = { $in: [theme] };
    
    console.log("🔍 [PUZZLE QUERY]", { query, userRating, range: `${minRating}-${maxRating}` });
    
    // Get random puzzle
    let puzzles = await Puzzle.aggregate([
      { $match: query },
      { $sample: { size: 1 } }
    ]);
    
    // If no puzzles found with rating filter, try without rating filter
    if (puzzles.length === 0) {
      console.log("⚠️ [NO PUZZLES IN RATING RANGE] Trying without rating filter...");
      
      let fallbackQuery = { isActive: true };
      if (difficulty) fallbackQuery.difficulty = difficulty;
      if (theme) fallbackQuery.themes = { $in: [theme] };
      
      puzzles = await Puzzle.aggregate([
        { $match: fallbackQuery },
        { $sample: { size: 1 } }
      ]);
    }
    
    if (puzzles.length === 0) {
      console.log("❌ [NO PUZZLES FOUND]", { query, fallbackQuery });
      return res.status(404).json({ error: "No puzzles found matching criteria" });
    }
    
    console.log("✅ [RANDOM PUZZLE]", { 
      puzzleId: puzzles[0].puzzleId, 
      rating: puzzles[0].rating,
      userRating 
    });
    res.json(puzzles[0]);
  } catch (err) {
    console.error("❌ [ERROR GET RANDOM PUZZLE]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Get puzzle by ID
router.get("/:puzzleId", async (req, res) => {
  try {
    const { puzzleId } = req.params;
    console.log("📥 [GET /api/puzzles/:puzzleId]", { puzzleId });

    const puzzle = await Puzzle.findOne({ puzzleId, isActive: true });
    if (!puzzle) {
      console.warn("⚠️ [PUZZLE NOT FOUND]", puzzleId);
      return res.status(404).json({ error: "Puzzle not found" });
    }

    console.log("✅ [PUZZLE FOUND]", { puzzleId: puzzle.puzzleId, rating: puzzle.rating });
    res.json(puzzle);
  } catch (err) {
    console.error("❌ [ERROR GET PUZZLE]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Submit puzzle attempt
router.post("/attempt", async (req, res) => {
  try {
    const { 
      userEmail, 
      puzzleId, 
      solved, 
      timeSpent, 
      movesPlayed, 
      hintsUsed = 0 
    } = req.body;
    
    console.log("📥 [POST /api/puzzles/attempt]", { 
      userEmail, 
      puzzleId, 
      solved, 
      timeSpent 
    });

    // Get puzzle and user stats
    const puzzle = await Puzzle.findOne({ puzzleId });
    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle not found" });
    }

    let userStats = await UserPuzzleStats.findOne({ userEmail });
    if (!userStats) {
      userStats = new UserPuzzleStats({ userEmail });
    }

    // Calculate rating change using ELO-like system
    const expectedScore = 1 / (1 + Math.pow(10, (puzzle.rating - userStats.puzzleRating) / 400));
    const actualScore = solved ? 1 : 0;
    const kFactor = 32; // Rating volatility
    const ratingChange = Math.round(kFactor * (actualScore - expectedScore));

    // Calculate accuracy based on optimal moves vs user moves
    const optimalMoves = puzzle.moves.length;
    const userMoves = movesPlayed.length;
    const accuracy = solved ? Math.max(0, 100 - ((userMoves - optimalMoves) * 10)) : 0;

    // Create attempt record
    const attempt = new PuzzleAttempt({
      userEmail,
      puzzleId,
      solved,
      timeSpent,
      movesPlayed,
      hintsUsed,
      ratingChange,
      accuracy
    });

    await attempt.save();

    // Update user stats
    userStats.puzzlesAttempted += 1;
    if (solved) {
      userStats.puzzlesSolved += 1;
      userStats.currentStreak += 1;
      userStats.longestStreak = Math.max(userStats.longestStreak, userStats.currentStreak);
    } else {
      userStats.currentStreak = 0;
    }

    userStats.puzzleRating += ratingChange;
    userStats.totalTimeSpent += timeSpent;
    userStats.averageTime = userStats.totalTimeSpent / userStats.puzzlesAttempted;
    userStats.averageAccuracy = (userStats.averageAccuracy * (userStats.puzzlesAttempted - 1) + accuracy) / userStats.puzzlesAttempted;
    userStats.lastPuzzleDate = new Date();

    // Update daily progress
    const today = new Date().toDateString();
    const lastPuzzleDay = userStats.lastPuzzleDate ? userStats.lastPuzzleDate.toDateString() : null;
    
    if (lastPuzzleDay !== today) {
      userStats.dailyProgress = 1;
    } else {
      userStats.dailyProgress += 1;
    }

    await userStats.save();

    // Update puzzle statistics
    puzzle.popularity += 1;
    if (solved) {
      puzzle.successRate = (puzzle.successRate * (puzzle.popularity - 1) + 100) / puzzle.popularity;
    } else {
      puzzle.successRate = (puzzle.successRate * (puzzle.popularity - 1)) / puzzle.popularity;
    }
    puzzle.averageTime = (puzzle.averageTime * (puzzle.popularity - 1) + timeSpent) / puzzle.popularity;
    
    await puzzle.save();

    console.log("✅ [ATTEMPT RECORDED]", { 
      solved, 
      ratingChange, 
      newRating: userStats.puzzleRating,
      accuracy 
    });

    res.json({
      success: true,
      solved,
      ratingChange,
      newRating: userStats.puzzleRating,
      accuracy,
      currentStreak: userStats.currentStreak,
      dailyProgress: userStats.dailyProgress
    });
  } catch (err) {
    console.error("❌ [ERROR SUBMIT ATTEMPT]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Get user puzzle statistics
router.get("/stats/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;
    console.log("📥 [GET /api/puzzles/stats/:userEmail]", { userEmail });

    let userStats = await UserPuzzleStats.findOne({ userEmail });
    if (!userStats) {
      userStats = new UserPuzzleStats({ userEmail });
      await userStats.save();
    }

    // Get recent attempts for progress tracking
    const recentAttempts = await PuzzleAttempt.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('solved timeSpent accuracy createdAt');

    console.log("✅ [USER STATS]", { 
      rating: userStats.puzzleRating, 
      solved: userStats.puzzlesSolved 
    });

    res.json({
      ...userStats.toObject(),
      recentAttempts
    });
  } catch (err) {
    console.error("❌ [ERROR GET USER STATS]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Get puzzle themes/categories
router.get("/meta/themes", async (req, res) => {
  try {
    console.log("📥 [GET /api/puzzles/meta/themes]");
    
    const themes = await Puzzle.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$themes" },
      { $group: { 
        _id: "$themes", 
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }},
      { $sort: { count: -1 } }
    ]);

    console.log("✅ [THEMES]", themes.length);
    res.json(themes);
  } catch (err) {
    console.error("❌ [ERROR GET THEMES]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;