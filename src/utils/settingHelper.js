'use strict';

/**
 * Helper for loading and saving settings.
 */

import { EventEmitter } from 'events';
import storageHelper from './storageHelper';
import Settings from '../config/settings';

class SettingHelper extends EventEmitter {
  constructor(coin) {
    super();

    this.setMaxListeners(50);

    this.storageNS = `${coin}:settings`;
    this.storage = storageHelper(this.storageNS);
    this.defaultSettings = {
      coldWalletMode: true,
      currencies: Settings.availableCurrencies,
      currency: Settings.currency,
      range: 0,
      usePasscode: true,
      lockAfterDuration: 60000,
      preferredColdTransport: '',
    };
    this.settings = { ...this.defaultSettings };
  }

  load = () => {
    const getDefaultIfEmpty = (key, data) =>
      data !== null ? data : this.defaultSettings[key];

    var p = Object.entries(this.defaultSettings).map(([key, value]) =>
      this.storage.get(key).then(data => getDefaultIfEmpty(key, data))
    );

    return Promise.all(p).then(
      ([
        coldWalletMode,
        currencies,
        currency,
        range,
        usePasscode,
        lockAfterDuration,
        preferredColdTransport,
      ]) => {
        this.settings = {
          coldWalletMode,
          currencies,
          currency,
          range,
          usePasscode,
          lockAfterDuration,
          preferredColdTransport,
        };

        this.emit('updated', this.settings);
      }
    );
  };

  update = (key, value) => {
    this.settings[key] = value;
    this.save();
    this.emit('updated', this.settings);
  };

  save = () => {
    var p = Object.entries(this.settings).map(([key, value]) => {
      return this.storage.set(key, value);
    });

    return Promise.all(p);
  };

  reset = () => {
    this.storage.reset();
  };

  getAll = () => {
    return this.settings;
  };
}

let settingHelpersCache = {}; // for local caching so we dont create several for same coin.

module.exports = function(coin) {
  if (settingHelpersCache[coin] === undefined) {
    settingHelpersCache[coin] = new SettingHelper(coin);
  }

  return settingHelpersCache[coin];
};
