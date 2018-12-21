"use strict";

const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const expect = require('chai').expect;
const factory = require('../../src/notifications/domain/subscriptionRepository');

const TEST_FILE_NAME = './test/subscriptions/subscriptions.json';

function createTestFile() {
  writeFile(TEST_FILE_NAME, JSON.stringify({
    subscriptions: [
      {
        id: '1',
        endpoint: 'https://myendpoint1.com',
        expirationTime: null,
        keys: {
          p256dh: 'p256dh',
          auth: 'auth'
        }
      },
      {
        id: '2',
        endpoint: 'https://myendpoint2.com',
        expirationTime: null,
        keys: {
          p256dh: 'p256dh',
          auth: 'auth'
        }
      }        
    ]      
  }));
}

async function readSubscriptions() {
  return JSON.parse(await readFile(TEST_FILE_NAME)).subscriptions;
}

describe('SubscriptionRepository', () => {
  beforeEach(async () => {
    await createTestFile();
  });

  after(async () => {
    await unlink(TEST_FILE_NAME);
  });

  it('getAll() should return subscriptions', async () => {

    // Arrange
    const subscriptionRepository = factory(TEST_FILE_NAME);

    // Act
    const subscriptions = await subscriptionRepository.getAll();

    // Assert
    expect(2).to.be.equal(subscriptions.length);

  });

  it('add() should add a subscription', async () => {

    // Arrange
    const subscriptionRepository = factory(TEST_FILE_NAME);

    // Act
    await subscriptionRepository.add({
      "endpoint": "https://myendpoint3.com",
      "expirationTime": null,
      "keys": {
        "p256dh": "p256dh",
        "auth": "auth"
      }      
    });

    // Assert
    const subscriptions = await readSubscriptions();
    expect(3).to.be.equal(subscriptions.length);

  });

  it('remove() should add a subscription', async () => {

    // Arrange
    const subscriptionRepository = factory('./test/subscriptions/subscriptions.json');

    // Act
    await subscriptionRepository.remove({
      id: '1'
    });

    // Assert
    const subscriptions = await readSubscriptions();
    expect(1).to.be.equal(subscriptions.length);

  });  
});
