const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(async () => {
    console.log('🔌 Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Update all users to have allowFriendRequests: true if they don't have it
    const result = await db.collection('users').updateMany(
      { allowFriendRequests: { $exists: false } },
      { $set: { allowFriendRequests: true } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users with allowFriendRequests: true`);
    
    // Verify update
    const users = await db.collection('users').find({
      email: { $in: ['leesteve212@gmail.com', 'tranhuucanh1210@gmail.com'] }
    }).toArray();
    
    console.log('👥 Verification:');
    users.forEach(user => {
      console.log(`📧 ${user.email}: allowFriendRequests = ${user.allowFriendRequests}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });