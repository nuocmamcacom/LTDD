const admin = require('firebase-admin');
const mongoose = require("mongoose");
const User = require("./src/models/User");
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-admin-key.json'); // Bạn cần download file này từ Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createFirebaseAdminUser() {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const adminEmail = "admin@chess-online.com";
    const adminPassword = "AdminChess123!";
    const adminName = "Chess Admin";

    // Create Firebase user
    try {
      const userRecord = await admin.auth().createUser({
        email: adminEmail,
        password: adminPassword,
        displayName: adminName,
        emailVerified: true
      });
      
      console.log("✅ Firebase admin user created successfully!");
      console.log("👤 UID:", userRecord.uid);
      console.log("📧 Email:", userRecord.email);
    } catch (firebaseError) {
      if (firebaseError.code === 'auth/email-already-exists') {
        console.log("⚠️ Firebase user already exists, skipping...");
      } else {
        throw firebaseError;
      }
    }

    // Update MongoDB user
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log("✅ Updated MongoDB user to admin role");
      } else {
        console.log("⚠️ MongoDB admin user already exists with admin role");
      }
    } else {
      // Create new MongoDB user
      const adminUser = new User({
        email: adminEmail,
        name: adminName,
        role: 'admin',
        elo: 1500,
        onlineStatus: 'offline'
      });
      await adminUser.save();
      console.log("✅ Created MongoDB admin user");
    }

    console.log("\n🎉 ADMIN ACCOUNT READY!");
    console.log("📧 Email: admin@chess-online.com");
    console.log("🔑 Password: AdminChess123!");
    console.log("🔧 Role: admin");
    console.log("\n🚀 You can now login and access Admin Panel!");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

createFirebaseAdminUser();