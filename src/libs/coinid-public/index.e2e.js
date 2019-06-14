/**
 * Lib for CoinID Wallets
 */

import { mockableUrl } from 'node-mock-server/react-native/utils';
import COINiDPublic from './index.js';

/**
 * Module exports...
 */
module.exports = function createCOINiD(coin, storage, key) {
  const coinidPublic = new COINiDPublic(coin, storage, key);

  // only connect to one bridge for e2e tests.
  const {
    bridgeParameterArr: [[type, url]],
  } = coinidPublic.network;

  if (url.indexOf('?url=') === -1) {
    coinidPublic.network.bridgeParameterArr = [[type, mockableUrl(url)]];
  }

  return coinidPublic;
};
