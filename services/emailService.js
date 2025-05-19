// services/emailService.js
const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if required environment variables are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not found in environment variables');
    throw new Error('Email service configuration error: Missing EMAIL_USER or EMAIL_PASS environment variables');
  }

  console.log('Setting up email transporter with user:', process.env.EMAIL_USER);
  
  // Create the transporter with proper configuration
  return nodemailer.createTransport({
    service: 'gmail', // or use specific SMTP settings
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Debug options if needed
    debug: process.env.NODE_ENV !== 'production', // Enable debug output in non-production
  });
};

// Lazy initialize the transporter when needed
let transporter = null;

exports.sendEmail = async (email, content) => {
  try {
    // Initialize transporter if not already done
    if (!transporter) {
      transporter = createTransporter();
    }
    
    // Log attempt
    console.log(`Attempting to send email to: ${email}`);
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Notification',
      text: content,
    };
    
    // Send mail and get info
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error.message);
    throw new Error(`Email service error: ${error.message}`);
  }
};