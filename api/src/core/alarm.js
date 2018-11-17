"use strict";

const EventEmitter = require('events');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const { Sensor, SENSOR_STATE_ON } = require('./sensor');

class Alarm extends EventEmitter {
  constructor(sensors) {
    super();
    this.reset();
    this.sensors = sensors;
    for (let sensor of this.sensors) {
      sensor.on('stateChange', e => this.sensorStateChange(e));
    }
  }

  static async load() {
    const data = await readFile('alarm.json');
      // TODO: Look into validating the schema.
    const alarmJson = JSON.parse(data);
    return new Alarm(alarmJson.sensors.map(sensorJson => new Sensor(sensorJson.id, sensorJson.name, sensorJson.pin)));
  }

  async save() {
    const alarmJson = JSON.stringify(this, null, 2);
    return await writeFile('alarm.json', alarmJson);
  }

  sensorStateChange(e) {
    const { sensor } = e;
    if (sensor.state == SENSOR_STATE_ON && this.isActive && !this.isTriggered) {
      this.isTriggered = true;
      this.emit('trigger', { sensor });
    }
    this.emit('sensorStateChange', { sensor });
  }

  // sensorStateChange(e) {
  //   if (this.isActive) {
  //     const { state } = e.sensor;
  //     if (!this.isTriggered && state === 'on') {
  //       this.emit('trigger', { sensor: e.sensor });
  //     }
  //     this.emit('sensorStateChange', { sensor: e.sensor });
  //   }
  // }

  activate() {
    if (!this.isActive) {
      this.isActive = true;
      //this.sensors.forEach(sensor => sensor.start());
    }
    return this.save();
  }

  deactivate() {
    if (this.isActive) {
      this.reset();
      //this.sensors.forEach(sensor => sensor.stop());
    }
    return this.save();
  }

  reset() {
    this.isActive = this.isTriggered = false;
  }

  findSensor(id) {
    for (let sensor of this.sensors) {
      if (sensor.id === id) {
        return sensor;
      }
    }
  }

  toJSON() {
    return {
      sensors: this.sensors,
      isActive: this.isActive,
      isTriggered: this.isTriggered,      
    }
  }
}

module.exports = Alarm;