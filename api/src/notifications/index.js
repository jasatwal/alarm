const controller = require('./controllers/subscriptionController');
const send = require('./domain/sendNotification');

module.exports = { controller, send };