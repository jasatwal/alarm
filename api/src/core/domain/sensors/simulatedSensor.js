"use strict";

const EventEmitter = require('events');
const { SENSOR_STATE_ON, SENSOR_STATE_OFF } = require('./consts');

function randomDelay(min, max) {
  return Math.floor(Math.random() * (1 + max - min)) + min;
}

class SimulatedSensor extends EventEmitter {
  constructor({ id, name }) {
    super();
    this.id = id;
    this.name = name;
    this.state = SENSOR_STATE_OFF; 
  }

  start() {
    this.timer = setInterval(() => {
      this.state = SENSOR_STATE_ON;
      this.emit('stateChange', { sensor: this });
      setTimeout(() => {
        this.state = SENSOR_STATE_OFF;
        this.emit('stateChange', { sensor: this });
      }, randomDelay(1000, 3000));
    }, randomDelay(5000, 10000));   
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
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

module.exports = SimulatedSensor;