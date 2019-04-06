/**
 * Lib for CoinID Wallets
 */

import Big from 'big.js';

import { EventEmitter } from 'events';

import {
  getAddressTypeInfo,
  getTypeFromDerivation,
  getAddInputFunctionFromDerivation,
} from 'coinid-address-types';
import feeHelper from '../../utils/feeHelper';
import noteHelper from '../../utils/noteHelper';
import {
  rawHexToObject,
  cleanQueuedTxs,
  fillTxBalanceChange,
  getUnspent,
  isAddressUsed,
} from './transactionHelper';
import {
  getByteCount, dataToString, derivationToQr, derivationArrToQr,
} from './utils';

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const bip32utils = require('./bip32-utils-extension');
const Blockchain = require('./blockchain');

class COINiDPublic extends EventEmitter {
  constructor(coin, storage, key) {
    super();

    this.storage = storage;

    this.balance = 0;
    this.transactions = null;
    this.coin = coin;
    this.blockHeight = 0;
    this.network = bitcoin.networks[coin];
    this.ticker = this.network.ticker;
    this.qrScheme = this.network.qrScheme;
    this.coinTitle = this.network.title;
    this.unspent = [];

    this.blockchain = Blockchain(this.network.bridgeParameterArr, this.storage, this.network);

    this.txQueueArr = [];
    this.feeHelper = feeHelper(coin);
    this.noteHelper = noteHelper(key);
    this.key = key;
    this.pubKeyData = '';
  }

  getStorage = () => this.storage;

  createPubKeyArrayFromDataString = (data) => {
    if (!data) {
      throw 'Data is empty';
    }

    const pubKeyArray = data
      .split('+')
      .map(keyStr => keyStr.split('$'))
      .map(d => ({
        derivationPath: `m/${d[0].replace(/\-/g, "'").replace(/\*/g, '/')}`,
        publicKey: d[1],
      }));

    if (pubKeyArray[0].derivationPath === undefined) {
      throw 'Invalid data format';
    }

    if (pubKeyArray[0].publicKey === undefined) {
      throw 'Invalid data format';
    }

    return pubKeyArray;
  };

  verifyDerivationPath = (derivationPath) => {
    const derivationArr = derivationPath.split('/');

    if (derivationArr[0] !== 'm') {
      throw 'Derivation path format error';
    }

    for (let i = 1; i < derivationArr.length; i += 1) {
      const curDir = derivationArr[i].replace(/'$/, '');
      if (!Number.isInteger(parseInt(curDir, 10))) {
        throw 'Derivation path format error';
      }
    }

    const accountAddressType = getTypeFromDerivation(derivationPath);
    if (accountAddressType === undefined) {
      throw 'Derivation path purpose error';
    }

    if (this.network.supportedAddressTypes.indexOf(accountAddressType) === -1) {
      throw 'Unsupported address type in derivation';
    }

    if (parseInt(derivationArr[2], 10) !== this.network.bip44Derivation) {
      throw 'Unsupported coin in derivation';
    }

    if (parseInt(derivationArr[3], 10) !== 0) {
      throw 'Derivation path specifies unsupported account';
    }

    return true;
  };

  getAccountFromPubKeyArray = (pubKeyArray) => {
    const pubKeyHash = pubKeyArray[0];

    this.verifyDerivationPath(pubKeyHash.derivationPath);

    const chainsArr = bip32utils.createChains(
      pubKeyHash.derivationPath,
      pubKeyHash.publicKey,
      this.network,
    );

    const account = new bip32utils.Account(chainsArr);

    return account;
  };

  createWallet = (pubKeyArray) => {
    this.account = this.getAccountFromPubKeyArray(pubKeyArray);
    return this.account;
  };

  startWallet = () => {
    const promises = [
      this.getAccount(),
      this.loadTxQueueArr(),
      this.loadBalance(),
      this.storage.get('transactions'),
      this.loadBlockHeight(),
      this.loadPubKeyData(),
    ];

    return Promise.all(promises).then(
      ([account, txQueueArr, balance, txs, blockHeight, pubKeyData]) => {
        this.txQueueArr = txQueueArr;
        this.balance = balance;
        this.pubKeyData = pubKeyData;

        this.onBlockHeight(blockHeight);

        this.blockchain.setAddresses(account.getAllAddresses());

        if (txs) {
          this.setTransactions(txs);

          this.emit('transactions');
          this.emit('balance');
        }

        this.start();

        return true;
      },
    );
  };

  start = () => {
    this.startListeners();
    this.blockchain.start().then(() => {
      this.startPublishQueue();
      this.blockchain.startPolling();
      this.blockchain.setStopWhenSynced(false);
    });
  };

  startPublishQueue = () => {
    const filterPublishErrors = () => {
      const txQueueLength = this.txQueueArr.length;
      this.txQueueArr = this.txQueueArr.filter(
        e => e.publishErrors === undefined || e.publishErrors < 10,
      );

      if (txQueueLength !== this.txQueueArr.length) {
        console.log('Removed tx with to many publish errors...');
        this.onTxChange();
      }
    };

    const publishQueue = () => {
      filterPublishErrors();

      if (this.txQueueArr.length) {
        for (let i = 0; i < this.txQueueArr.length; i += 1) {
          const queuedTx = this.txQueueArr[i];
          this.publishTx(queuedTx.hex)
            .then(() => {
              setTimeout(publishQueue, 5000);
            })
            .catch((err) => {
              if (queuedTx.publishErrors === undefined) {
                queuedTx.publishErrors = 0;
              }

              queuedTx.publishErrors += 1;
              setTimeout(publishQueue, 5000);
            });
        }
      } else {
        setTimeout(publishQueue, 10000);
      }
    };

    publishQueue();
  };

  startListeners = () => {
    this.blockchain.on('blockHeight', this.onBlockHeight);
    this.blockchain.on('connectionChange', this.onConnectionChange);
    this.blockchain.on('txChange', this.onTxChange);
    this.blockchain.on('allsynced', this.onAllSynced);
  };

  onAllSynced = () => {
    if (this.transactions === null) {
      // first time synced, but no transactions (removes loading on tx)
      this.onTxChange();
    }
  };

  onConnectionChange = (isConnected) => {
    this.connected = isConnected;
    this.emit('connectionChange', isConnected);
  };

  onBlockHeight = (blockHeight) => {
    this.blockHeight = blockHeight;
    this.emit('blockHeight', blockHeight);
  };

  checkAndGenerateNewReceiveAddresses = (txs) => {
    if (isAddressUsed(this.getReceiveAddress(), txs)) {
      this.nextReceiveAddress();
      this.blockchain.setAddresses(this.account.getAllAddresses());
      this.checkAndGenerateNewReceiveAddresses(txs);
    }
  };

  checkAndGenerateNewChangeAddresses = (txs) => {
    if (isAddressUsed(this.getChangeAddress(), txs)) {
      this.nextChangeAddress();
      this.blockchain.setAddresses(this.account.getAllAddresses());
      this.checkAndGenerateNewChangeAddresses(txs);
    }
  };

  onTxChange = () => {
    this.txQueueArr = cleanQueuedTxs(this.txQueueArr, this.blockchain.transactions, this.network);
    let txs = this.txQueueArr.map(e => e.tx).concat(this.blockchain.transactions);
    txs = txs.filter(e => !e.orphaned);

    this.checkAndGenerateNewReceiveAddresses(txs);
    this.checkAndGenerateNewChangeAddresses(txs);

    fillTxBalanceChange(txs, this.account.getAllAddresses());

    this.unspent = getUnspent(txs, this.account.getAllAddresses());
    this.balance = Number(this.unspent.reduce((a, c) => a.plus(c.value), Big(0)));

    this.setTransactions(txs);

    this.emit('transactions');
    this.emit('balance');

    this.saveAll();
  };

  discover = (chain, derivedCallback, usedCallback) => {
    const checkForUsedAddresses = (addresses, callback, reject) => {
      const timeoutTimer = setTimeout(() => {
        reject(
          'Discovering addresses took to long. Make sure you are connected to the internet...',
        );
      }, 30 * 1000);

      return this.blockchain
        .getUsedAddresses(addresses)
        .then((usedAddresses) => {
          clearTimeout(timeoutTimer);

          usedCallback(usedAddresses).then(() => callback(undefined, usedAddresses));

          return usedAddresses;
        })
        .catch((err) => {
          clearTimeout(timeoutTimer);
          reject(
            'Error while fetching used addresses. Make sure you are connected to the internet...',
          );
        });
    };

    const discoverChain = i => new Promise((resolve, reject) => this.account.discoverChain(
      i,
      5,
      (addresses, callback) => {
        derivedCallback(addresses).then(() => checkForUsedAddresses(addresses, callback, reject));
      },
      resolve,
    ));

    return discoverChain(chain);
  };

  fetchUnspent = addresses => this.blockchain.fetchUnspent(addresses);

  getAccountAddressType = () => {
    const accountDerivation = this.account.getChains()[0].getDerivationPath();
    const accountAddressType = getTypeFromDerivation(accountDerivation);

    return accountAddressType;
  };

  estimateSize = (requiredSat, batchedTransactions) => {
    const balanceSat = Big(this.balance).times(1e8);
    let alwaysAddChange = false;

    if (Number(requiredSat) > Number(balanceSat)) {
      requiredSat = balanceSat; // fix to get inputs even if balance is not enough

      // always add change address as it is most likely when user adjusts batched below balance.
      alwaysAddChange = true;
    }

    let inputs = [];

    let reservedSat = 0;
    let inputP2PKHCount = 0;
    let inputP2WPKHCount = 0;
    let inputP2SHP2WPKHCount = 0;
    let outputP2PKHCount = 0;
    let outputP2WPKHCount = 0;

    const accountAddressType = this.getAccountAddressType();

    [inputs, reservedSat] = this.selectInputs(requiredSat, true);

    const addToInputCount = (toAdd, type) => {
      if (type === 'P2PKH') {
        inputP2PKHCount += toAdd;
      }

      if (type === 'P2SH-P2WPKH') {
        inputP2SHP2WPKHCount += toAdd;
      }

      if (type === 'P2WPKH') {
        inputP2WPKHCount += toAdd;
      }
    };

    const addToOutputCount = (toAdd, type) => {
      if (type === 'P2PKH' || type === 'P2SH-P2WPKH') {
        outputP2PKHCount += toAdd;
      }

      if (type === 'P2WPKH') {
        outputP2WPKHCount += toAdd;
      }
    };

    const getAddressType = (address) => {
      try {
        bitcoin.address.fromBase58Check(address);
        return 'P2PKH';
      } catch (err) {}

      try {
        bitcoin.address.fromBech32(address);
        return 'P2WPKH';
      } catch (err) {}
    };

    addToInputCount(inputs.length, accountAddressType);

    const outputs = this.getOutputsArray(
      batchedTransactions,
      requiredSat,
      reservedSat,
      alwaysAddChange,
    );
    for (let i = 0; i < outputs.length; i++) {
      addToOutputCount(1, getAddressType(outputs[i].address));
    }

    const inputsCounts = {
      P2PKH: inputP2PKHCount,
      P2WPKH: inputP2WPKHCount,
      'P2SH-P2WPKH': inputP2SHP2WPKHCount,
    };

    const outputCounts = {
      P2PKH: outputP2PKHCount,
      P2WPKH: outputP2WPKHCount,
    };

    const byteCount = getByteCount(inputsCounts, outputCounts);

    return byteCount;
  };

  selectInputs = (requiredSat, disableChecks) => {
    let reservedSat = Big(0);
    const inputsToSign = [];

    let lockedFunds = Big(0);

    // Select from unspent inputs
    for (let i = 0; i < this.unspent.length; i++) {
      const input = this.unspent[i];

      // Only select from published unspent...
      if (!input.unPublished) {
        inputsToSign.push(input);
        reservedSat = reservedSat.plus(input.valueSat);
        // always select so we have more reserved than required if possible.
        if (Number(reservedSat) > Number(requiredSat)) {
          break;
        }
      } else {
        lockedFunds = lockedFunds.plus(input.valueSat);
      }
    }

    if (!disableChecks) {
      if (Number(reservedSat) < Number(requiredSat)) {
        if (Number(reservedSat.plus(lockedFunds)) >= Number(requiredSat)) {
          throw 'Unspent funds still waiting to be published.';
        }

        throw 'Not enough funds!';
      }
    }

    return [inputsToSign, reservedSat];
  };

  getOutputsArray = (batchedTransactions, requiredSat, reservedSat, alwaysAddChange) => {
    const changeSat = reservedSat.minus(requiredSat);

    if (Number(reservedSat.minus(requiredSat).minus(changeSat)) !== 0) {
      throw 'Error when calculating outputs!';
    }

    const outputs = batchedTransactions.map(b => ({
      address: b.address,
      amountSat: Number(Big(b.amount).times(1e8)),
      isChange: false,
    }));

    if (Number(changeSat) !== 0 || alwaysAddChange) {
      outputs.push({
        address: this.getChangeAddress(),
        amountSat: Number(changeSat),
        isChange: true,
      });
    }

    return outputs;
  };

  // Owner check: [derivationPath]$[first 6 uppercase letters in address]
  // If left out owner check is ignored by coinid
  getOwnerCheck = (address) => {
    const chainAndIndex = this.getChainAndIndex(address);

    if (chainAndIndex === undefined) {
      throw 'Could not get index of ownercheck!';
    }

    return [chainAndIndex, address.substr(0, 6).toUpperCase()].join('+');
  };

  getChainAndIndex = address => this.account
    .getChains()
    .map((e, c) => {
      const pathArray = e.getDerivationPath().split('/');

      const addressIndex = e.find(address);
      if (addressIndex === undefined) {
        return undefined;
      }

      pathArray.push(e.find(address));

      return derivationToQr(pathArray.join('/'));
    })
    .filter(e => e !== undefined)[0];

  buildBumpFeeTransactionData = (tx, newFee) => {
    const feeIncreaseSat = Big(newFee)
      .minus(tx.fees)
      .times(1e8);
    let outputSatToDecrease = feeIncreaseSat;

    const sendTx = new bitcoin.TransactionBuilder(this.network);

    const inputsToSign = tx.vin.map((e, i) => {
      const valueSat = Number(Big(e.value).times(1e8));

      return {
        address: e.addr,
        hash: e.txid,
        index: e.vout,
        sequence: e.sequence,
        valueSat,
      };
    });

    const ownAddresses = this.account.getAllAddresses();

    const outputs = tx.vout.map((e, i, arr) => {
      const orgAmountSat = Number(Big(e.value).times(1e8));
      let amountSat = orgAmountSat;
      const isOwnAddress = ownAddresses.indexOf(e.addr) !== -1;

      if (outputSatToDecrease > 0 && isOwnAddress) {
        amountSat = Number(Big(amountSat).minus(outputSatToDecrease));
        if (amountSat < 0) {
          amountSat = 0;
        }

        outputSatToDecrease = outputSatToDecrease.minus(orgAmountSat).plus(amountSat);
      }

      let isChange = false;
      // figures out if change address
      if (arr.length > 1 && i === arr.length - 1) {
        if (isOwnAddress) {
          isChange = true;
        }
      }

      return {
        address: e.addr,
        amountSat,
        isChange,
      };
    });

    const accountDerivation = this.account.getChains()[0].getDerivationPath();
    const addInputFn = getAddInputFunctionFromDerivation(accountDerivation);

    for (var i = 0; i < inputsToSign.length; i++) {
      const input = inputsToSign[i];
      const sequence = input.sequence + 1;

      addInputFn(sendTx, input, sequence, this.account);
    }

    const changeOutputIndexArr = [];
    for (var i = 0; i < outputs.length; i++) {
      const o = outputs[i];
      sendTx.addOutput(o.address, o.amountSat);

      if (o.isChange) {
        changeOutputIndexArr.push(i);
      }
    }

    const chainIndexArr = inputsToSign.map(input => this.getChainAndIndex(input.address));
    const inputValueArr = inputsToSign.map(input => input.valueSat);

    const coinDataArr = [
      `TX/${this.ticker}`,
      this.getOwnerCheck(inputsToSign[0].address),
      chainIndexArr,
      sendTx.buildIncomplete().toHex(),
      changeOutputIndexArr,
      inputValueArr,
    ];

    return dataToString(coinDataArr);
  };

  buildTransactionData = (batchedTransactions, fee, isRBFEnabled) => {
    const sendTx = new bitcoin.TransactionBuilder(this.network);

    const amountSat = batchedTransactions.reduce((a, c) => a.plus(c.amount), Big(0)).times(1e8);
    const feeSat = Big(fee).times(1e8);
    const requiredSat = amountSat.plus(feeSat);
    const [inputsToSign, reservedSat] = this.selectInputs(requiredSat);

    const accountDerivation = this.account.getChains()[0].getDerivationPath();
    const addInputFn = getAddInputFunctionFromDerivation(accountDerivation);

    for (let i = 0; i < inputsToSign.length; i++) {
      const input = inputsToSign[i];
      const sequence = isRBFEnabled ? 0 : 0xffffffff;

      addInputFn(sendTx, input, sequence, this.account.derive(input.address));
    }

    const changeOutputIndexArr = [];
    const outputs = this.getOutputsArray(batchedTransactions, requiredSat, reservedSat, false);
    for (let i = 0; i < outputs.length; i++) {
      const o = outputs[i];
      sendTx.addOutput(o.address, o.amountSat);

      if (o.isChange) {
        changeOutputIndexArr.push(i);
      }
    }

    const chainIndexArr = inputsToSign.map(input => this.getChainAndIndex(input.address));
    const inputValueArr = inputsToSign.map(input => input.valueSat);

    const coinDataArr = [
      `TX/${this.ticker}`,
      this.getOwnerCheck(inputsToSign[0].address),
      chainIndexArr,
      sendTx.buildIncomplete().toHex(),
      changeOutputIndexArr,
      inputValueArr,
    ];

    return dataToString(coinDataArr);
  };

  buildValCoinIdData = address => [`VAL/${this.ticker}`, this.getOwnerCheck(address), this.getChainAndIndex(address)].join(':');

  buildSwpCoinIdData = address => [`SWP/${this.ticker}`, this.getOwnerCheck(address), this.getChainAndIndex(address)].join(':');

  buildSwpTxCoinIdData = (outputAddress, formattedInputArr, feeSat) => {
    const inputData = formattedInputArr
      .map(({
        type, address, hash, index, valueSat,
      }) => [type, address, hash, index, valueSat].join('*'))
      .join('+');

    const total = formattedInputArr.reduce((a, c) => a.plus(c.valueSat), Big(0));
    const totalOutput = Number(total.minus(feeSat));

    const outputData = [outputAddress, this.getChainAndIndex(outputAddress), totalOutput].join('+');

    return [`SWPTX/${this.ticker}`, this.getOwnerCheck(outputAddress), outputData, inputData].join(
      ':',
    );
  };

  buildPubCoinIdData = derivationPathsArr => [
    `PUB/${this.ticker}`,
    '', // empty owner check normally for pubkey.. unless we extend wallet...
    derivationArrToQr(derivationPathsArr),
  ].join(':');

  buildMsgCoinIdData = (address, message) => [
    `MSG/${this.ticker}`,
    this.getOwnerCheck(address),
    this.getChainAndIndex(address),
    encodeURIComponent(message),
  ].join(':');

  build2FACoinIdData = (address, message) => [
    `2FA/${this.ticker}`,
    this.getOwnerCheck(address),
    this.getChainAndIndex(address),
    encodeURIComponent(message),
  ].join(':');

  buildSimpleAuthCoinIdData = (address, message) => [
    `SAH/${this.ticker}`,
    this.getOwnerCheck(address),
    this.getChainAndIndex(address),
    encodeURIComponent(message),
  ].join(':');

  queueTx = (txHex, unsignedHex, replacingTxid, inputInfo) => new Promise((resolve, reject) => {
    if (txHex.length > 100000) {
      return reject(
        `Transaction size exceeds maximum limit of 100000 bytes. Size was ${txHex.length}`,
      );
    }

    const queuedTx = this.txQueueArr.map(e => e.tx);
    const txs = queuedTx.concat(this.blockchain.transactions);

    const queueData = {
      hex: txHex,
      tx: rawHexToObject(txHex, txs, this.network, inputInfo),
    };

    if (replacingTxid) {
      queueData.tx.replacingTxid = replacingTxid;
    }

    if (unsignedHex !== undefined) {
      const unsignedTx = rawHexToObject(unsignedHex, txs, this.network);

      if (queueData.tx.uniqueHash !== unsignedTx.uniqueHash) {
        return reject('Transaction check mismatch.');
      }
    }

    this.txQueueArr.unshift(queueData);
    this.onTxChange();
    return resolve(queueData);
  });

  publishTx = rawTx => this.blockchain.publishTx(rawTx);

  getTx = txId => this.blockchain.getTx(txId, this.account.getAllAddresses());

  nextReceiveAddress = () => this.account.nextChainAddress(0);

  getReceiveAddress = () => this.account.getChainAddress(0);

  nextChangeAddress = () => this.account.nextChainAddress(1);

  getChangeAddress = () => this.account.getChainAddress(1);

  getAllAddresses = () => this.account.getAllAddresses();

  getDerivationPath = (addressType, qrFriendly) => {
    const purpose = `${getAddressTypeInfo(addressType).bip44Derivation}'`;

    const coin_type = `${this.network.bip44Derivation}'`;

    const account = "0'";

    const derivationBuildArr = [purpose, coin_type, account];

    let derivationPath = derivationBuildArr.join('/');

    if (qrFriendly) {
      derivationPath = derivationPath.replace(/\//g, '*').replace(/\'/g, '-');
    }

    return derivationPath;
  };

  setTransactions = (newTransactions) => {
    if (newTransactions !== this.transactions) {
      this.transactions = newTransactions;
    }

    return newTransactions;
  };

  /* Account */
  getAccount = () => new Promise((resolve, reject) => {
    if (this.account !== undefined) {
      return resolve(this.account);
    }

    return this.storage.get('account').then((storedAccount) => {
      if (!storedAccount) {
        return reject('no account');
      }

      // From coinidjson tar addressfunction som tredje argument..
      this.account = bip32utils.Account.fromCoinIdJSON(storedAccount, this.network);
      return resolve(this.account);
    });
  });

  loadTxQueueArr = () => new Promise((resolve, reject) => this.storage.get('txQueueArr').then((txQueueArr) => {
    if (!txQueueArr) {
      return resolve([]);
    }

    return resolve(txQueueArr);
  }));

  loadBalance = () => new Promise((resolve, reject) => this.storage.get('balance').then((balance) => {
    if (!balance) {
      return resolve(0);
    }

    return resolve(balance);
  }));

  loadPubKeyData = () => new Promise((resolve, reject) => this.storage.get('pubKeyData').then((pubKeyData) => {
    if (!pubKeyData) {
      return resolve('');
    }

    return resolve(pubKeyData);
  }));

  loadBlockHeight = () => new Promise((resolve, reject) => this.storage.get('blockHeight').then((blockHeight) => {
    if (!blockHeight) {
      return resolve(0);
    }

    return resolve(blockHeight);
  }));

  setAccount = newAccount => (this.account = newAccount);

  validateAddress = (address) => {
    try {
      bitcoin.address.toOutputScript(address, this.network);
      return true;
    } catch (err) {
      return false;
    }
  };

  verifyMessage = (message, address, signature) => {
    try {
      const verify = bitcoinMessage.verify(message, address, signature, this.network);

      if (!verify) {
        throw 'Message could not be verified with the supplied signature and address';
      }

      return true;
    } catch (err) {
      throw err;
    }
  };

  saveAll = () => Promise.all([
    this.storage.set('account', this.account),
    this.storage.set('pubKeyData', this.pubKeyData),
    this.storage.set('txQueueArr', this.txQueueArr),
    this.storage.set('balance', this.balance),
    this.storage.set('transactions', this.transactions),
    this.storage.set('blockHeight', this.blockHeight),
  ]);
}

/**
 * Module exports...
 */
module.exports = function (coin, storage, key) {
  return new COINiDPublic(coin, storage, key);
};
