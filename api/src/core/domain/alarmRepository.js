"use strict";

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const Alarm = require('./alarm');

class AlarmRepository {
  constructor(fileName) {
    this.fileName = fileName;
  }

  async get() {
    const data = await readFile(this.fileName);
    const alarmJson = JSON.parse(data);
    return Alarm.createUsingOptions(alarmJson);
  }

  async save(alarm) {
    const alarmJson = JSON.stringify(alarm, null, 2);
    return await writeFile(this.fileName, alarmJson);
  }
}

module.exports = (fileName = 'alarm.json') => new AlarmRepository(fileName);