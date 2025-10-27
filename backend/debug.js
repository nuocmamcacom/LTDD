const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test')
  .then(async () => {
    console.log('🔌 Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📂 Collections:', collections.map(c => c.name));
    
    // Check friendrequests collection specifically
    if (collections.find(c => c.name === 'friendrequests')) {
      console.log('\n🔍 friendrequests collection details:');
      
      // Check indexes
      const indexes = await db.collection('friendrequests').indexes();
      console.log('📇 Indexes:', indexes);
      
      // Check documents
      const docs = await db.collection('friendrequests').find({}).toArray();
      console.log('📄 Documents:', docs.length);
      docs.forEach(doc => console.log(`  - ${JSON.stringify(doc)}`));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });