"use strict";

const EventEmitter = require('events');
// https://www.npmjs.com/package/pigpio#installation
const Gpio = require('pigpio').Gpio;

const SENSOR_STATE_ON = 'on';
const SENSOR_STATE_OFF = 'off';

class Sensor extends EventEmitter {
  constructor(id, name, pin) {
    super();
    this.id = id;
    this.name = name;
    this.state = SENSOR_STATE_OFF;

    if (typeof pin === 'number') {
      this.gpio = new Gpio(pin, {
        mode: Gpio.INPUT,
        pullUpDown: Gpio.PUD_DOWN,
        edge: Gpio.EITHER_EDGE
      });

      this.state = this.gpio.digitalRead() ? SENSOR_STATE_ON : SENSOR_STATE_OFF;

      this.gpio.on('interrupt', level => {
        const previousState = this.state;
        this.state = level ? SENSOR_STATE_ON : SENSOR_STATE_OFF;
        
        if (previousState !== this.state) {
          this.emit('stateChange', { sensor: this });
        }
      });
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

module.exports = {
  Sensor, 
  SENSOR_STATE_ON,
  SENSOR_STATE_OFF
};