const mongoose = require("mongoose");

const friendRequestSchema = new mongoose.Schema({
  senderEmail: { 
    type: String, 
    required: true,
    ref: 'User'
  },
  receiverEmail: { 
    type: String, 
    required: true,
    ref: 'User'
  },
  status: { 
    type: String, 
    enum: ["pending", "accepted", "declined", "cancelled"], 
    default: "pending" 
  },
  message: { 
    type: String, 
    maxlength: 200 
  },
  respondedAt: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// Compound index to prevent duplicate requests
friendRequestSchema.index({ senderEmail: 1, receiverEmail: 1 }, { unique: true });

// Helper method to get pending requests for a user
friendRequestSchema.statics.getPendingRequests = async function(userEmail) {
  const User = require('./User');
  
  const requests = await this.find({
    receiverEmail: userEmail,
    status: "pending"
  }).sort({ createdAt: -1 });

  // Manually populate sender data
  const populatedRequests = await Promise.all(
    requests.map(async (request) => {
      const sender = await User.findOne({ email: request.senderEmail })
        .select('email name elo onlineStatus');
      return {
        ...request.toObject(),
        senderData: sender
      };
    })
  );

  return populatedRequests;
};

// Helper method to get sent requests for a user
friendRequestSchema.statics.getSentRequests = async function(userEmail) {
  const User = require('./User');
  
  const requests = await this.find({
    senderEmail: userEmail,
    status: { $in: ["pending", "cancelled"] } // Include cancelled to show in UI
  }).sort({ createdAt: -1 });

  // Manually populate receiver data
  const populatedRequests = await Promise.all(
    requests.map(async (request) => {
      const receiver = await User.findOne({ email: request.receiverEmail })
        .select('email name elo onlineStatus');
      return {
        ...request.toObject(),
        receiverData: receiver
      };
    })
  );

  return populatedRequests;
};

// Helper method to check if request exists between users
friendRequestSchema.statics.requestExists = async function(senderEmail, receiverEmail) {
  const request = await this.findOne({
    $or: [
      { senderEmail, receiverEmail, status: "pending" },
      { senderEmail: receiverEmail, receiverEmail: senderEmail, status: "pending" }
    ]
  });
  return !!request;
};

module.exports = mongoose.model("FriendRequest", friendRequestSchema);