"use strict";

class CachedAlarmRepository {
  constructor(repository) {
    this.repository = repository;
  }

  async get() {
    return this.instance || (this.instance = await this.repository.get());
  }

  save(alarm) {
    return this.repository.save(alarm);
  }
}

module.exports = CachedAlarmRepository;