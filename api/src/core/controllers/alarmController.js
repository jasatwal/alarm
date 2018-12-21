"use strict";

const express = require('express');

function factory(alarmRepository) {
  const router = express.Router();

  router.get('/', async (_, res) => {
    const alarm = await alarmRepository.get();
    res.send(getAlarmRepresentation(alarm));
  });
  
  router.put('/', async (req, res) => {
    const { state } = req.body;
    const alarm = await alarmRepository.get();
    if (state === 'active') {
      alarm.activate();
    } else if (state === 'deactive') {
      alarm.deactivate();
    }
    await alarmRepository.save(alarm);
  
    res
      .contentType('application/vnd.collection+json')
      .send(getAlarmRepresentation(alarm));
  });

  return router;  
}

function getAlarmRepresentation(alarm) {
  const operations = [];

  if (alarm.active) {
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

module.exports = factory;