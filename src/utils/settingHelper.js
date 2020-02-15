/**
 * Helper for loading and saving settings.
 */

import { EventEmitter } from 'events';
import storageHelper from './storageHelper';
import projectSettings from '../config/settings';

class SettingHelper extends EventEmitter {
  constructor(coin) {
    super();

    this.setMaxListeners(50);

    this.storageNS = `${coin}:settings`;
    this.storage = storageHelper(this.storageNS);
    this.defaultSettings = {
      coldWalletMode: true,
      currency: projectSettings.currency,
      language: projectSettings.language,
      range: 0,
      usePasscode: true,
      lockAfterDuration: 60000,
      preferredColdTransport: '',
    };

    this.settings = this.defaultSettings;
  }

  load = () => {
    const getDefaultIfEmpty = (key, data) => (data !== null ? data : this.defaultSettings[key]);

    const p = Object.entries(this.defaultSettings).map(([key]) => this.storage.get(key).then(data => getDefaultIfEmpty(key, data)));

    return Promise.all(p).then(
      ([
        coldWalletMode,
        currency,
        language,
        range,
        usePasscode,
        lockAfterDuration,
        preferredColdTransport,
      ]) => {
        this.settings = {
          coldWalletMode,
          currency,
          language,
          range,
          usePasscode,
          lockAfterDuration,
          preferredColdTransport,
        };

        this.emit('updated', this.settings);
      },
    );
  };

  update = (key, value) => {
    this.settings = { ...this.settings, [key]: value };
    this.save();
    this.emit('updated', this.settings);
  };

  save = () => {
    const p = Object.entries(this.settings).map(([key, value]) => this.storage.set(key, value));

    return Promise.all(p);
  };

  reset = () => {
    this.storage.reset();
  };

  toggle = (key) => {
    this.update(key, !this.get(key));
  };

  getAll = () => this.settings;

  get = key => this.settings[key];
}

const settingHelpersCache = {}; // for local caching so we dont create several for same coin.

module.exports = (coin) => {
  if (settingHelpersCache[coin] === undefined) {
    settingHelpersCache[coin] = new SettingHelper(coin);
  }

  return settingHelpersCache[coin];
};
