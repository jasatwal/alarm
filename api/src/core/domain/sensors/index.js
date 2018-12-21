"use strict";

const { SENSOR_STATE_ON, SENSOR_STATE_OFF } = require('./consts');

function createSensor(strategy, options) {
  switch (strategy) {
    case 'gpio': 
      const GpioSensor = require('./gpioSensor');
      return new GpioSensor(options);
    case 'simulate': 
      const SimulatedSensor = require('./simulatedSensor');
      return new SimulatedSensor(options);
    default: 
      throw new Error(`'${strategy}' not supported.`);
  }
}

module.exports = {
  createSensor, 
  SENSOR_STATE_ON,
  SENSOR_STATE_OFF
};