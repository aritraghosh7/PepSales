// services/smsService.js
const twilio = require('twilio');

// Initialize Twilio client with environment variables
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (phone, content) => {
  try {
    const message = await client.messages.create({
      body: content,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log(`SMS sent with SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error; // Re-throw the error for proper handling in the controller
  }
};