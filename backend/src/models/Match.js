const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  whitePlayer: { type: String, required: true }, // email
  blackPlayer: { type: String, required: true }, // email
  winner: { type: String, enum: ["w", "b", "draw"], default: null },
  endReason: { 
    type: String, 
    enum: ["checkmate", "stalemate", "timeout", "resignation", "draw", "insufficient_material", "threefold_repetition", "fifty_move"], 
    default: null 
  },
  moves: [{ 
    san: String,      // Standard Algebraic Notation (e4, Nf3, etc.)
    fen: String,      // Board state after move
    timestamp: { type: Date, default: Date.now }
  }],
  finalFen: String,   // Final board position
  duration: Number,   // Game duration in seconds
  whiteTimeLeft: Number, // Time left for white player
  blackTimeLeft: Number, // Time left for black player
}, { timestamps: true });

module.exports = mongoose.model("Match", matchSchema);
