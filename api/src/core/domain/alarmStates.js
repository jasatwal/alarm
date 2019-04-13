"use strict";

class ActiveAlarmState {
  constructor() {
    this.active = true;
  }

  initialize(context) {
    this.context = context;
  }

  activate() {
  }

  deactivate() {
    this.context.setState(new DeactiveAlarmState());
  }   

  trigger(sensor) {
    this.context.setState(new TriggeredAlarmState(sensor));
  }

  toJSON() {
    return {
      $type: 'ActiveAlarmState'
    }
  }
}

class DeactiveAlarmState {
  initialize(context) {
    this.context = context;
  }
  
  activate() {
    this.context.setState(new ActiveAlarmState());
  }

  deactivate() {
  }

  trigger(sensor) {
  }

  toJSON() {
    return {
      $type: 'DeactiveAlarmState'
    }
  }  
}

class TriggeredAlarmState extends ActiveAlarmState {
  constructor(sensor) {
    super();
    if (!sensor) {
      throw new Error('sensor not specified.');
    }
    this.first = sensor;
  }

  initialize(context) {
    super.initialize(context);
    this.context = context;
    this.emitEvent(this.first);
  }

  deactivate() {
    this.context.setState(new DeactiveAlarmState());
  }

  trigger(sensor) {
    // Another sensor or the same sensor has triggered again.
    if (this.context.settings.triggerMultipleTimes) {
      this.emitEvent(sensor);
    }
  }

  emitEvent(sensor) {
    setImmediate(() => {
      this.context.emit('trigger', { sensor });
    });
  }

  toJSON() {
    return {
      $type: 'TriggeredAlarmState',
      sensor: this.first
    }
  }
}

module.exports = {
  ActiveAlarmState,
  DeactiveAlarmState,
  TriggeredAlarmState,
  alarmStatefactory: (type, options) => {
    switch (type) {
      case 'ActiveAlarmState': return new ActiveAlarmState();
      case 'DeactiveAlarmState': return new DeactiveAlarmState();
      case 'TriggeredAlarmState': return new TriggeredAlarmState(options.sensor);
      default: throw new Error(`${type} not supported.`);
    }
  }
}