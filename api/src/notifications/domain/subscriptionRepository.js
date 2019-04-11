// TODO: Generating an unique ID may not be necessary as the endpoint URL could serve that purpose.

"use strict";

const crypto = require("crypto");
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

function generateId() {
  return crypto.randomBytes(16).toString('hex');  
}

async function read(fileName) {
  return JSON.parse(await readFile(fileName));
}

async function write(fileName, data) {
  await writeFile(fileName, JSON.stringify(data, null, 2));
}

class SubscriptionRepository {
  constructor(fileName) {
    this.fileName = fileName;
  }

  async getAll() {
    const data = await read(this.fileName);
    return data.subscriptions || [];
  }

  async add(subscription) {
    if (subscription) {
      subscription.id = generateId();
      const data = await read(this.fileName);
      (data.subscriptions || (data.subscriptions = [])).push(subscription);
      await write(this.fileName, data);
    }
  }

  async remove(subscription) {
    const id = subscription.id || subscription;
    if (id) {
      const data = await read(this.fileName);
      for (let index in data.subscriptions || []) {
        const existingSubscription = data.subscriptions[index];
        if (existingSubscription.id === id) {
          data.subscriptions.splice(index, 1);
          break;
        }
      }
      await write(this.fileName, data);
    }
  }
}

module.exports = (fileName = 'subscriptions.json') => new SubscriptionRepository(fileName);