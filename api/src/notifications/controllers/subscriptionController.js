"use strict";

const express = require('express');

function factory(subscriptionRepository) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const subscription = req.body;
    await subscriptionRepository.add(subscription);
    res.status(201).send();
  });
  
  router.delete('/:id', (req, res) => {
    
  });

  return router;
}

module.exports = factory;