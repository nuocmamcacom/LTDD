const mongoose = require("mongoose");

const puzzleSchema = new mongoose.Schema({
  // Puzzle identification
  puzzleId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  
  // Puzzle data
  fen: { type: String, required: true }, // Starting position
  moves: [{ type: String, required: true }], // Solution moves in algebraic notation
  themes: [{ type: String }], // e.g., ["fork", "pin", "skewer", "back_rank"]
  
  // Difficulty & Rating
  rating: { type: Number, required: true, min: 600, max: 3000 }, // Puzzle rating
  difficulty: { 
    type: String, 
    enum: ["beginner", "intermediate", "advanced", "expert"], 
    required: true 
  },
  
  // Metadata
  popularity: { type: Number, default: 0 }, // Number of times solved
  successRate: { type: Number, default: 0 }, // Percentage of correct solutions
  averageTime: { type: Number, default: 0 }, // Average solve time in seconds
  
  // Source information
  source: { type: String, default: "lichess" }, // Where puzzle came from
  gameUrl: { type: String }, // Original game URL if available
  
  // Administrative
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }], // Additional tags for filtering
}, { timestamps: true });

// Indexes for performance
puzzleSchema.index({ rating: 1 });
puzzleSchema.index({ difficulty: 1 });
puzzleSchema.index({ themes: 1 });
puzzleSchema.index({ isActive: 1 });

module.exports = mongoose.model("Puzzle", puzzleSchema);