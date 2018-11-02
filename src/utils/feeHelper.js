

/**
 * Helper for retrieving fees.
 * All fees are displayed as fee-per-byte (in satoshis)
 */

import { EventEmitter } from 'events';
import storageHelper from './storageHelper';

class FeeHelper extends EventEmitter {
  constructor(coin) {
    super();
    this.storage = storageHelper(coin);
    this.apiUrl = `https://estimatefee.coinid.org/${coin}.json`;

    this.minimumFee = 1; // satoshi-per-byte (should lookup from coin settings)
    this.syncEveryMs = 60000;

    const initalFees = [[0, this.minimumFee]];
    for (let i = 0; i < 12; i++) {
      initalFees.push([0, parseInt(this.minimumFee + Math.pow(2, i), 10)]);
    }

    this.setFeesInfo({
      lastUpdated: 0,
      fees: initalFees,
    });

    this.storage.get('feesInfo').then((feesInfo) => {
      if (feesInfo === null) {
        return false;
      }

      this.setFeesInfo(feesInfo);
    });

    this.sync();
  }

  setFeesInfo = (feesInfo, save, emit) => {
    if (feesInfo.lastUpdated === undefined
      || feesInfo.fees === undefined
      || !Array.isArray(feesInfo.fees)
      || feesInfo.fees[0] === undefined
      || !Number.isInteger(feesInfo.fees[0][0])
      || !Number.isInteger(feesInfo.fees[0][1])) {
      return false;
    }

    this.feesInfo = feesInfo;

    if (save) {
      this.storage.set('feesInfo', this.feesInfo);
    }

    if (emit) {
      this.emit('syncedfees', this.feesInfo);
    }

    return true;
  }

  sync = () => {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.fetchFees().then((feesInfo) => {
      this.setFeesInfo(feesInfo, true, true);
      setTimeout(this.sync, this.syncEveryMs);
    }).catch((err) => {
      console.log(err);
      setTimeout(this.sync, this.syncEveryMs);
    });
  }

  fetchFees = () => fetch(this.apiUrl)
    .then(r => r.json())
    .then((json) => {
      const fees = json.data;

      return {
        lastUpdated: Date.now(),
        fees,
      };
    })

  getFees = () => this.feesInfo
}

const feeHelpersCache = {};

module.exports = function (coin) {
  if (feeHelpersCache[coin] === undefined) {
    feeHelpersCache[coin] = new FeeHelper(coin);
  }

  return feeHelpersCache[coin];
};
