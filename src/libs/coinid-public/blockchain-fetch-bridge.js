"use strict";

/**
* Fetches blockchain bridge.
*/

var bridges = {
  insight: require('./blockchain-bridge-insight'),
  blockbook: require('./blockchain-bridge-blockbook'),
}

var Blockchain = function(bridgeName, apiUrl, storage, network) {
  var bridge = bridges[bridgeName];
  return bridge(apiUrl, storage, network);
}

module.exports = Blockchain;