const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema({
  user1: { 
    type: String, 
    required: true,
    ref: 'User'
  },
  user2: { 
    type: String, 
    required: true,
    ref: 'User'
  },
  status: { 
    type: String, 
    enum: ["active", "blocked"], 
    default: "active" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Compound index to ensure no duplicate friendships
friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Helper method to check if two users are friends
friendshipSchema.statics.areFriends = async function(email1, email2) {
  const friendship = await this.findOne({
    $or: [
      { user1: email1, user2: email2, status: "active" },
      { user1: email2, user2: email1, status: "active" }
    ]
  });
  return !!friendship;
};

// Helper method to get user's friends
friendshipSchema.statics.getUserFriends = async function(userEmail) {
  const User = require('./User');
  
  const friendships = await this.find({
    $or: [
      { user1: userEmail, status: "active" },
      { user2: userEmail, status: "active" }
    ]
  });
  
  // Manually populate friend data
  const friendsWithData = await Promise.all(
    friendships.map(async (friendship) => {
      let friendEmail;
      
      // Determine which user is the friend (not the current user)
      if (friendship.user1 === userEmail) {
        friendEmail = friendship.user2;
      } else {
        friendEmail = friendship.user1;
      }
      
      // Get friend's data
      const friendData = await User.findOne({ email: friendEmail })
        .select('email name elo onlineStatus lastSeen profilePicture');
      
      if (!friendData) {
        return null; // Skip if friend data not found
      }
      
      return {
        ...friendData.toObject(),
        friendshipId: friendship._id,
        friendsSince: friendship.createdAt
      };
    })
  );
  
  // Filter out null values
  return friendsWithData.filter(friend => friend !== null);
};

module.exports = mongoose.model("Friendship", friendshipSchema);