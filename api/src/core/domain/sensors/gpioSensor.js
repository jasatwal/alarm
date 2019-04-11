"use strict";

const EventEmitter = require('events');
const Gpio = require('pigpio').Gpio;
const { SENSOR_STATE_ON, SENSOR_STATE_OFF } = require('./consts');

class GpioSensor extends EventEmitter {
  constructor({ id, name, pin }) {
    super();
    this.id = id;
    this.name = name;
    this.pin = pin;
    this.state = SENSOR_STATE_OFF;
  }

  start() {
    if (typeof this.pin === 'number') {
      this.gpio = new Gpio(this.pin, {
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

      console.info(`Connected to pin ${this.pin} (state=${this.state})`);
    }
  }

  stop() {
    // TODO: Reset the pin.
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      pin: this.pin
    };
  }
}

module.exports = GpioSensor;