"use strict";

const webpush = require('web-push');
const subscriptionRepository = require('./subscriptionRepository')();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT, 
  process.env.VAPID_PUBLICKEY,
  process.env.VAPID_PRIVATEKEY
);

async function sendNotification(data) {
  const subscriptions = await subscriptionRepository.getAll();
  for (let subscription of subscriptions) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(data));
    } catch (error) {
      if (error.statusCode === 410) {
        console.info('Deleting subscription...');
        await subscriptionRepository.remove(subscription);
      } else {
        console.Error('Subscription is no longer valid: ', error, subscription);
      }
    }
  }
};

module.exports = sendNotification;