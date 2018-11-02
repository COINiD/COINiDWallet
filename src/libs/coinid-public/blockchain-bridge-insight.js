"use strict";

/**
* Parses data from insight and sends it back.
*/

const bitcoin        = require('bitcoinjs-lib');

import { EventEmitter } from 'events';
import { getTxUniqueHash, isAddressUsed, removeDoubleSpendTxs, invalidInput } from './transactionHelper';
import fetch from 'react-native-fetch-polyfill';

var printError = function(err) {
  console.error('A bridge error occurred: ', err);
}

var getStatus = function() {
  var url = this.apiUrl + '/status?q=getInfo';

  return fetch(url, { json: true, timeout: 6 * 1000 })
    .then(response => response.json())
    .then(json => {
      if(json === undefined || json.info === undefined || json.info.blocks === undefined) {
        this.setConnected(false);
        return false;
      }
      else {
        this.setConnected(true);
        this.setBlockHeight(json.info.blocks);

        return json.info;
      }
    })
    .catch((error) => { this.setConnected(false); throw('Error while fetching '+url); });
}

var sortTxs = function(a, b) {
  if(a.time === undefined && b.time === undefined) {
    return 0;
  }

  if(a.time === undefined) {
    return -1;
  }

  if(b.time === undefined) {
    return 1;
  }

  if(a.time === b.time) {
    return a.txid < b.txid ? -1 : 1;
  }

  return b.time - a.time;
}

var convertJsonToTxObject = (jsonTxs, network) => {

  return jsonTxs.filter(e => e !== null).map(jsonTx => {
    var vins = jsonTx.vin.map((input, index) => {
      return {
        n: input.n,
        addr: input.addr,
        txid: input.txid,
        value: Number(input.value),
        vout: input.vout,
        sequence: input.sequence
      }
    });

    var vouts = jsonTx.vout.map((output, index) => {
      let address = bitcoin.address.fromOutputScript(Buffer.from(output.scriptPubKey.hex, 'hex'), network);
      return {
        n: output.n,
        addr: address,
        value: Number(output.value),
      };
    });

    var cleanTx = {
      blockHeight: jsonTx.blockheight || jsonTx.blockHeight,
      blockhash: jsonTx.blockhash,
      confirmations: jsonTx.confirmations === undefined ? 0 : jsonTx.confirmations,
      fees: Number(jsonTx.fees),
      size: Number(jsonTx.size),
      time: jsonTx.time,
      txid: jsonTx.txid,
      vin: vins,
      vout: vouts,
    };

    cleanTx.uniqueHash = getTxUniqueHash(cleanTx);
    return cleanTx;
  });
}

var blocks = {};

var getTx = function(txId, addresses) {
  // Need to find out max addresses for insight so we can run this in batches if to many addresses...
  var options = {
    json: true,
    timeout: 6 * 1000,
  };

  return fetch(this.apiUrl + '/tx/' + txId, options)
    .then(response => response.json())
    .catch(printError);
}

var publishTx = function(rawTx) {
  console.log("publishing", rawTx);
  return fetch(this.apiUrl + '/tx/send', {  
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 20 * 1000,
    body: JSON.stringify({
      rawtx: rawTx
    })
  })
  .then(response => {
    console.log(response);
    if(response.ok !== true) {
      return response._bodyText;
    }
    return response.json();
  });
}

var setAddresses = function(addresses) {
  // change addresses.
  this.addresses = addresses;
}

var addAddresses = function(addresses) {
  // change addresses.
  this.addresses = this.addresses.concat(addresses);
}

var startHistoryPolling = function (preferedInterval, timer) {
  var run = () => {
    var clearTimer = () => {
      if(this.historyTimer) {
        clearTimeout(this.historyTimer);
        this.historyTimer = 0;
      }
    }

    var successHistory = () => fetchedHistory(true);
    var attemptedHistory = (err) => {
      if(err !== 'abort') {
        console.log(err);
        return fetchedHistory(false); 
      }
    }

    var fetchedHistory = (success) => {
      this.abortHistory = () => {};

      var interval = preferedInterval;

      if(!success) {
        console.log('Error while fetching, delaying next fetch...');
        interval = 60 * 1000;
      }

      this.historySyncAttemptCount++;
      this.historySyncCount += success ? 1 : 0;
      this.emit('fetchedHistory', success);

      if(this.historySyncCount > 0 && this.stopWhenSynced) {
        return ;
      }

      if(!this.historyTimer) {
        this.historyTimer = setTimeout(run.bind(this), interval);
      } 
    }

    clearTimer();
    this.abortHistory();

    this.getHistory(this.addresses)
    .then(successHistory)
    .catch(attemptedHistory);
  }
  run.bind(this)();
}

var startStatusPolling = function (interval, timer) {
  var run = () => {
    var clearTimer = () => {
      if(this.statusTimer) {
        clearTimeout(this.statusTimer);
        this.statusTimer = 0;
      }
    }

    var successStatus = () => fetchedStatus(true);
    var attemptedStatus = (err) => fetchedStatus(false);

    var fetchedStatus = (success) => {
      this.statusSyncAttemptCount++;
      this.statusSyncCount += success ? 1 : 0;
      this.emit('fetchedStatus', success);

      if(this.statusSyncCount > 0 && this.stopWhenSynced) {
        return ;
      }

      if(!this.statusTimer) {
        this.statusTimer = setTimeout(run.bind(this), interval);
      } 
    }

    clearTimer();

    this.getStatus()
    .then(successStatus)
    .catch(attemptedStatus);
  }

  run.bind(this)();
}

var startPolling = function() {
  this.resetSyncCounts();
  this.startStatusPolling(20000);
  this.startHistoryPolling(20000);
}

var resetSyncCounts = function() {
  this.statusSyncCount = 0;
  this.statusSyncAttemptCount = 0;
  this.historySyncCount = 0;
  this.historySyncAttemptCount = 0;
}

var setStopWhenSynced = function(value) {
  this.stopWhenSynced = value;
}

var start = function() {
  return new Promise((resolve, reject) => {
    Promise.all([
      this.storage.get(this.apiUrl+':height'),
      this.storage.get(this.apiUrl+':txs')
    ]).then(([blockHeight, txs]) => {
      if(blockHeight) {
        this.blockHeight = blockHeight;
      }

      if(txs) {
        this.transactions = txs;
      }

      return resolve(blockHeight);
    });
  });

}

class Insight extends EventEmitter {
  constructor(apiUrl, storage, network) {
    super();
    this.apiUrl = apiUrl;
    this.storage = storage;
    this.network = network;
  }

  abortHistory = () => { console.log('emptyAbort...'); }
  statusSyncCount = 0
  statusSyncAttemptCount = 0
  historySyncCount = 0
  historySyncAttemptCount = 0
  stopWhenSynced = false
  started = false
  addresses = []
  transactions = []
  blockHeight = 0
  connected = true
  historyTo = 0
  info = { bridge: 'Insight' }
  getStatus = getStatus
  getHistory = (addresses, skipinconsistencycheck) => {
    // Need to find out max addresses for insight so we can run this in batches if to many addresses...
    this.totalItems = 0;
    var txChange = 0;

    var removeDuplicates = (txs) => {
      console.log('got', txs.length);


      if(this.historyTo === undefined) {
        if(this.transactions.length !== txs.length) {
          txChange = 1;
        }
        return txs;
      }

      var txIds = this.transactions.map(e => e.txid);
      var updateMap = new Map(txs.filter(tx => txIds.includes(tx.txid)).map(tx => [tx.txid, tx]));

      if(updateMap.size) {
        for (var i = 0; i < this.transactions.length; i++) {
          var tx = this.transactions[i];
          if(updateMap.has(tx.txid)) {
            var updatedTx = updateMap.get(tx.txid);

            if(tx.confirmations !== updatedTx.confirmations) {
              this.transactions[i] = updatedTx;
              txChange = 1;
            }
          }
          else {
            if(tx.confirmations === 0) {
              delete this.transactions[i]; 
            }
          }
        }
      }
      
      var newTxs = txs.filter(tx => !txIds.includes(tx.txid));
      if(newTxs.length) txChange = 1;

      return newTxs;
    }

    var addToArray = (newTxs) => {

      if(this.historyTo === undefined) {
        return newTxs;
      }

      var txs = this.transactions.concat(newTxs);
      txs.sort(sortTxs);

      return txs;
    }

    var removeDoubleSpends = (txs) => {
      let txLength = txs.length;

      txs = removeDoubleSpendTxs(txs);

      if(txs.length !== txLength) {
        txChange = 1;
      }

      return txs;
    }

    var fillBlockHeight = (txs) => {
      var promises = txs.map(tx => new Promise((resolve) => {
        if(tx.confirmations === -1) {
          tx.orphaned = 1;
        }

        if(tx.blockHeight || !tx.blockhash) {
          return resolve(tx);
        }

        const doFillBlockHeight = () => {
          const block = blocks[tx.blockhash];

          if(block) {
            if(block.confirmations === -1) {
              tx.orphaned = 1;
            }
            else {
              tx.blockHeight = block.height;
            }

            return true;
          }

          return false;
        }

        if(doFillBlockHeight()) {
          return resolve(tx);
        }

        var url = this.apiUrl + '/block/' + tx.blockhash;
        console.log(url);
        console.log(tx.blockheight);

        fetch(url, { json: true, timeout: 30 * 1000, })
        .then(response => response.json())
        .then(json => {
          const block = {
            height: json.height,
            confirmations: json.confirmations,
          };

          blocks[tx.blockhash] = block;
          doFillBlockHeight();

          return resolve(tx);
        });
      }));
      
      return Promise.all(promises);
    }

    var checkIfComplete = (txs) => {
      if(skipinconsistencycheck) return txs;
      var includedTxs = txs.filter(tx => tx.confirmations >= this.network.confirmations || tx.orphaned); // always refetch until txs has 6 confirmations.

      if(txChange) {
        this.transactions = txs;
        this.saveTransactions();
        this.emit('txChange');
      }

      this.inconsistent = false;

      if(includedTxs.length !== this.totalItems) {
        if((this.historyTo === 0 || includedTxs.length !== txs.length) && includedTxs.length < this.totalItems) { 
          this.historyTo = (this.totalItems-includedTxs.length); // take som height in case other order... 

          console.log('detected new tx on api, fetching...', includedTxs.length, txs.length, this.totalItems, this.historyTo)
        }
        else {
          console.log('inconsistency detected, doing a full refresh', this.historyTo, this.totalItems, includedTxs, txs);
          this.historyTo = undefined;
          this.inconsistent = true;
        }

        if(this.historyTo !== this.lastHistoryTo) {
          this.lastHistoryTo = this.historyTo;
  
          console.log('doing a quick check...');
          return this.getHistory(addresses);
        }
      }
      else {
        this.historyTo = 0;
      }

      this.lastHistoryTo = this.historyTo;
      return txs;
    };

    return new Promise((resolve, reject) => {
      this.abortHistory = () => {
        return reject('abort');
      }

      return this.fetchTransactions(addresses, this.historyTo)
      .then(removeDuplicates)
      .then(addToArray)
      .then(removeDoubleSpends)
      .then(fillBlockHeight)
      .then(checkIfComplete)
      .then(resolve)
      .catch(reject);
    })
  }

  getRequestPostData = (addresses) => {
    return {
      addrs: addresses.join(),
      noAsm: 1, 
      noScriptSig: 1, 
      noSpent: 1
    };
  }

  getRequestUrls = (finalTo) => {
    const maxChunk = 20; // some insight servers have limits on how many txs can be fetched at once.

    let requestUrlArr = [];

    for(let curTo = 0; curTo < finalTo; ) {
      let curFrom = curTo;

      curTo += maxChunk;
      curTo = curTo > finalTo ? finalTo : curTo;

      requestUrlArr.push(this.apiUrl + '/addrs/txs?from=' + curFrom + '&to=' + curTo + "&noAsm=1&noSpent=1&noScriptSig=1");
    }

    return requestUrlArr;
  }

  fetchAndParseTransactionUrl = (url, addresses) => {
    const postBody = this.getRequestPostData(addresses);

    return fetch(url, {  
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      timeout: 30 * 10000,
      body: JSON.stringify(postBody)
    })
    .then(response => {
      return response.json();
    });
  }

  fetchTotalItemsOnExplorer = (addresses) => {
    const url = this.apiUrl + '/addrs/txs?from=0&to=0';

    return this.fetchAndParseTransactionUrl(url, addresses)
    .then(json => {
      if(json.error) {
        throw("Error while fetching from insight");
      }

      return json.totalItems;
    });
  }

  fetchTransactionFromUrl = (url, addresses) => {
    return this.fetchAndParseTransactionUrl(url, addresses)
    .then(json => convertJsonToTxObject(json.items, this.network));
  }

  fetchTransactions = (addresses, to) => {
    return this.fetchTotalItemsOnExplorer(addresses)
    .then(totalItems => {
      this.totalItems = totalItems;

      if(to === 0) {
        return [];
      }

      if(to === undefined) {
        to = totalItems;
      }

      const requestUrls = this.getRequestUrls(to);
      const fetchBatches = requestUrls.map(url => this.fetchTransactionFromUrl(url, addresses));

      return Promise.all(fetchBatches)
      .then(transactionBatches => {
        console.log(transactionBatches);
        return Array.prototype.concat(...transactionBatches)
      }); // flatten batchFetchedTxs
    });
  }

  getUsedAddresses = (addresses) => {
    return this.fetchTransactions(addresses)
    .then((txs) => {
      var usedAddresses = {};

      for (var i = 0; i < addresses.length; i++) {
        var address = addresses[i];
        usedAddresses[address] = isAddressUsed(address, txs);
      }

      return usedAddresses;
    });
  }

  resetSyncCounts = resetSyncCounts
  startPolling = startPolling
  startHistoryPolling = startHistoryPolling
  startStatusPolling = startStatusPolling

  connectionFailsThreshold = 2
  connectionFails = 0
  lastSetConnected = false


  setConnected = (isConnected) => {
    if (isConnected === false && this.lastSetConnected === false) {
      this.connectionFails += 1;
    }
    this.lastSetConnected = isConnected;

    if (isConnected === true) {
      this.connectionFails = 0;

      this.connected = true;
      this.emit('connectionChange', true);

      return true;
    }

    if (this.connectionFails >= this.connectionFailsThreshold) {
      this.connected = false;
      this.emit('connectionChange', false);

      return true;
    }
  }

  setBlockHeight = (blockHeight) => {
    if(this.blockHeight !== blockHeight) {
      this.blockHeight = blockHeight;
      this.emit('blockHeight', blockHeight);
      this.storage.set(this.apiUrl+':height', blockHeight);
    }
  }

  setStopWhenSynced = setStopWhenSynced
  saveTransactions = () => {
    return this.storage.set(this.apiUrl+':txs', this.transactions).then(() => { 
      console.log('saved...', this.transactions.length)
    });
  }

  setAddresses = setAddresses
  addAddresses = addAddresses
  start = start
  publishTx = publishTx
  getTx = getTx
}

module.exports = (apiUrl, storage, network) => new Insight(apiUrl, storage, network);