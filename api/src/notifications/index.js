"use strict";

const subscriptionControllerFactory = require('./controllers/subscriptionController');
const subscriptionRepositoryFactory = require('./domain/subscriptionRepository');
const sendNotification = require('./domain/sendNotification');

module.exports = { 
  subscriptionController: subscriptionControllerFactory(subscriptionRepositoryFactory()), 
  sendNotification
};