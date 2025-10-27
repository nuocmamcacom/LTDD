const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Middleware to check admin role
const requireAdmin = async (req, res, next) => {
  try {
    const { adminEmail } = req.query;
    const admin = await User.findOne({ email: adminEmail });
    
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Get all users (Admin only)
router.get("/users", requireAdmin, async (req, res) => {
  try {
    console.log("📥 [GET /api/admin/users]", { adminEmail: req.admin.email });
    
    const users = await User.find({})
      .select('email name role elo matchesPlayed wins onlineStatus lastSeen isBanned bannedBy bannedAt banReason friendsCount')
      .sort({ createdAt: -1 });
    
    console.log("✅ [ADMIN USER LIST]", { totalUsers: users.length });
    res.json(users);
  } catch (error) {
    console.error("❌ [ERROR GET USERS]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get single user by ID (Admin only)
router.get("/users/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📥 [GET /api/admin/users/:userId]", { userId, adminEmail: req.admin.email });
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("❌ [ERROR GET USER]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Create new user (Admin only)
router.post("/users", requireAdmin, async (req, res) => {
  try {
    const { email, name, role = "user" } = req.body;
    console.log("📥 [POST /api/admin/users]", { email, name, role, adminEmail: req.admin.email });
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    const newUser = new User({
      email,
      name: name || email.split('@')[0],
      role
    });
    
    await newUser.save();
    console.log("✅ [USER CREATED]", { userId: newUser._id, email: newUser.email });
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error("❌ [ERROR CREATE USER]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update user (Admin only)
router.patch("/users/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    console.log("📥 [PATCH /api/admin/users/:userId]", { userId, updates, adminEmail: req.admin.email });
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("✅ [USER UPDATED]", { userId: user._id, email: user.email });
    res.json(user);
  } catch (error) {
    console.error("❌ [ERROR UPDATE USER]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Ban/Unban user (Admin only)
router.patch("/users/:userId/ban", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'ban' | 'unban'
    console.log("📥 [PATCH /api/admin/users/:userId/ban]", { userId, action, reason, adminEmail: req.admin.email });
    
    const updateData = action === 'ban' 
      ? {
          isBanned: true,
          bannedBy: req.admin.email,
          bannedAt: new Date(),
          banReason: reason || 'No reason provided'
        }
      : {
          isBanned: false,
          bannedBy: null,
          bannedAt: null,
          banReason: null
        };
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log(`✅ [USER ${action.toUpperCase()}ED]`, { userId: user._id, email: user.email });
    res.json({ message: `User ${action}ned successfully`, user });
  } catch (error) {
    console.error("❌ [ERROR BAN/UNBAN USER]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete user (Admin only)
router.delete("/users/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📥 [DELETE /api/admin/users/:userId]", { userId, adminEmail: req.admin.email });
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.log("✅ [USER DELETED]", { userId: user._id, email: user.email });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ [ERROR DELETE USER]", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get admin stats (Admin only)
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    console.log("📥 [GET /api/admin/stats]", { adminEmail: req.admin.email });
    
    const [totalUsers, bannedUsers, adminUsers, onlineUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ onlineStatus: 'online' })
    ]);
    
    const stats = {
      totalUsers,
      bannedUsers,
      adminUsers,
      onlineUsers,
      activeUsers: totalUsers - bannedUsers
    };
    
    console.log("✅ [ADMIN STATS]", stats);
    res.json(stats);
  } catch (error) {
    console.error("❌ [ERROR GET STATS]", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;