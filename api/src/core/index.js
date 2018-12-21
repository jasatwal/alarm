"use strict";

const alarmControllerFactory = require('./controllers/alarmController');
const sensorControllerFactory = require('./controllers/sensorController');
const alarmRepositoryFactory = require('./domain/alarmRepository')
const CachedAlarmRepository = require('./domain/cachedAlarmRepository');
const alarmRepository = new CachedAlarmRepository(alarmRepositoryFactory());

module.exports = {
  alarmRepository,
  alarmController: alarmControllerFactory(alarmRepository),
  sensorController: sensorControllerFactory(alarmRepository)
};