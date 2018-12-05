"use strict";

const express = require('express');
const router = express.Router();
const { SubscriptionRepository } = require('../domain/subscriptionRepository');

router.post('/', async (req, res) => {
  const subscription = req.body;
  const repository = new SubscriptionRepository();
  await repository.add(subscription);
  res.status(201).send();
});

router.delete('/:id', (req, res) => {
  
});

module.exports = router;