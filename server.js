const express = require('express');
const { connectToDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB before starting server
connectToDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

// Basic route to test DB connection
app.get('/test-db', async (req, res) => {
  try {
    const db = getDb();
    const collections = await db.listCollections().toArray();
    res.json({
      status: 'Database connected',
      collections: collections.map(c => c.name)
    });
  } catch (err) {
    res.status(500).json({ error: 'Database not available' });
  }
});