"use strict";

const express = require('express');

function factory(alarmRepository) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const alarm = await alarmRepository.get();
    const representation = {
      collection: {
        version: '1.0',
        href: '/api/sensors',
        links: [{
          rel: 'logs',
          href: '/api/sensors/logs'
        }],
        items: alarm.sensors.filter(sensor => sensor.enabled).map(sensor => {
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

  router.get('/:id', async (req, res) => {
    const alarm = await alarmRepository.get();
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

  // app.get('/api/sensors/logs?:sensor', (req, res) => {
  //   const logs = SensorLog.findBySensor(parseInt(req.params.sensor));
  //   res.send(logs);
  // });  

  return router;
}

module.exports = factory;