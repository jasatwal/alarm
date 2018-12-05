"use strict";

// https://www.slideshare.net/nordicapis/the-rest-and-then-some
require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser')

const { Alarm } = require('./src/core');
const notifications = require('./src/notifications');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

function getAlarmRepresentation(alarm) {
  const operations = [];

  if (alarm.isActive) {
    operations.push({
      rel: 'deactivate',
      method: 'PUT',
      href: '/api',
      data: {
        state: 'deactive'
      }
    });
  } else {
    operations.push({
      rel: 'activate',
      method: 'PUT',
      href: '/api',
      data: {
        state: 'active'
      }
    });
  }

  return { 
    collection: {
      version: '1.0',
      href: '/api',
      links: [{
        rel: 'sensors',
        href: '/sensors',
      }],
      items: [{
        href: '/api',
        data: [
          { name: 'state', value: alarm.isActive ? 'active' : 'deactive' }
        ]
      }],
      operations
    }
  };
}

function startServer(alarm) {
  app.use(cors());
  app.use(bodyParser.json());

  app.options('*', cors());

  app.use('/api/subscriptions', notifications.controller);

  app.get('/api', async (_, res) => {
    res.send(getAlarmRepresentation(alarm));
  });

  app.put('/api', async (req, res) => {
    const { state } = req.body;
    if (state === 'active') {
      await alarm.activate();
    } else if (state === 'deactive') {
      await alarm.deactivate();
    }

    res
      .contentType('application/vnd.collection+json')
      .send(getAlarmRepresentation(alarm));
  });

  app.get('/api/sensors', (req, res) => {
    const representation = {
      collection: {
        version: '1.0',
        href: '/api/sensors',
        links: [{
          rel: 'logs',
          href: '/api/sensors/logs'
        }],
        items: alarm.sensors.map(sensor => {
          return {
            href: `/api/sensors/${sensor.id}`,
            data: [
              { name: 'id', value: sensor.id },
              { name: 'name', value: sensor.name }
            ]
          };
        })
      }
    };

    res
      .contentType('application/vnd.collection+json')
      .send(representation);
  });

  app.get('/api/sensors/:id', (req, res) => {
    const sensor = alarm.findSensor(parseInt(req.params.id));
    if (sensor) {
      const representation = {
        collection: {
          version: '1.0',
          href: `/api/sensors/${sensor.id}`,
          links: [{
            rel: 'logs',
            href: `/api/sensors/logs/?sensor=${sensor.id}`
          }],
          items: [{
            data: [
              { name: 'id', value: sensor.id },
              { name: 'name', value: sensor.name }
            ]
          }]
        }
      };
      res
        .contentType('application/vnd.collection+json')
        .send(representation);
    } else {
      res.status(404).send();
    }
  });

  app.get('/api/sensors/logs?:sensor', (req, res) => {
    const logs = SensorLog.findBySensor(parseInt(req.params.sensor));
    res.send(logs);
  });

  server.listen(3001, () => console.log('Example app listening on port 3001!'));

  io.on('connection', (socket) => {
    console.log('a user connected', socket.conn.id);
    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.conn.id);
    });
  });

  for (let sensor of alarm.sensors) {
    sensor.on('stateChange', e => {
      console.log('sensor state changed', e.sensor.id, e.sensor.state);
      io.sockets.emit('sensorStateChange', e.sensor);
    });
  }  
}

function setupNotifications(alarm) {
  alarm.on('trigger', async e => {
    console.log('Triggered!');
    await notifications.send({ text: 'Alarm Triggered!', when: Date.now(), sensor: e.sensor.Id });
  });
}

function startLogger(alarm) {
  for (let sensor of alarm.sensors) {
    sensor.on('on', e => {
      SensorLogger.on(e.sensor);
    });
  }
}

Alarm.load()
  .then(async alarm => {

    // TODO: Looking into winston/bunyan to provide logging to couchdb instead. 

    //startLogger(alarm);
    startServer(alarm);
    setupNotifications(alarm);
  });

//https://developers.google.com/web/tools/chrome-devtools/remote-debugging/