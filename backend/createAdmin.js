const mongoose = require("mongoose");
const User = require("./src/models/User");
require('dotenv').config();

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const adminEmail = "admin@chess-online.com";
    const adminName = "Chess Admin";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("⚠️ Admin user already exists:", adminEmail);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log("✅ Updated existing user to admin role");
      }
      return;
    }

    // Create new admin user
    const adminUser = new User({
      email: adminEmail,
      name: adminName,
      role: 'admin',
      elo: 1500, // Higher starting ELO for admin
      onlineStatus: 'offline'
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminEmail);
    console.log("👤 Name:", adminName);
    console.log("🔧 Role: admin");
    console.log("\n🔥 You can now login with this admin account to access Admin Panel");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the script
createAdminUser();