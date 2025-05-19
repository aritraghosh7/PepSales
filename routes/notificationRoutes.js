// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

// Core notification endpoints
router.post('/notifications', controller.sendNotification);
router.get('/users/:id/notifications', controller.getUserNotifications);

// New endpoint for retrying failed notifications
router.post('/notifications/:id/retry', controller.retryNotification);

module.exports = router;