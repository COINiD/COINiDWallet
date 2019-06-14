/**
 * Parses data from insight and sends it back.
 */

import io from 'socket.io-client';

import { EventEmitter } from 'events';
import { mockableUrl } from 'node-mock-server/react-native/utils';
import {
  getTxUniqueHash,
  isAddressUsed,
  removeDoubleSpendTxs,
  getUnspent,
} from './transactionHelper';

const sortTxs = (a, b) => {
  if (a.time === undefined && b.time === undefined) {
    return 0;
  }

  if (a.time === undefined) {
    return -1;
  }

  if (b.time === undefined) {
    return 1;
  }

  if (a.time === b.time) {
    return a.txid < b.txid ? -1 : 1;
  }

  return b.time - a.time;
};

const convertJsonToTxObject = jsonTxs => jsonTxs
  .filter(e => e !== null)
  .map((jsonTx) => {
    const { tx, confirmations } = jsonTx;
    const { height: blockHeight, blockTimestamp: time, hash: txid } = tx;

    let feeSat = 0;

    const vin = tx.inputs.map((input, index) => {
      feeSat += Number(input.satoshis);
      return {
        n: index,
        addr: input.address,
        txid: input.txid,
        value: Number(input.satoshis) / 1e8,
        vout: input.outputIndex,
        sequence: input.sequence,
      };
    });

    const vout = tx.outputs.map((output, index) => {
      feeSat -= Number(output.satoshis);
      return {
        n: index,
        addr: output.address,
        value: Number(output.satoshis) / 1e8,
      };
    });

    const fees = feeSat / 1e8;
    const size = tx.hex.length;

    const cleanTx = {
      blockHeight: blockHeight < 0 ? undefined : blockHeight,
      confirmations,
      fees,
      size,
      time,
      txid,
      vin,
      vout,
    };

    cleanTx.uniqueHash = getTxUniqueHash(cleanTx);
    return cleanTx;
  });

const startHistoryPolling = function (preferedInterval, timer) {
  const run = () => {
    const clearTimer = () => {
      if (this.historyTimer) {
        clearTimeout(this.historyTimer);
        this.historyTimer = 0;
      }
    };

    const fetchedHistory = (success) => {
      this.abortHistory = () => {};
      const interval = preferedInterval;

      this.historySyncAttemptCount++;
      this.historySyncCount += success ? 1 : 0;
      this.emit('fetchedHistory', success);

      if (this.historySyncCount > 0 && this.stopWhenSynced) {
        return;
      }

      if (!this.historyTimer) {
        this.historyTimer = setTimeout(run.bind(this), interval);
      }
    };

    const successHistory = () => fetchedHistory(true);

    const attemptedHistory = (err) => {
      if (err !== 'abort') {
        console.log(err);
        return fetchedHistory(false);
      }
    };

    clearTimer();
    this.abortHistory();

    this.getHistory(this.addresses)
      .then(successHistory)
      .catch(attemptedHistory);
  };
  run.bind(this)();
};

const startStatusPolling = function (interval) {
  const run = () => {
    const clearTimer = () => {
      if (this.statusTimer) {
        clearTimeout(this.statusTimer);
        this.statusTimer = 0;
      }
    };

    const successStatus = () => fetchedStatus(true);
    const attemptedStatus = err => fetchedStatus(false);

    const fetchedStatus = (success) => {
      this.statusSyncAttemptCount++;
      this.statusSyncCount += success ? 1 : 0;
      this.emit('fetchedStatus', success);

      if (this.statusSyncCount > 0 && this.stopWhenSynced) {
        return;
      }

      if (!this.statusTimer) {
        this.statusTimer = setTimeout(run.bind(this), interval);
      }
    };

    clearTimer();

    this.getStatus()
      .then(successStatus)
      .catch(attemptedStatus);
  };

  run.bind(this)();
};

const resetSyncCounts = function () {
  this.statusSyncCount = 0;
  this.statusSyncAttemptCount = 0;
  this.historySyncCount = 0;
  this.historySyncAttemptCount = 0;
};

const setStopWhenSynced = function (value) {
  this.stopWhenSynced = value;
};

class Blockbook extends EventEmitter {
  constructor(apiUrl, storage, network) {
    super();
    this.apiUrl = apiUrl;
    this.storage = storage;
    this.network = network;
    this.setupSocket();
  }

  setupSocket = () => {
    let disconnectTimer;

    const socketDisconnected = () => {
      clearTimeout(disconnectTimer);
      disconnectTimer = setTimeout(() => {
        this.setConnected(false);
      }, 6000);
    };

    const socketConnected = () => {
      clearTimeout(disconnectTimer);
      this.setConnected(true);
    };

    socketDisconnected();

    this.socket = io(mockableUrl(this.apiUrl), {
      transports: ['websocket'],
      reconnection: true,
      autoConnect: true,
    });

    this.socket.on('connect', () => socketConnected());
    this.socket.on('disconnect', () => socketDisconnected());
  };

  abortHistory = () => {
    console.log('emptyAbort...');
  };

  statusSyncCount = 0;

  statusSyncAttemptCount = 0;

  historySyncCount = 0;

  historySyncAttemptCount = 0;

  stopWhenSynced = false;

  started = false;

  addresses = [];

  transactions = [];

  blockHeight = 0;

  connected = true;

  historyTo = 0;

  info = { bridge: 'Blockbook' };

  socketSendPromise = ({ method, params }) => new Promise((resolve, reject) => {
    const timeoutTimer = setTimeout(() => {
      reject('socket promise timeout');
    }, 10000);

    this.socket.send({ method, params }, (data) => {
      clearTimeout(timeoutTimer);
      resolve(data);
    });
  });

  publishTx = (rawTx) => {
    const method = 'sendTransaction';
    const params = [rawTx];

    return this.socketSendPromise({ method, params }).then((json) => {
      console.log({ json });
      if (json.error) {
        throw 'Error while publishing';
      }
      return json;
    });
  };

  getStatus = () => {
    const method = 'getInfo';
    const params = [];

    return this.socketSendPromise({ method, params })
      .then((json) => {
        if (json === undefined || json.result === undefined || json.result.blocks === undefined) {
          console.log('err', { json });
          this.setConnected(false);
          return false;
        }

        const { result } = json;
        const { blocks } = result;

        this.setConnected(true);
        this.setBlockHeight(blocks);

        return info;
      })
      .catch(() => {
        this.setConnected(false);
        throw 'Error while fetching';
      });
  };

  lookupAddressHistories = (args) => {
    const doLookup = (queryMempoolOnly) => {
      const defaultArgs = ({
        addresses, from, to, fromBlock, toBlock,
      }) => ({
        addresses,
        from: from === undefined ? 0 : from,
        to: to === undefined ? 2000000000 : to,
        fromBlock: fromBlock === undefined ? 0 : fromBlock,
        toBlock: toBlock === undefined ? 2000000000 : toBlock,
      });

      const {
        addresses, from, to, fromBlock, toBlock,
      } = defaultArgs(args);

      const method = 'getAddressHistory';

      const params = [
        addresses,
        {
          end: fromBlock,
          start: toBlock,
          from,
          to,
          queryMempoolOnly,
        },
      ];

      return this.socketSendPromise({ method, params }).then((json) => {
        const { result } = json;

        if (result === undefined) {
          throw 'Error while fetching from blockbook';
        }

        return result;
      });
    };

    return Promise.all([doLookup(false), doLookup(true)]).then(([dbLookup, mempoolLookup]) => ({
      totalCount: mempoolLookup.totalCount + dbLookup.totalCount,
      items: mempoolLookup.items.concat(dbLookup.items),
    }));
  };

  getHistory = (addresses, skipinconsistencycheck) => {
    this.totalItems = 0;
    let txChange = (this.transactions === undefined || this.transactions.length === 0)
      && this.hasFetchedHistory === undefined
      ? 1
      : 0;
    this.hasFetchedHistory = true;

    const removeDuplicates = (txs) => {
      if (this.historyTo === undefined) {
        if (this.transactions.length !== txs.length) {
          txChange = 1;
        }
        return txs;
      }

      const txIds = this.transactions.map(e => e.txid);
      const updateMap = new Map(txs.filter(tx => txIds.includes(tx.txid)).map(tx => [tx.txid, tx]));

      if (updateMap.size) {
        for (let i = 0; i < this.transactions.length; i++) {
          const tx = this.transactions[i];
          if (updateMap.has(tx.txid)) {
            const updatedTx = updateMap.get(tx.txid);

            if (tx.confirmations !== updatedTx.confirmations) {
              this.transactions[i] = updatedTx;
              txChange = 1;
            }
          } else if (tx.confirmations === 0) {
            delete this.transactions[i];
          }
        }
      }

      const newTxs = txs.filter(tx => !txIds.includes(tx.txid));
      if (newTxs.length) txChange = 1;

      return newTxs;
    };

    const addToArray = (newTxs) => {
      if (this.historyTo === undefined) {
        return newTxs;
      }

      const txs = this.transactions.concat(newTxs);
      return txs;
    };

    const sortTxByTime = (txs) => {
      txs.sort(sortTxs);
      return txs;
    };

    const removeDoubleSpends = (txs) => {
      const txLength = txs.length;

      txs = removeDoubleSpendTxs(txs);

      if (txs.length !== txLength) {
        txChange = 1;
      }

      return txs;
    };

    const checkIfComplete = (txs) => {
      if (skipinconsistencycheck) return txs;
      const includedTxs = txs.filter(
        tx => tx.confirmations >= this.network.confirmations || tx.orphaned,
      ); // always refetch until txs has 6 confirmations.

      if (txChange) {
        this.transactions = txs;
        this.saveTransactions();
        this.emit('txChange');
      }

      this.inconsistent = false;

      if (includedTxs.length !== this.totalItems) {
        if (
          (this.historyTo === 0 || includedTxs.length !== txs.length)
          && includedTxs.length < this.totalItems
        ) {
          this.historyTo = this.totalItems - includedTxs.length; // take som height in case other order...

          console.log(
            'detected new tx on api, fetching...',
            includedTxs.length,
            txs.length,
            this.totalItems,
            this.historyTo,
          );
        } else {
          console.log(
            'inconsistency detected, doing a full refresh',
            this.historyTo,
            this.totalItems,
            includedTxs,
            txs,
          );
          this.historyTo = undefined;
          this.inconsistent = true;
        }

        if (this.historyTo !== this.lastHistoryTo) {
          this.lastHistoryTo = this.historyTo;

          console.log('doing a quick check...');
          return this.getHistory(addresses);
        }
      } else {
        this.historyTo = 0;
      }

      this.lastHistoryTo = this.historyTo;
      return txs;
    };

    return new Promise((resolve, reject) => {
      this.abortHistory = () => reject('abort');

      return this.fetchTransactions(addresses, this.historyTo)
        .then(removeDuplicates)
        .then(addToArray)
        .then(removeDoubleSpends)
        .then(sortTxByTime)
        .then(checkIfComplete)
        .then(resolve)
        .catch(reject);
    });
  };

  fetchTotalItemsOnExplorer = addresses => this.lookupAddressHistories({ addresses, to: 0 }).then((json) => {
    const { totalCount } = json;

    if (totalCount === undefined) {
      throw 'Error while fetching from blockbook';
    }

    return totalCount;
  });

  getLastTransactionBlockHeight = () => {
    if (this.transactions === undefined || this.transactions.length === 0) {
      return 0;
    }

    for (let i = 0; i < this.transactions.length; i += 1) {
      const { blockHeight, confirmations } = this.transactions[i];

      if (confirmations > this.network.confirmations && blockHeight !== undefined) {
        return this.transactions[i].blockHeight;
      }
    }
  };

  fetchUnspent = addresses => this.lookupAndConvertAddressHistories({ addresses }).then(txs => getUnspent(txs, addresses));

  lookupAndConvertAddressHistories = args => this.lookupAddressHistories(args).then((json) => {
    const { items } = json;

    if (items === undefined) {
      throw 'Error while fetching from blockbook';
    }

    const convertedItems = convertJsonToTxObject(items, this.network);

    return convertedItems;
  });

  fetchTransactions = (addresses, to) => this.fetchTotalItemsOnExplorer(addresses).then((totalItems) => {
    this.totalItems = totalItems;

    if (to === 0) {
      return [];
    }

    let fromBlock = 0;
    if (to !== undefined) {
      fromBlock = this.getLastTransactionBlockHeight() + 1;
    }

    return this.lookupAndConvertAddressHistories({ addresses, fromBlock });
  });

  getUsedAddresses = addresses => this.fetchTransactions(addresses).then((txs) => {
    const usedAddresses = {};

    for (let i = 0; i < addresses.length; i += 1) {
      const address = addresses[i];
      usedAddresses[address] = isAddressUsed(address, txs);
    }

    return usedAddresses;
  });

  resetSyncCounts = resetSyncCounts;

  startPolling = () => {
    this.resetSyncCounts();
    this.startStatusPolling(20000);
    this.startHistoryPolling(20000);
  };

  startHistoryPolling = startHistoryPolling;

  startStatusPolling = startStatusPolling;

  connectionFailsThreshold = 1;

  connectionFails = 0;

  lastSetConnected = false;

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
  };

  setBlockHeight = (blockHeight) => {
    if (this.blockHeight !== blockHeight) {
      this.blockHeight = blockHeight;
      this.emit('blockHeight', blockHeight);
      this.storage.set(`${this.apiUrl}:height`, blockHeight);
    }
  };

  setStopWhenSynced = setStopWhenSynced;

  saveTransactions = () => this.storage.set(`${this.apiUrl}:txs`, this.transactions).then(() => {
    console.log('saved...', this.transactions.length);
  });

  setAddresses = (addresses) => {
    // change addresses.
    this.addresses = addresses;
  };

  addAddresses = (addresses) => {
    // change addresses.
    this.addresses = this.addresses.concat(addresses);
  };

  start = () => new Promise((resolve) => {
    Promise.all([
      this.storage.get(`${this.apiUrl}:height`),
      this.storage.get(`${this.apiUrl}:txs`),
    ]).then(([blockHeight, txs]) => {
      if (blockHeight) {
        this.blockHeight = blockHeight;
      }

      if (txs) {
        this.transactions = txs;
        this.historyTo = 0;
      } else {
        this.historyTo = undefined;
      }

      return resolve(blockHeight);
    });
  });
}

module.exports = (apiUrl, storage, network) => new Blockbook(apiUrl, storage, network);
