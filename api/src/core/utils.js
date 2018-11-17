"use strict";

function randomDelay(min, max) {
  return Math.floor(Math.random() * (1 + max - min)) + min;
}

module.exports = { randomDelay };