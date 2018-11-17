"use strict";

// https://www.slideshare.net/nordicapis/the-rest-and-then-some

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser')
const webpush = require('web-push');

const { Alarm, SensorLog } = require('./src/core');
const { SubscriptionRepository } = require('./src/subscriptions');

// https://www.npmjs.com/package/dotenv
const appsettings = require('./appsettings.json');
//const subscriptions = require('./subscriptions.json').subscriptions;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

webpush.setVapidDetails(
  appsettings.vapidDetails.subject, 
  appsettings.vapidDetails.publicKey,
  appsettings.vapidDetails.privateKey
);

async function sendMessage(subscription, dataToSend) {
  try {
    await webpush.sendNotification(subscription, dataToSend);
  } catch (error) {
    console.log('Error', error);
    if (error.statusCode === 410) {
      console.log('Deleting subscription...');
      await new SubscriptionRepository().remove(subscription);
    } else {
      console.log('Subscription is no longer valid: ', error);
    }
  }
};

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

  app.get('/api', async (req, res) => {
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

  app.post('/api/subscriptions', async (req, res) => {
    const subscription = req.body;
    const repository = new SubscriptionRepository();
    await repository.add(subscription);
    res.status(201).send();
  });

  app.delete('/api/subscriptions/:id', (req, res) => {
    
  });

  app.post('/api/send', (req, res) => {
    subscriptions.forEach(subscription => {
      sendMessage(subscription, 'Hello World!');
    });
    res.send();
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
    const subscriptions = await new SubscriptionRepository().getAll();
    for (let subscription of subscriptions) {
      await sendMessage(subscription, JSON.stringify({ text: 'Alarm Triggered!', when: Date.now(), sensor: e.sensor.Id }));
    }
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