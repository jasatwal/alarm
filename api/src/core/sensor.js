"use strict";

const EventEmitter = require('events');
const { randomDelay } = require('./utils');

const SENSOR_STATE_ON = 'on';
const SENSOR_STATE_OFF = 'off';

class Sensor extends EventEmitter {
  constructor(id, name) {
    super();
    this.id = id;
    this.name = name;
    this.state = SENSOR_STATE_OFF;
  }

  start() {
    this.emit('start');
    this.timer = setInterval(() => {
      this.state = SENSOR_STATE_ON;
      this.emit('on', { sensor: this });
      this.emit('stateChange', { sensor: this });
      setTimeout(() => {
        this.state = SENSOR_STATE_OFF;
        this.emit('off', { sensor: this });
        this.emit('stateChange', { sensor: this });
      }, randomDelay(1000, 3000));
    }, randomDelay(5000, 10000));
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.emit('stop', { sensor: this });
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      state: this.state
    };
  }
}

module.exports = Sensor;