const express = require("express");
const User = require("../models/User");
const Friendship = require("../models/Friendship");
const FriendRequest = require("../models/FriendRequest");

const router = express.Router();

// 📌 Get user's friends list
router.get("/", async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log("📥 [GET /api/friends]", { userEmail });

    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    const friends = await Friendship.getUserFriends(userEmail);
    console.log("✅ [FRIENDS LIST]", { userEmail, friendsCount: friends.length });
    
    res.json(friends);
  } catch (err) {
    console.error("❌ [ERROR GET FRIENDS]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Search users by email or name
router.get("/search", async (req, res) => {
  try {
    const { query, userEmail, limit = 20 } = req.query;
    console.log("📥 [GET /api/friends/search]", { query, userEmail, limit });

    if (!query || !userEmail) {
      return res.status(400).json({ error: "query and userEmail are required" });
    }

    // Search users by email or name (case-insensitive)
    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $and: [
        { email: { $ne: userEmail } }, // Exclude self
        {
          $or: [
            { email: searchRegex },
            { name: searchRegex }
          ]
        }
      ]
    })
    .select('email name elo onlineStatus lastSeen profilePicture')
    .limit(parseInt(limit));

    // Check friendship status for each user
    const usersWithFriendshipStatus = await Promise.all(
      users.map(async (user) => {
        const areFriends = await Friendship.areFriends(userEmail, user.email);
        const requestExists = await FriendRequest.requestExists(userEmail, user.email);
        
        return {
          ...user.toObject(),
          relationshipStatus: areFriends ? 'friends' : (requestExists ? 'pending' : 'none')
        };
      })
    );

    console.log("✅ [SEARCH RESULTS]", { 
      searchQuery: query, 
      resultsCount: usersWithFriendshipStatus.length 
    });
    
    res.json(usersWithFriendshipStatus);
  } catch (err) {
    console.error("❌ [ERROR SEARCH USERS]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Send friend request
router.post("/request", async (req, res) => {
  try {
    const { senderEmail, receiverEmail, message } = req.body;
    console.log("📥 [POST /api/friends/request]", { senderEmail, receiverEmail });

    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ error: "senderEmail and receiverEmail are required" });
    }

    if (senderEmail === receiverEmail) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    // Check if receiver exists
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if they're already friends
    const areFriends = await Friendship.areFriends(senderEmail, receiverEmail);
    if (areFriends) {
      return res.status(400).json({ error: "Users are already friends" });
    }

    // Check if request already exists
    const requestExists = await FriendRequest.requestExists(senderEmail, receiverEmail);
    if (requestExists) {
      return res.status(400).json({ error: "Friend request already exists" });
    }

    // Check if receiver allows friend requests
    if (!receiver.allowFriendRequests) {
      return res.status(400).json({ error: "User doesn't accept friend requests" });
    }

    // Create friend request
    const friendRequest = new FriendRequest({
      senderEmail,
      receiverEmail,
      message: message || "",
      status: "pending"
    });

    await friendRequest.save();
    console.log("✅ [FRIEND REQUEST SENT]", { senderEmail, receiverEmail });
    
    res.json({ 
      message: "Friend request sent successfully",
      requestId: friendRequest._id
    });
  } catch (err) {
    console.error("❌ [ERROR SEND FRIEND REQUEST]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Get pending friend requests
router.get("/requests", async (req, res) => {
  try {
    const { userEmail, type = "received" } = req.query; // type: "received" or "sent"
    console.log("📥 [GET /api/friends/requests]", { userEmail, type });

    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    let requests;
    if (type === "sent") {
      requests = await FriendRequest.getSentRequests(userEmail);
    } else {
      requests = await FriendRequest.getPendingRequests(userEmail);
    }

    console.log("✅ [FRIEND REQUESTS]", { 
      userEmail, 
      type, 
      requestsCount: requests.length 
    });
    
    res.json(requests);
  } catch (err) {
    console.error("❌ [ERROR GET FRIEND REQUESTS]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Respond to friend request (accept/decline)
router.patch("/request/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, userEmail } = req.body; // action: "accept" or "decline"
    console.log("📥 [PATCH /api/friends/request/:requestId]", { requestId, action, userEmail });

    if (!action || !userEmail) {
      return res.status(400).json({ error: "action and userEmail are required" });
    }

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ error: "action must be 'accept' or 'decline'" });
    }

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Verify user is the receiver
    if (friendRequest.receiverEmail !== userEmail) {
      return res.status(403).json({ error: "Not authorized to respond to this request" });
    }

    // Check if request is still pending
    if (friendRequest.status !== "pending") {
      return res.status(400).json({ error: "Request is no longer pending" });
    }

    if (action === "accept") {
      // Create friendship
      const friendship = new Friendship({
        user1: friendRequest.senderEmail,
        user2: friendRequest.receiverEmail,
        status: "active"
      });
      await friendship.save();

      // Update friends count for both users
      await User.updateOne(
        { email: friendRequest.senderEmail },
        { $inc: { friendsCount: 1 } }
      );
      await User.updateOne(
        { email: friendRequest.receiverEmail },
        { $inc: { friendsCount: 1 } }
      );

      friendRequest.status = "accepted";
      console.log("✅ [FRIEND REQUEST ACCEPTED]", { 
        senderEmail: friendRequest.senderEmail,
        receiverEmail: friendRequest.receiverEmail
      });
    } else {
      friendRequest.status = "declined";
      console.log("✅ [FRIEND REQUEST DECLINED]", { 
        senderEmail: friendRequest.senderEmail,
        receiverEmail: friendRequest.receiverEmail
      });
    }

    friendRequest.respondedAt = new Date();
    await friendRequest.save();
    
    res.json({ 
      message: `Friend request ${action}ed successfully`,
      friendship: action === "accept" ? true : false
    });
  } catch (err) {
    console.error("❌ [ERROR RESPOND FRIEND REQUEST]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Cancel friend request (for sender)
router.delete("/request/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { userEmail } = req.body;
    console.log("📥 [DELETE /api/friends/request/:requestId]", { requestId, userEmail });

    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Verify user is the sender
    if (friendRequest.senderEmail !== userEmail) {
      return res.status(403).json({ error: "Not authorized to cancel this request" });
    }

    // Only allow cancelling pending requests
    if (friendRequest.status !== "pending") {
      return res.status(400).json({ error: "Can only cancel pending requests" });
    }

    // Update status to cancelled
    friendRequest.status = "cancelled";
    await friendRequest.save();

    console.log("✅ [FRIEND REQUEST CANCELLED]", { 
      requestId,
      senderEmail: friendRequest.senderEmail,
      receiverEmail: friendRequest.receiverEmail
    });
    
    res.json({ message: "Friend request cancelled successfully" });
  } catch (err) {
    console.error("❌ [ERROR CANCEL FRIEND REQUEST]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Remove friend
router.delete("/:friendEmail", async (req, res) => {
  try {
    const { friendEmail } = req.params;
    const { userEmail } = req.body;
    console.log("📥 [DELETE /api/friends/:friendEmail]", { userEmail, friendEmail });

    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    // First, let's check if friendship exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { user1: userEmail, user2: friendEmail },
        { user1: friendEmail, user2: userEmail }
      ],
      status: "active"
    });

    console.log("🔍 [FRIENDSHIP CHECK]", { 
      userEmail, 
      friendEmail, 
      friendshipExists: !!existingFriendship,
      friendshipData: existingFriendship 
    });

    if (!existingFriendship) {
      console.log("❌ [FRIENDSHIP NOT FOUND]", { userEmail, friendEmail });
      return res.status(404).json({ error: "Friendship not found" });
    }

    // Find and remove friendship
    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { user1: userEmail, user2: friendEmail },
        { user1: friendEmail, user2: userEmail }
      ],
      status: "active"
    });

    console.log("🗑️ [FRIENDSHIP DELETION]", { 
      deletedFriendship: !!friendship,
      friendshipId: friendship?._id 
    });

    // Update friends count for both users
    const user1Update = await User.updateOne(
      { email: userEmail },
      { $inc: { friendsCount: -1 } }
    );
    const user2Update = await User.updateOne(
      { email: friendEmail },
      { $inc: { friendsCount: -1 } }
    );

    console.log("👥 [USER COUNT UPDATES]", { 
      user1Updated: user1Update.modifiedCount,
      user2Updated: user2Update.modifiedCount
    });

    console.log("✅ [FRIEND REMOVED]", { userEmail, friendEmail });
    
    // Also clean up any existing friend requests between these users
    const cleanupRequests = await FriendRequest.deleteMany({
      $or: [
        { senderEmail: userEmail, receiverEmail: friendEmail },
        { senderEmail: friendEmail, receiverEmail: userEmail }
      ]
    });

    console.log("🧹 [FRIEND REQUESTS CLEANUP]", { 
      deletedCount: cleanupRequests.deletedCount 
    });
    
    res.json({ 
      message: "Friend removed successfully",
      removedFriend: friendEmail
    });
  } catch (err) {
    console.error("❌ [ERROR REMOVE FRIEND]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Update online status
router.patch("/status", async (req, res) => {
  try {
    const { userEmail, status } = req.body; // status: "online", "offline", "away", "busy"
    console.log("📥 [PATCH /api/friends/status]", { userEmail, status });

    if (!userEmail || !status) {
      return res.status(400).json({ error: "userEmail and status are required" });
    }

    if (!["online", "offline", "away", "busy"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateData = { 
      onlineStatus: status,
      lastSeen: new Date()
    };

    const user = await User.findOneAndUpdate(
      { email: userEmail },
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ [ONLINE STATUS UPDATED]", { userEmail, status });
    
    res.json({ 
      message: "Status updated successfully",
      onlineStatus: user.onlineStatus,
      lastSeen: user.lastSeen
    });
  } catch (err) {
    console.error("❌ [ERROR UPDATE STATUS]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// 📌 Get online friends
router.get("/online", async (req, res) => {
  try {
    const { userEmail } = req.query;
    console.log("📥 [GET /api/friends/online]", { userEmail });

    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    const friends = await Friendship.getUserFriends(userEmail);
    const onlineFriends = friends.filter(friend => 
      friend.onlineStatus === "online" || friend.onlineStatus === "away"
    );

    console.log("✅ [ONLINE FRIENDS]", { 
      userEmail, 
      totalFriends: friends.length,
      onlineCount: onlineFriends.length 
    });
    
    res.json(onlineFriends);
  } catch (err) {
    console.error("❌ [ERROR GET ONLINE FRIENDS]", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;