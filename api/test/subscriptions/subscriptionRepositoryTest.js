"use strict";

const expect = require('chai').expect;
const SubscriptionRepository = require('../../src/subscriptions/subscriptionRepository');

describe('SubscriptionRepository', () => {
  it('getAll() should return subscriptions', async () => {

    // Arrange
    const subscriptionRepository = new SubscriptionRepository();

    // Act
    const subscriptions = await subscriptionRepository.getAll();

    // Assert
    expect(2).to.be.equal(subscriptions.length);

  });

  it('add() should add a subscription', async () => {

    // Arrange
    const subscriptionRepository = new SubscriptionRepository();

    // Act
    await subscriptionRepository.add({
      "endpoint": "https://endpoint.com",
      "expirationTime": null,
      "keys": {
        "p256dh": "p256dh",
        "auth": "auth"
      }      
    });

    // Assert
    const subscriptions = await subscriptionRepository.getAll();    
    expect(3).to.be.equal(subscriptions.length);

  });

  it('remove() should add a subscription', async () => {

    // Arrange
    const subscriptionRepository = new SubscriptionRepository();

    // Act
    await subscriptionRepository.remove({
      id: "446d2f9a4c0163e127b1af853f17af0d"
    });

    // Assert
    const subscriptions = await subscriptionRepository.getAll();    
    expect(2).to.be.equal(subscriptions.length);

  });  
});
