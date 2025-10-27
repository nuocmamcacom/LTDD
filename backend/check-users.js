const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(async () => {
    console.log('🔌 Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check user documents for allowFriendRequests field
    const users = await db.collection('users').find({
      email: { $in: ['leesteve212@gmail.com', 'tranhuucanh1210@gmail.com'] }
    }).toArray();
    
    console.log('👥 Users found:', users.length);
    users.forEach(user => {
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎮 allowFriendRequests: ${user.allowFriendRequests}`);
      console.log(`📊 Fields:`, Object.keys(user));
      console.log('---');
    });
    
    // Check current friend requests
    const requests = await db.collection('friendrequests').find({}).toArray();
    console.log('📮 Friend requests:', requests.length);
    requests.forEach(req => {
      console.log(`  - ${req.senderEmail} → ${req.receiverEmail} (${req.status})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });