const mongoose = require("mongoose");
const User = require("./src/models/User");
require('dotenv').config();

async function unbanTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Unban user huucanh1210@gmail.com after testing
    const userEmail = "huucanh1210@gmail.com";
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log("❌ User not found:", userEmail);
      return;
    }

    // Unban the user
    user.isBanned = false;
    user.bannedBy = null;
    user.bannedAt = null;
    user.banReason = null;
    
    await user.save();
    
    console.log("✅ User unbanned successfully!");
    console.log("📧 Email:", user.email);
    console.log("🎉 User can now access the app normally!");

  } catch (error) {
    console.error("❌ Error unbanning user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

unbanTestUser();