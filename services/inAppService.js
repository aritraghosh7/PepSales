const Notification = require('../models/Notification');

exports.saveInApp = async (userId, content) => {
  await Notification.create({ userId, type: 'inapp', content, status: 'delivered' });
};
