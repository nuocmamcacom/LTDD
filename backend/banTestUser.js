const mongoose = require("mongoose");
const User = require("./src/models/User");
require('dotenv').config();

async function banTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Ban user huucanh1210@gmail.com for testing
    const userEmail = "huucanh1210@gmail.com";
    const adminEmail = "admin@chess-online.com";
    const banReason = "Testing ban notification system - This is just a test ban";
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log("❌ User not found:", userEmail);
      return;
    }

    // Ban the user
    user.isBanned = true;
    user.bannedBy = adminEmail;
    user.bannedAt = new Date();
    user.banReason = banReason;
    
    await user.save();
    
    console.log("🚫 User banned successfully for testing!");
    console.log("📧 Email:", user.email);
    console.log("👮 Banned by:", user.bannedBy);
    console.log("📅 Banned at:", user.bannedAt);
    console.log("📝 Reason:", user.banReason);
    console.log("\n🔥 User will see ban notification on next app load!");

  } catch (error) {
    console.error("❌ Error banning user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

banTestUser();