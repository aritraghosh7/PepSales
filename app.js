// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const notificationRoutes = require('./routes/notificationRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(express.json());

// Handle JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON', details: err.message });
  }
  next();
});

// Routes
app.use('/', notificationRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    details: process.env.NODE_ENV === 'production' ? undefined : err.message 
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app; // Export for testing