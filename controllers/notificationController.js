// controllers/notificationController.js

const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
const inAppService = require('../services/inAppService');

exports.sendNotification = async (req, res) => {
  console.log("Incoming request body:", req.body);

  try {
    // Validate request body
    const { userId, type, content, meta } = req.body;
    
    if (!userId || !type || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['userId', 'type', 'content'] 
      });
    }
    
    // Validate notification type
    if (!['email', 'sms', 'inapp'].includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    // Validate type-specific requirements
    if (type === 'email' && (!meta || !meta.email)) {
      return res.status(400).json({ error: 'Email address is required for email notifications' });
    }
    
    if (type === 'sms' && (!meta || !meta.phone)) {
      return res.status(400).json({ error: 'Phone number is required for SMS notifications' });
    }

    // Save notification to database first with pending status
    const notification = await Notification.create({ 
      userId, 
      type, 
      content, 
      status: 'pending',
      meta // Store the meta information
    });

    // Send the notification based on type
    let result;
    if (type === 'email') {
      result = await emailService.sendEmail(meta.email, content);
    } else if (type === 'sms') {
      result = await smsService.sendSMS(meta.phone, content);
    } else if (type === 'inapp') {
      result = await inAppService.saveInApp(userId, content);
    }

    // Update notification status to delivered
    await Notification.findByIdAndUpdate(notification._id, { status: 'delivered' });

    res.status(200).json({ 
      message: 'Notification sent successfully',
      notificationId: notification._id 
    });

  } catch (error) {
    console.error("Notification failed:", error.message, error.stack);
    
    // If we have a notification ID from earlier in the process, update its status
    if (req.body && req.body.notificationId) {
      try {
        await Notification.findByIdAndUpdate(req.body.notificationId, { 
          status: 'failed',
          errorMessage: error.message
        });
      } catch (dbError) {
        console.error("Failed to update notification status:", dbError);
      }
    }

    res.status(500).json({ 
      error: 'Notification failed to send',
      details: error.message 
    });
  }
};

exports.getUserNotifications = async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const notifications = await Notification.find({ userId: id })
      .sort({ timestamp: -1 }); // Most recent first
      
    res.status(200).json({
      userId: id,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: error.message 
    });
  }
};

// Add a new endpoint to retry failed notifications
exports.retryNotification = async (req, res) => {
  const { id } = req.params;
  
  try {
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.status !== 'failed') {
      return res.status(400).json({ 
        error: 'Only failed notifications can be retried',
        status: notification.status
      });
    }
    
    // Update status to pending
    notification.status = 'pending';
    await notification.save();
    
    // Re-send notification based on type
    if (notification.type === 'email') {
      await emailService.sendEmail(notification.meta.email, notification.content);
    } else if (notification.type === 'sms') {
      await smsService.sendSMS(notification.meta.phone, notification.content);
    } else if (notification.type === 'inapp') {
      await inAppService.saveInApp(notification.userId, notification.content);
    }
    
    // Update status to delivered
    notification.status = 'delivered';
    await notification.save();
    
    res.status(200).json({ 
      message: 'Notification retry successful',
      notification
    });
  } catch (error) {
    console.error("Notification retry failed:", error);
    
    // Update status back to failed
    if (id) {
      try {
        await Notification.findByIdAndUpdate(id, { 
          status: 'failed',
          errorMessage: error.message
        });
      } catch (dbError) {
        console.error("Failed to update notification status:", dbError);
      }
    }
    
    res.status(500).json({ 
      error: 'Notification retry failed',
      details: error.message 
    });
  }
};