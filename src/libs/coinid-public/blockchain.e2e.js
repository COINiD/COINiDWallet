/**
 * Handles blockhain bridges
 */
import { mockableUrl } from 'node-mock-server/react-native/utils';

const Blockchain = require('./blockchain.js');

module.exports = (bridgeParameterArr, storage, network) => {
  // only connect to one bridge for e2e tests.
  const [[type, url]] = bridgeParameterArr;

  if (url.indexOf('?url=') === -1) {
    bridgeParameterArr = [[type, mockableUrl(url)]];
  }

  return new Blockchain(bridgeParameterArr, storage, network);
};
