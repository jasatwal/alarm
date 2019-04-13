"use strict";

const EventEmitter = require('events');
const { SENSOR_STATE_ON } = require('./sensors');
const { DeactiveAlarmState } = require('./alarmStates');

class Alarm extends EventEmitter {
  constructor(sensors = [], state = new DeactiveAlarmState()) {
    super();
    this.sensors = sensors;
    this.setState(state);

    for (let sensor of this.sensors) {
      sensor.on('stateChange', e => this.sensorStateChange(e));
      sensor.start();
    }    
  }

  get active() {
    return this.state.active;
  }

  setState(state) {
    this.state = state;
    this.state.initialize(this);
  }

  sensorStateChange(e) {
    const { sensor } = e;
    if (sensor.state === SENSOR_STATE_ON) {
      this.state.trigger(sensor);
    }
    this.emit('sensorStateChange', { sensor });
  }

  activate() {
    this.state.activate();
  }

  deactivate() {
    this.state.deactivate();
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
      state: this.state.toJSON()
    }
  }
}

module.exports = Alarm;