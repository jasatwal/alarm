"use strict";

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser')
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const { alarmController, sensorController, alarmRepository } = require('./src/core');
const { subscriptionController, sendNotification } = require('./src/notifications');

function setupServer() {
  app.use(cors());
  app.use(bodyParser.json());
  app.use('/api', alarmController);
  app.use('/api/sensors', sensorController);
  app.use('/api/subscriptions', subscriptionController);
  app.options('*', cors());

  const port = process.env.PORT || 3001;
  server.listen(port, () => console.info(`Listening on port ${port}`));
}

async function setupSocketIO() {
  io.on('connection', (socket) => {
    console.info('A user connected', socket.conn.id);
    socket.on('disconnect', () => {
      console.info('A user disconnected', socket.conn.id);
    });
  });

  const alarm = await alarmRepository.get();
  for (let sensor of alarm.sensors) {
    sensor.on('stateChange', e => {
      console.info('sensor state changed', e.sensor.name, e.sensor.state);
      io.sockets.emit('sensorStateChange', e.sensor);
    });
  }  
}

async function setupNotifications() {
  const alarm = await alarmRepository.get();
  alarm.on('trigger', async e => {
    console.info('Triggered!');
    await alarmRepository.save(alarm);
    await sendNotification({ title: 'Alarm Triggered!', when: Date.now(), sensor: e.sensor });
  });
}

// TODO: Look into winston/bunyan to provide logging to couchdb instead. 
(async () => {
  try {
    setupServer();
    await setupSocketIO();
    await setupNotifications();
  } catch (e) {
    console.error(e);
  }
})();