"use strict";

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const Alarm = require('./alarm');
const { createSensor } = require('./sensors');
const { alarmStatefactory } = require('./alarmStates');

class AlarmRepository {
  constructor(fileName) {
    this.fileName = fileName;
  }

  async get() {
    const data = await readFile(this.fileName);
    const alarmJson = JSON.parse(data);
    return this.createFromJson(alarmJson);
  }

  createFromJson({ sensors = [], state = { $type: 'DeactiveAlarmState' }, settings = {}}) {
    // TODO: Sensor object comparison issues when loading an alarm in TriggeredAlarmState.
    return new Alarm(
      sensors.map(sensorOptions => createSensor(process.env.SENSOR_STRATEGY, sensorOptions)),
      alarmStatefactory(state.$type, state),
      settings);
  }  

  async save(alarm) {
    const alarmJson = JSON.stringify(alarm, null, 2);
    return await writeFile(this.fileName, alarmJson);
  }
}

module.exports = (fileName = 'alarm.json') => new AlarmRepository(fileName);