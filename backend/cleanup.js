const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(async () => {
    console.log('🔌 Connected to MongoDB');
    
    const FriendRequest = mongoose.model('FriendRequest', {
      senderEmail: String,
      receiverEmail: String,
      status: String,
      createdAt: Date
    });
    
    // Check current friend requests
    const allRequests = await FriendRequest.find({});
    console.log('📋 Current friend requests:', allRequests.length);
    allRequests.forEach(req => {
      console.log(`  - ${req.senderEmail} → ${req.receiverEmail} (${req.status})`);
    });
    
    // Clear ALL friend requests
    const result = await FriendRequest.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} friend requests`);
    
    console.log('✅ Database cleanup completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });