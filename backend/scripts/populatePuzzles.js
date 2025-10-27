// backend/scripts/populatePuzzles.js
const mongoose = require("mongoose");
const Puzzle = require("../src/models/Puzzle");
require("dotenv").config();

// Sample puzzles data - các puzzle cơ bản để test
const samplePuzzles = [
  {
    puzzleId: "puzzle_001",
    title: "Back Rank Mate",
    description: "Find the winning move in this back rank mate pattern",
    fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    moves: ["Re8#"],
    themes: ["back_rank", "checkmate"],
    rating: 800,
    difficulty: "beginner"
  },
  {
    puzzleId: "puzzle_002", 
    title: "Knight Fork",
    description: "Use your knight to fork the king and queen",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
    moves: ["Ng5", "d6", "Nxf7"],
    themes: ["fork", "knight", "tactics"],
    rating: 1000,
    difficulty: "beginner"
  },
  {
    puzzleId: "puzzle_003",
    title: "Pin the Piece",
    description: "Pin the opponent's piece to win material",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
    moves: ["Bb5"],
    themes: ["pin", "tactics"],
    rating: 900,
    difficulty: "beginner"
  },
  {
    puzzleId: "puzzle_004",
    title: "Skewer Attack",
    description: "Use a skewer to win the queen",
    fen: "r3k2r/1pp2ppp/p1pb1n2/4p1B1/2B1P3/2NP1N2/PPP2PPP/R2QK2R w KQkq - 0 8",
    moves: ["Bxf6", "gxf6", "Qd4"],
    themes: ["skewer", "queen", "tactics"],
    rating: 1200,
    difficulty: "intermediate"
  },
  {
    puzzleId: "puzzle_005",
    title: "Discovered Attack",
    description: "Find the powerful discovered attack",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 5 4",
    moves: ["Nd4"],
    themes: ["discovered_attack", "tactics"],
    rating: 1100,
    difficulty: "intermediate"
  },
  {
    puzzleId: "puzzle_006",
    title: "Double Attack",
    description: "Attack two pieces at once",
    fen: "rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 2 4",
    moves: ["Ng5"],
    themes: ["double_attack", "tactics"],
    rating: 950,
    difficulty: "beginner"
  },
  {
    puzzleId: "puzzle_007",
    title: "Smothered Mate",
    description: "Classic smothered mate pattern",
    fen: "6rk/6pp/8/8/8/8/8/5QNK w - - 0 1",
    moves: ["Nf7+", "Kg8", "Nh6+", "Kh8", "Qf8+", "Rxf8", "Nf7#"],
    themes: ["smothered_mate", "checkmate", "knight"],
    rating: 1500,
    difficulty: "advanced"
  },
  {
    puzzleId: "puzzle_008",
    title: "Remove the Defender",
    description: "Eliminate the key defender",
    fen: "r2qkb1r/ppp2ppp/2npbn2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w kq - 0 6",
    moves: ["Bxf7+", "Kxf7", "Ng5+"],
    themes: ["remove_defender", "tactics"],
    rating: 1300,
    difficulty: "intermediate"
  },
  {
    puzzleId: "puzzle_009",
    title: "Deflection Tactic",
    description: "Deflect the defending piece",
    fen: "r3k2r/ppp1qppp/2npbn2/2b1p3/2B1P3/3P1N2/PPP1QPPP/RNB2RK1 w kq - 0 8",
    moves: ["Qxe5+"],
    themes: ["deflection", "tactics"],
    rating: 1400,
    difficulty: "intermediate"
  },
  {
    puzzleId: "puzzle_010",
    title: "Interference",
    description: "Block the opponent's defense",
    fen: "r4rk1/1pp1qppp/p1npbn2/4p3/2B1P3/3P1N2/PPP1QPPP/RNB2RK1 b - - 0 10",
    moves: ["Nd4"],
    themes: ["interference", "tactics"],
    rating: 1600,
    difficulty: "advanced"
  }
];

async function populatePuzzles() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chess-online";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
    console.log("🔗 Using connection:", mongoUri.replace(/\/\/.*@/, '//***@')); // Hide credentials

    // Clear existing puzzles
    await Puzzle.deleteMany({});
    console.log("🗑️ Cleared existing puzzles");

    // Insert sample puzzles
    const puzzles = await Puzzle.insertMany(samplePuzzles);
    console.log(`✅ Inserted ${puzzles.length} sample puzzles`);

    // Show summary
    const counts = await Puzzle.aggregate([
      { $group: { 
        _id: "$difficulty", 
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }},
      { $sort: { avgRating: 1 } }
    ]);

    console.log("\n📊 Puzzle Summary:");
    counts.forEach(({ _id, count, avgRating }) => {
      console.log(`${_id}: ${count} puzzles (avg rating: ${Math.round(avgRating)})`);
    });

    console.log("\n🎯 Sample puzzles populated successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error populating puzzles:", error);
    process.exit(1);
  }
}

populatePuzzles();