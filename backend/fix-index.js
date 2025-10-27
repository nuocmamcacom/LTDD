const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(async () => {
    console.log('🔌 Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    try {
      // Drop the problematic index
      await db.collection('friendrequests').dropIndex('senderEmail_1_receiverEmail_1');
      console.log('🗑️ Dropped unique index');
    } catch (err) {
      console.log('ℹ️ Index may not exist:', err.message);
    }
    
    // Recreate the index
    await db.collection('friendrequests').createIndex(
      { senderEmail: 1, receiverEmail: 1 }, 
      { unique: true, background: true }
    );
    console.log('✅ Recreated unique index');
    
    // Verify new indexes
    const indexes = await db.collection('friendrequests').indexes();
    console.log('📇 Current indexes:', indexes);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });