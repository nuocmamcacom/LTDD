const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  elo: { type: Number, default: 1000 },
  matchesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  // User role for admin system
  role: { 
    type: String, 
    enum: ["user", "admin"], 
    default: "user" 
  },
  // Admin actions tracking
  isBanned: { type: Boolean, default: false },
  bannedBy: { type: String },
  bannedAt: { type: Date },
  banReason: { type: String },
  // Session management
  activeSession: {
    sessionId: { type: String },
    deviceInfo: { type: String },
    loginTime: { type: Date },
    lastActivity: { type: Date }
  },
  // Friends & Social features
  onlineStatus: { 
    type: String, 
    enum: ["online", "offline", "away", "busy"], 
    default: "offline" 
  },
  lastSeen: { 
    type: Date, 
    default: Date.now 
  },
  friendsCount: { 
    type: Number, 
    default: 0 
  },
  // Profile & Privacy
  profilePicture: { type: String },
  bio: { type: String, maxlength: 200 },
  isPrivate: { type: Boolean, default: false },
  allowFriendRequests: { type: Boolean, default: true }
});

module.exports = mongoose.model("User", userSchema);
