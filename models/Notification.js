// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // Add index for better query performance
  },
  type: { 
    type: String, 
    enum: ['email', 'sms', 'inapp'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  meta: {
    email: String,
    phone: String,
    // You can add more metadata fields as needed
  },
  status: { 
    type: String, 
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending',
    index: true // Add index for filtering by status
  },
  errorMessage: String,
  retryCount: {
    type: Number,
    default: 0
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true // Add index for sorting and date filtering
  }
});

module.exports = mongoose.model('Notification', notificationSchema);