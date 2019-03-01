"use strict";

/**
* Handles blockhain bridges
*/

const bridgeFetcher = require('./blockchain-fetch-bridge');
import { EventEmitter } from 'events';

// Gets best bridge that provides selected function
const getBridgeFunction = function(bridges, functionKey) {
  for (var i = 0; i < bridges.length; i++) {
    if(bridges[i].hasOwnProperty(functionKey)) {
      return bridges[i];
    }
  }
}

var addBridge = function(bridgeKey, apiUrl, storage, network) {
  this.bridges.push(bridgeFetcher(bridgeKey, apiUrl, storage, network));
}

var addBridges = function(bridgeParameterArr, storage, network) {
  if(!bridgeParameterArr) {
    return 0;
  }

  for (var i = 0; i < bridgeParameterArr.length; i++) {
    this.addBridge(bridgeParameterArr[i][0], bridgeParameterArr[i][1], storage, network);
  }
}

var getStatus = function() {
  var bridgeStatusPromises = this.bridges.map(b => b.getStatus());

  return Promise.all(bridgeStatusPromises)
    .then(results => {
      return results
    })
    .catch(e => console.log(e));
}

var getSummary = function(addresses) {
  return getBridgeFunction(this.bridges, 'getSummary').getSummary(addresses);
}

var getHistory = function(addresses) {
  return getBridgeFunction(this.bridges, 'getHistory').getHistory(addresses);
}

var fetchUnspent = function(addresses) {
  return getBridgeFunction(this.bridges, 'fetchUnspent').fetchUnspent(addresses);
}

var getBalance = function(addresses) {
  return getBridgeFunction(this.bridges, 'getBalance').getBalance(addresses);
}

var getUsedAddresses = function(addresses) {
  return getBridgeFunction(this.bridges, 'getUsedAddresses').getUsedAddresses(addresses);
}

var publishTx = function(rawTx) {
  var bridgePublishPromises = this.bridges.map(b => b.publishTx(rawTx));

  return Promise.race(bridgePublishPromises) // return first publish..
         .then(results => results);
}

var getTx = function(txId, addresses) {
  return getBridgeFunction(this.bridges, 'getTx').getTx(txId, addresses);
}

var subscribe = function(listener) {
  return getBridgeFunction(this.bridges, 'subscribe').subscribe(listener);
}

var setAddresses = function(addresses) {
  this.bridges.map(b => b.setAddresses(addresses));
}

var addAddresses = function(addresses) {
  this.bridges.map(b => b.addAddresses(addresses));
}

var removeDuplicates = (txs, oldTxs) => {
  let txIds = oldTxs.map((e) => e.txid);
  var newTxs = txs.filter((tx) => !txIds.includes(tx.txid));
  return newTxs ? newTxs : [];
}

var startPolling = function() {
  this.bridges.map((b, i) => {
    b.startPolling();
  });
}

var resetSyncCounts = function() {
  this.bridges.map((b, i) => {
    b.resetSyncCounts();
  });
}

var setStopWhenSynced = function(value) {
  this.bridges.map((b, i) => {
    b.setStopWhenSynced(value);
  });
}

var start = function() {
  return this.storage.get('blockchain:txs').then((txs) => {
    if(txs) {
      this.transactions = txs;
    }

    var p = this.bridges.map((b, i) => {
      b.on('txChange', this.onTxChange);
      b.on('fetchedStatus', this.onBridgeFetchedStatus);
      b.on('fetchedHistory', this.onBridgeFetchedHistory);

      return b.start();
    });

    return Promise.all(p).then(() => {
      if(txs !== null) {
        this.onTxChange();
      }
    });
  });
}

class Blockchain extends EventEmitter {
  bridges = [];
  transactions = [];

  constructor(bridgeParameterArr, storage, network) {
    super();
    this.storage = storage;
    this.network = network;
    this.addBridges(bridgeParameterArr, storage, network);

    this.selectedBridge = this.bridges[0];
    this.selectedBridge.on('blockHeight', this.onBlockHeight);
    this.selectedBridge.on('connectionChange', this.onConnectionChange);
  }

  addBridge = addBridge
  addBridges = addBridges
  getStatus = getStatus
  getHistory = getHistory
  getSummary = getSummary
  getBalance = getBalance
  fetchUnspent = fetchUnspent
  setAddresses = setAddresses
  addAddresses = addAddresses
  getUsedAddresses = getUsedAddresses

  checkIfFullyInitialized = () => {
    var hasOneSynced = this.bridges.map(b => (b.statusSyncCount > 0 && b.historySyncCount > 0) ? 1 : 0).includes(1);
    var hasAllAttempted = !this.bridges.map(b => (b.statusSyncAttemptCount > 0 && b.historySyncAttemptCount > 0) ? 1 : 0).includes(0);

    if(hasAllAttempted) {
    };

    if(hasOneSynced) {
      this.emit('allsynced');
    }

    if(hasOneSynced && hasAllAttempted) {
    }
  }

  onBridgeFetchedStatus = () => {
    var hasOneSynced = this.bridges.map(b => b.statusSyncCount > 0 ? 1 : 0).includes(1);
    var hasAllAttempted = !this.bridges.map(b => b.statusSyncAttemptCount > 0 ? 1 : 0).includes(0);

    if(hasAllAttempted) {
    };

    if(hasOneSynced) {
      this.emit('statussynced');
    }

    this.checkIfFullyInitialized();
  }

  onBridgeFetchedHistory = () => {
    var hasOneSynced = this.bridges.map(b => b.historySyncCount > 0 ? 1 : 0).includes(1);
    var hasAllAttempted = !this.bridges.map(b => b.historySyncAttemptCount > 0 ? 1 : 0).includes(0);

    if(hasAllAttempted) {
    };

    if(hasOneSynced) {
      this.emit('historysynced');
    }

    this.checkIfFullyInitialized();
  }

  getConsistentBridges = () => {
    var consistentBridges = this.bridges.filter((b) => !b.inconsistent);

    if (consistentBridges.length) {
      return this.bridges;
    }

    return consistentBridges;
  }

  onTxChange = () => {
    var bridges = this.getConsistentBridges();

    // triggered from bridges when their internal transaction list have been updated and is consistent
    var m = {};
    for (var i = 0; i < bridges.length; i++) {
      var b = bridges[i];
      b.transactions.map(tx => m[tx.txid] = (m[tx.txid] ? m[tx.txid] : 0) + 1);
    }

    for (var i = 0; i < bridges.length; i++) {
      var b = bridges[i];
      b.totalAgreements = 0;

      var txs = b.transactions.map(tx => {
        tx.agreements = m[tx.txid];
        b.totalAgreements += tx.agreements;
        return tx;
      });
    }

    this.selectBestBridge();

    var selectedTxs = this.selectedBridge.transactions;
    var requiredAgreements = Math.ceil(bridges.length / 2.0);
    selectedTxs = selectedTxs.filter(tx => tx.agreements >= requiredAgreements); // remove txs that have lower than required agreements
    var newTxs = removeDuplicates(selectedTxs, this.transactions);

    this.transactions = selectedTxs;
    this.storage.set('blockchain:txs', selectedTxs);
    this.emit('txChange');

    if(newTxs.length) {
      this.emit('newTxs', newTxs);
    }
  }

  selectBestBridge = (skipCBs) => {
    var sortBridges = this.getConsistentBridges();

    if(!sortBridges.length) {
      return ;
    }

    sortBridges.sort((a, b) => b.totalAgreements - a.totalAgreements);

    var bestTotal = sortBridges[0].totalAgreements;
    var filteredBridges = sortBridges.filter(bridge => bestTotal === bridge.totalAgreements && bridge.connected);

    if(filteredBridges.length === 0) {
      filteredBridges = sortBridges;
    }

    if(this.selectedBridge !== undefined) {
      this.selectedBridge.removeListener('blockHeight', this.onBlockHeight);
      this.selectedBridge.removeListener('connectionChange', this.onConnectionChange);
    }

    this.selectedBridge = filteredBridges[0];
    this.selectedBridge.on('blockHeight', this.onBlockHeight);
    this.selectedBridge.on('connectionChange', this.onConnectionChange);

    if(!skipCBs) {
      this.onBlockHeight(this.selectedBridge.blockHeight);
      this.onConnectionChange(this.selectedBridge.connected);
    }
  }

  onConnectionChange = (isConnected) => {
    if(this.selectedBridge.connected === false) {
      // check if there are other bridges that are connected
      this.selectBestBridge(true);
    }

    this.emit('connectionChange', this.selectedBridge.connected);
  }

  onBlockHeight = (blockHeight) => {
    this.emit('blockHeight', blockHeight);
  }

  start = start
  startPolling = startPolling
  resetSyncCounts = resetSyncCounts
  setStopWhenSynced = setStopWhenSynced
  publishTx = publishTx
  getTx = getTx
  subscribe = subscribe
}

module.exports = (bridgeParameterArr, storage, network) => new Blockchain(bridgeParameterArr, storage, network);
