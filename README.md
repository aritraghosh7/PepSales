# PepSales# PepSales
Notification Service
A robust notification system to send email, SMS, and in-app notifications to users.
Features

Send notifications via Email, SMS, and In-App
Retrieve user notifications
Retry mechanism for failed notifications
Data persistence with MongoDB
Proper error handling and validation

Setup Instructions

Clone the repository
Install dependencies:
npm install

Create a .env file in the root directory with the following variables:
PORT=3000
MONGO_URI=mongodb://localhost:27017/notification-service

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# For RabbitMQ (optional)
RABBITMQ_URL=amqp://localhost

Start the server:
npm start


API Endpoints
1. Send a Notification

URL: /notifications
Method: POST
Body:
json{
  "userId": "user123",
  "type": "email", // "email", "sms", or "inapp"
  "content": "Your notification message here",
  "meta": {
    "email": "user@example.com", // Required for email
    "phone": "+1234567890" // Required for SMS
  }
}

Response:
json{
  "message": "Notification sent successfully",
  "notificationId": "6123456789abcdef12345678"
}


2. Get User Notifications

URL: /users/:id/notifications
Method: GET
Response:
json{
  "userId": "user123",
  "count": 2,
  "notifications": [
    {
      "_id": "6123456789abcdef12345678",
      "userId": "user123",
      "type": "email",
      "content": "Notification message",
      "status": "delivered",
      "timestamp": "2023-09-01T12:00:00.000Z"
    },
    // More notifications...
  ]
}


3. Retry a Failed Notification

URL: /notifications/:id/retry
Method: POST
Response:
json{
  "message": "Notification retry successful",
  "notification": {
    "_id": "6123456789abcdef12345678",
    "userId": "user123",
    "type": "email",
    "content": "Notification message",
    "status": "delivered",
    "timestamp": "2023-09-01T12:00:00.000Z"
  }
}


Notification Flow

Request comes in to send a notification
Validation of required fields
Notification is saved with 'pending' status
Notification is sent through the appropriate service
If successful, status is updated to 'delivered'
If failed, status is updated to 'failed' with error details

Error Handling
The API returns appropriate error messages and HTTP status codes:

400: Bad Request - Missing fields, invalid notification type
404: Not Found - Notification not found for retry
500: Server Error - Failed to send notification or database error

Queue Implementation (Optional Bonus)
This repository includes a branch with-queue that implements RabbitMQ for notification processing:
git checkout with-queue
The queue implementation:

Sends notifications to a queue instead of processing them directly
Has a separate worker process that consumes from the queue
Implements automatic retries for failed notifications

Testing
To test the API with Postman:

Send a notification:

POST to http://localhost:3000/notifications
Body:
json{
  "userId": "user123",
  "type": "email",
  "content": "Test notification",
  "meta": {
    "email": "test@example.com"
  }
}



Get user notifications:

GET to http://localhost:3000/users/user123/notifications



Troubleshooting
If you encounter the error "Notification failed to send":

Check your .env file to ensure all credentials are correct
Verify MongoDB connection
Ensure proper format of email addresses and phone numbers
Check the server logs for detailed error messages
