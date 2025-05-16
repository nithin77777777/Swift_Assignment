const { MongoClient } = require('mongodb');
require('dotenv').config();

// Proper MongoDB Atlas connection string (store in .env file)
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.qh4tiva.mongodb.net/node_assignment?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
});

let db;

const connectToDb = async () => {
  try {
    await client.connect();
    db = client.db('node_assignment');
    console.log("✅ Successfully connected to MongoDB Atlas");
    
    // Verify connection by pinging the database
    await db.command({ ping: 1 });
    console.log("🗄️ Database connection is active");
    
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB Atlas");
    console.error("Error details:", err.message);
    
    // More detailed error logging
    if (err.name === 'MongoServerSelectionError') {
      console.error("Possible causes:");
      console.error("- Internet connection issues");
      console.error("- Incorrect credentials in .env file");
      console.error("- IP not whitelisted in Atlas");
      console.error("- Cluster paused in Atlas console");
    }
    
    process.exit(1); // Exit with failure code
  }
};

const getDb = () => {
  if (!db) throw new Error('Database not initialized. Call connectToDb() first.');
  return db;
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = { connectToDb, getDb };