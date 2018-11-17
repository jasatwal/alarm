"use strict";

const crypto = require("crypto");
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

function generateId() {
  return crypto.randomBytes(16).toString("hex");  
}

class SubscriptionRepository {
  async getAll() {
    const data = JSON.parse(await readFile('subscriptions.json'));
    return data.subscriptions || [];
  }

  async add(subscription) {
    if (subscription) {
      subscription.id = generateId();
      const data = JSON.parse(await readFile('subscriptions.json'));
      data.subscriptions.push(subscription);
      await writeFile('subscriptions.json', JSON.stringify(data, null, 2));
    }
  }

  async remove(subscription) {
    const id = typeof subscription === "number" ? subscription : subscription.id;
    if (id) {
      const data = JSON.parse(await readFile('subscriptions.json'));
      for (let index in data.subscriptions) {
        const existingSubscription = data.subscriptions[index];
        if (existingSubscription.id === id) {
          data.subscriptions.splice(index, 1);
          break;
        }
      }
      await writeFile('subscriptions.json', JSON.stringify(data, null, 2));
    }
  }
}

module.exports = SubscriptionRepository;