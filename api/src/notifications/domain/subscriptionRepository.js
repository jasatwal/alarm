"use strict";

const crypto = require("crypto");
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const FILE_NAME = 'subscriptions.json';

function generateId() {
  return crypto.randomBytes(16).toString("hex");  
}

async function getAll() {
  const data = JSON.parse(await readFile(FILE_NAME));
  return data.subscriptions || [];
}

async function add(subscription) {
  if (subscription) {
    subscription.id = generateId();
    const data = JSON.parse(await readFile(FILE_NAME));
    data.subscriptions.push(subscription);
    await writeFile(FILE_NAME, JSON.stringify(data, null, 2));
  }
}

async function remove(subscription) {
  const id = typeof subscription === "number" ? subscription : subscription.id;
  if (id) {
    const data = JSON.parse(await readFile(FILE_NAME));
    for (let index in data.subscriptions) {
      const existingSubscription = data.subscriptions[index];
      if (existingSubscription.id === id) {
        data.subscriptions.splice(index, 1);
        break;
      }
    }
    await writeFile(FILE_NAME, JSON.stringify(data, null, 2));
  }
}

module.exports = {
  getAll,
  add,
  remove
};