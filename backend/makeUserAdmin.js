const mongoose = require("mongoose");
const User = require("./src/models/User");
require('dotenv').config();

async function makeUserAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Thay email này bằng email của user bạn muốn làm admin
    const userEmail = "huucanh1210@gmail.com";
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log("❌ User not found:", userEmail);
      return;
    }

    user.role = 'admin';
    await user.save();
    
    console.log("✅ User updated to admin successfully!");
    console.log("📧 Email:", user.email);
    console.log("👤 Name:", user.name);
    console.log("🔧 Role:", user.role);
    console.log("\n🎉 You can now access Admin Panel with this account!");

  } catch (error) {
    console.error("❌ Error updating user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

makeUserAdmin();