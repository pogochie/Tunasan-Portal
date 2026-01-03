const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:your-email@example.com', // replace with your email
  process.env.VAPID_PUBLIC_KEY,    // set these in your environment variables
  process.env.VAPID_PRIVATE_KEY
);

const subscriptions = []; // In-memory store; replace with DB in production

function addSubscription(subscription) {
  subscriptions.push(subscription);
}

function sendNotification(payload) {
  subscriptions.forEach(sub => {
    webpush.sendNotification(sub, JSON.stringify(payload)).catch(err => {
      console.error('Push error:', err);
    });
  });
}

module.exports = {
  addSubscription,
  sendNotification
};
