/**
 * Handles blockhain bridges
 */

import { EventEmitter } from 'events';

const bridgeFetcher = require('./blockchain-fetch-bridge');

// Gets best bridge that provides selected function
const getBridgeFunction = function (bridges, functionKey) {
  for (let i = 0; i < bridges.length; i++) {
    if (bridges[i].hasOwnProperty(functionKey)) {
      return bridges[i];
    }
  }
};

const addBridge = function (bridgeKey, apiUrl, storage, network) {
  this.bridges.push(bridgeFetcher(bridgeKey, apiUrl, storage, network));
};

const addBridges = function (bridgeParameterArr, storage, network) {
  if (!bridgeParameterArr) {
    return 0;
  }

  for (let i = 0; i < bridgeParameterArr.length; i++) {
    this.addBridge(bridgeParameterArr[i][0], bridgeParameterArr[i][1], storage, network);
  }
};

const getStatus = function () {
  const bridgeStatusPromises = this.bridges.map(b => b.getStatus());

  return Promise.all(bridgeStatusPromises)
    .then(results => results)
    .catch(e => console.log(e));
};

const getSummary = function (addresses) {
  return getBridgeFunction(this.bridges, 'getSummary').getSummary(addresses);
};

const getHistory = function (addresses) {
  return getBridgeFunction(this.bridges, 'getHistory').getHistory(addresses);
};

const fetchUnspent = function (addresses) {
  return getBridgeFunction(this.bridges, 'fetchUnspent').fetchUnspent(addresses);
};

const getBalance = function (addresses) {
  return getBridgeFunction(this.bridges, 'getBalance').getBalance(addresses);
};

const getUsedAddresses = function (addresses) {
  return getBridgeFunction(this.bridges, 'getUsedAddresses').getUsedAddresses(addresses);
};

const publishTx = function (rawTx) {
  const bridgePublishPromises = this.bridges.map(b => b.publishTx(rawTx));

  return Promise.race(bridgePublishPromises) // return first publish..
    .then(results => results);
};

const getTx = function (txId, addresses) {
  return getBridgeFunction(this.bridges, 'getTx').getTx(txId, addresses);
};

const subscribe = function (listener) {
  return getBridgeFunction(this.bridges, 'subscribe').subscribe(listener);
};

const setAddresses = function (addresses) {
  this.bridges.map(b => b.setAddresses(addresses));
};

const addAddresses = function (addresses) {
  this.bridges.map(b => b.addAddresses(addresses));
};

const removeDuplicates = (txs, oldTxs) => {
  const txIds = oldTxs.map(e => e.txid);
  const newTxs = txs.filter(tx => !txIds.includes(tx.txid));
  return newTxs || [];
};

const startPolling = function () {
  this.bridges.map((b, i) => {
    b.startPolling();
  });
};

const resetSyncCounts = function () {
  this.bridges.map((b, i) => {
    b.resetSyncCounts();
  });
};

const setStopWhenSynced = function (value) {
  this.bridges.map((b, i) => {
    b.setStopWhenSynced(value);
  });
};

const start = function () {
  return this.storage.get('blockchain:txs').then((txs) => {
    if (txs) {
      this.transactions = txs;
    }

    const p = this.bridges.map((b, i) => {
      b.on('txChange', this.onTxChange);
      b.on('fetchedStatus', this.onBridgeFetchedStatus);
      b.on('fetchedHistory', this.onBridgeFetchedHistory);

      return b.start();
    });

    return Promise.all(p).then(() => {
      if (txs !== null) {
        this.onTxChange();
      }
    });
  });
};

class Blockchain extends EventEmitter {
  bridges = [];

  transactions = [];

  constructor(bridgeParameterArr, storage, network) {
    super();
    this.storage = storage;
    this.network = network;
    this.addBridges(bridgeParameterArr, storage, network);

    this.selectedBridge = this.bridges[0];
    this.selectedBridge.on('blockHeight', this.onBlockHeight);
    this.selectedBridge.on('connectionChange', this.onConnectionChange);
  }

  addBridge = addBridge;

  addBridges = addBridges;

  getStatus = getStatus;

  getHistory = getHistory;

  getSummary = getSummary;

  getBalance = getBalance;

  fetchUnspent = fetchUnspent;

  setAddresses = setAddresses;

  addAddresses = addAddresses;

  getUsedAddresses = getUsedAddresses;

  checkIfFullyInitialized = () => {
    const hasOneSynced = this.bridges
      .map(b => (b.statusSyncCount > 0 && b.historySyncCount > 0 ? 1 : 0))
      .includes(1);
    const hasAllAttempted = !this.bridges
      .map(b => (b.statusSyncAttemptCount > 0 && b.historySyncAttemptCount > 0 ? 1 : 0))
      .includes(0);

    if (hasAllAttempted) {
    }

    if (hasOneSynced) {
      this.emit('allsynced');
    }

    if (hasOneSynced && hasAllAttempted) {
    }
  };

  onBridgeFetchedStatus = () => {
    const hasOneSynced = this.bridges.map(b => (b.statusSyncCount > 0 ? 1 : 0)).includes(1);
    const hasAllAttempted = !this.bridges
      .map(b => (b.statusSyncAttemptCount > 0 ? 1 : 0))
      .includes(0);

    if (hasAllAttempted) {
    }

    if (hasOneSynced) {
      this.emit('statussynced');
    }

    this.checkIfFullyInitialized();
  };

  onBridgeFetchedHistory = () => {
    const hasOneSynced = this.bridges.map(b => (b.historySyncCount > 0 ? 1 : 0)).includes(1);
    const hasAllAttempted = !this.bridges
      .map(b => (b.historySyncAttemptCount > 0 ? 1 : 0))
      .includes(0);

    if (hasAllAttempted) {
    }

    if (hasOneSynced) {
      this.emit('historysynced');
    }

    this.checkIfFullyInitialized();
  };

  getConsistentBridges = () => {
    const consistentBridges = this.bridges.filter(b => !b.inconsistent);

    if (consistentBridges.length) {
      return this.bridges;
    }

    return consistentBridges;
  };

  onTxChange = () => {
    const bridges = this.getConsistentBridges();

    // triggered from bridges when their internal transaction list have been updated and is consistent
    const m = {};
    for (var i = 0; i < bridges.length; i++) {
      var b = bridges[i];
      b.transactions.map(tx => (m[tx.txid] = (m[tx.txid] ? m[tx.txid] : 0) + 1));
    }

    for (var i = 0; i < bridges.length; i++) {
      var b = bridges[i];
      b.totalAgreements = 0;

      const txs = b.transactions.map((tx) => {
        tx.agreements = m[tx.txid];
        b.totalAgreements += tx.agreements;
        return tx;
      });
    }

    this.selectBestBridge();

    let selectedTxs = this.selectedBridge.transactions;
    const requiredAgreements = Math.ceil(bridges.length / 2.0);
    selectedTxs = selectedTxs.filter(tx => tx.agreements >= requiredAgreements); // remove txs that have lower than required agreements
    const newTxs = removeDuplicates(selectedTxs, this.transactions);

    this.transactions = selectedTxs;
    this.storage.set('blockchain:txs', selectedTxs);
    this.emit('txChange');

    if (newTxs.length) {
      this.emit('newTxs', newTxs);
    }
  };

  selectBestBridge = (skipCBs) => {
    const sortBridges = this.getConsistentBridges();

    if (!sortBridges.length) {
      return;
    }

    sortBridges.sort((a, b) => b.totalAgreements - a.totalAgreements);

    const bestTotal = sortBridges[0].totalAgreements;
    let filteredBridges = sortBridges.filter(
      bridge => bestTotal === bridge.totalAgreements && bridge.connected,
    );

    if (filteredBridges.length === 0) {
      filteredBridges = sortBridges;
    }

    if (this.selectedBridge !== undefined) {
      this.selectedBridge.removeListener('blockHeight', this.onBlockHeight);
      this.selectedBridge.removeListener('connectionChange', this.onConnectionChange);
    }

    this.selectedBridge = filteredBridges[0];
    this.selectedBridge.on('blockHeight', this.onBlockHeight);
    this.selectedBridge.on('connectionChange', this.onConnectionChange);

    if (!skipCBs) {
      this.onBlockHeight(this.selectedBridge.blockHeight);
      this.onConnectionChange(this.selectedBridge.connected);
    }
  };

  onConnectionChange = (isConnected) => {
    if (this.selectedBridge.connected === false) {
      // check if there are other bridges that are connected
      this.selectBestBridge(true);
    }

    this.emit('connectionChange', this.selectedBridge.connected);
  };

  onBlockHeight = (blockHeight) => {
    this.emit('blockHeight', blockHeight);
  };

  start = start;

  startPolling = startPolling;

  resetSyncCounts = resetSyncCounts;

  setStopWhenSynced = setStopWhenSynced;

  publishTx = publishTx;

  getTx = getTx;

  subscribe = subscribe;
}

module.exports = (bridgeParameterArr, storage, network) => new Blockchain(bridgeParameterArr, storage, network);
