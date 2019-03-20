/**
 * Fetches blockchain bridge.
 */

const bridges = {
  insight: require('./blockchain-bridge-insight'),
  blockbook: require('./blockchain-bridge-blockbook'),
};

const Blockchain = function (bridgeName, apiUrl, storage, network) {
  const bridge = bridges[bridgeName];
  return bridge(apiUrl, storage, network);
};

module.exports = Blockchain;
