import Big from 'big.js';

const bitcoin = require('bitcoinjs-lib');
const md5 = require('md5');
const bufferReverse = require('buffer-reverse');

export const isAddressUsed = function (address, txs) {
  for (var i = 0; i < txs.length; i++) {
    for (var x = 0; x < txs[i].vout.length; x++) {
      if (txs[i].vout[x].addr === address) {
        return true;
      }
    }
  }
  for (var i = 0; i < txs.length; i++) {
    for (var x = 0; x < txs[i].vin.length; x++) {
      if (txs[i].vin[x].addr === address) {
        return true;
      }
    }
  }
  return false;
};

const uniqueHashByTxid = {};
export const getTxUniqueHash = (tx) => {
  if (tx.uniqueHash !== undefined) {
    return tx.uniqueHash;
  }

  if (uniqueHashByTxid[tx.txid] !== undefined) {
    tx.uniqueHash = uniqueHashByTxid[tx.txid];
    return tx.uniqueHash;
  }

  tx.uniqueHash = md5(
    JSON.stringify([
      tx.vin.map(input => [input.txid, input.vout]),
      tx.vout.map(output => [output.addr, Number(Big(output.value).times(1e8))]),
    ]),
  );

  uniqueHashByTxid[tx.txid] = tx.uniqueHash;
  return tx.uniqueHash;
};

export const findTx = (tx, txs) => {
  const uniqueHash = getTxUniqueHash(tx);

  for (let i = 0; i < txs.length; i++) {
    if (getTxUniqueHash(txs[i]) === uniqueHash) {
      // unique hash should be built when adding tx to history...
      return txs[i];
    }
  }
  return false;
};

export const removeDoubleSpendTxs = (txs) => {
  const usedInputs = txs.reduce(
    (a, c) => a.concat(c.vin.map(e => ({ txid: c.txid, inputTxid: `${e.txid}_${e.vout}` }))),
    [],
  );
  const usedInputsMap = new Map(usedInputs.map(({ txid, inputTxid }) => [inputTxid, txid]));

  return txs
    .reverse()
    .filter(tx => !isTxDoubleSpend(tx, txs, usedInputsMap))
    .reverse();
};

export const isTxDoubleSpend = (tx, txs, usedInputsMap) => {
  if (tx.confirmations < 6) {
    return false;
  }

  for (let i = 0; i < tx.vin.length; i++) {
    const inputTxid = `${tx.vin[i].txid}_${tx.vin[i].vout}`;

    if (usedInputsMap.has(inputTxid)) {
      const otherTxid = usedInputsMap.get(inputTxid);

      if (otherTxid !== tx.txid) {
        return true;
      }
    }
  }
  return false;
};

export const invalidInput = (qtx, txs) => {
  // filter out unconfirmed..
  // txs = txs.filter(e => e.blockHeight);

  const txMap = new Map(txs.map(tx => [tx.txid, tx]));

  const usedInputs = txs.reduce(
    (a, c) => a.concat(c.vin.map(e => ({ parentTxid: c.txid, inputIdentifier: `${e.txid}_${e.vout}` }))),
    [],
  );
  const usedInputsMap = new Map(
    usedInputs.map(({ parentTxid, inputIdentifier }) => [inputIdentifier, parentTxid]),
  );

  for (let i = 0; i < qtx.vin.length; i += 1) {
    const { txid: qTxid, isUsingExternalInputs } = qtx.vin[i];

    // check if qtx input txid is in tx list if it is not return true (invalid)
    // skip check if using external inputs, for example when transfering from a sweeped private key.
    if (!isUsingExternalInputs && !txMap.has(qTxid)) {
      return true;
    }

    // check if qtx input txid is used in another tx input
    const parentTxid = usedInputsMap.get(`${qTxid}_${qtx.vin[i].vout}`);
    if (parentTxid) {
      const parentTx = txMap.get(parentTxid);

      if (qtx.vin[0].sequence <= parentTx.vin[0].sequence) {
        return true;
      }
    }
  }
  return false;
};

// remove any queuedtxs that exist in txs
export const cleanQueuedTxs = (queuedTxs, txs) => {
  if (!queuedTxs.length) {
    return [];
  }

  // Remove queued txs that now exists in regular chain...
  // Remove queued txs with invalid inputs...
  return queuedTxs.filter(qtx => !findTx(qtx.tx, txs)).filter(qtx => !invalidInput(qtx.tx, txs));
};

export const rawHexToObject = (txHex, history, network, inputInfo) => {
  const tx = bitcoin.Transaction.fromHex(txHex);
  const historyMap = new Map(history.map(historyTx => [historyTx.txid, historyTx]));
  let valueIn = Big(0);

  const vins = tx.ins.map((input, n) => {
    const txHash = bufferReverse(new Buffer(input.hash, 'hex'));

    const txid = txHash.toString('hex');
    const { index: vout, sequence } = input;

    const getAddrAndValueObj = () => {
      if (inputInfo) {
        return {
          addr: inputInfo[n].address,
          value: Number(Big(inputInfo[n].valueSat).div(1e8)),
          isUsingExternalInputs: true,
        };
      }

      const inputTx = historyMap.get(txid);
      const spentVout = inputTx.vout[vout];

      return {
        addr: spentVout.addr,
        value: Number(Big(spentVout.value)),
        isUsingExternalInputs: false,
      };
    };

    const addrAndValueObj = getAddrAndValueObj();
    valueIn = valueIn.plus(addrAndValueObj.value);

    return {
      n,
      txid,
      vout,
      sequence,
      ...addrAndValueObj,
    };
  });

  let valueOut = Big(0);

  const vouts = tx.outs.map((output, n) => {
    const value = Big(output.value).div(1e8);
    valueOut = valueOut.plus(value);

    return {
      n,
      addr: bitcoin.address.fromOutputScript(output.script, network),
      value: Number(value),
    };
  });

  const fees = valueIn.minus(valueOut);

  const cleanTx = {
    unPublished: 1,
    blockHeight: 0,
    blockhash: '',
    confirmations: 0,
    fees: Number(fees),
    size: txHex.length / 2,
    time: Date.now() / 1000,
    txid: tx.getId(),
    vin: vins,
    vout: vouts,
  };

  cleanTx.uniqueHash = getTxUniqueHash(cleanTx);
  return cleanTx;
};

export const getUnspent = function (txs, addresses) {
  const addressObj = {};
  fillOwnAddresses(addressObj, addresses);

  // filter out unconfirmed..
  // txs = txs.filter(e => e.blockHeight);

  // filter out replacements..
  txs = txs.filter(e => e.replacingTxid === undefined);

  const vins = txs
    .map(tx => tx.vin)
    .reduce((a, c) => a.concat(c), [])
    .filter(e => addressObj[e.addr]);
  const vinMap = new Map(vins.map(vin => [`${vin.txid}:${vin.vout}`, vin]));

  const vouts = txs
    .map(tx => tx.vout.map(vout => [tx, vout, vout.addr]))
    .reduce((a, c) => a.concat(c), []);
  const unspentInputs = vouts.filter(
    ([tx, vout, address]) => addressObj[address] && !vinMap.has(`${tx.txid}:${vout.n}`),
  );

  const unspent = unspentInputs.map(([tx, vout, address]) => ({
    unPublished: tx.unPublished ? 1 : 0,
    hash: tx.txid,
    index: vout.n,
    address,
    value: Number(Big(vout.value)),
    valueSat: Number(Big(vout.value).times(1e8)),
  }));

  unspent.reverse(); // order unspent so oldest is first...

  return unspent;
};

const emptySummary = () => ({
  confirmedSent: Big(0),
  confirmedReceived: Big(0),
  confirmedBalance: Big(0),
  unconfirmedSent: Big(0),
  unconfirmedReceived: Big(0),
  unconfirmedBalance: Big(0),
  availableBalance: Big(0),
});

var fillOwnAddresses = function (ownAddresses, addresses) {
  for (let i = 0; i < addresses.length; i++) {
    ownAddresses[addresses[i]] = emptySummary();
  }
};

export const getMaxFeeIncrease = (tx, unspent) => {
  // if confirmed fee cannot be changed
  if (tx.confirmations !== 0) {
    return 0;
  }

  const foundUnspent = unspent.filter(e => e.hash === tx.txid);
  if (foundUnspent.length === 0) {
    return 0;
  }

  const rbfInputs = tx.vin.filter(e => e.sequence < 0xffffffff);
  // if not all inputs rbf enabled fee cannot be changed
  if (rbfInputs.length !== tx.vin.length) {
    return 0;
  }

  // sum own address value in outputs
  const ownOutputReducer = (acc, cur) => {
    if (tx.summaryOwn[cur.addr] === undefined) {
      return acc;
    }
    return acc.plus(cur.value);
  };

  const maxFeeIncrease = tx.vout.reduce(ownOutputReducer, Big(0));
  const maxFee = maxFeeIncrease.plus(tx.fees);
  const maxSatPerByte = 1000;
  const maxFeeLimit = Big(tx.size * maxSatPerByte).div(1e8);

  if (maxFee > maxFeeLimit) {
    return Number(maxFeeLimit.minus(tx.fees));
  }

  return Number(maxFeeIncrease);
};

export const getTransactionSummary = (txs, addresses) => {
  const ownAddresses = {};
  const otherAddresses = {};

  const addToSummary = function (type, value, address, confirmations) {
    let addressesObj = ownAddresses;
    if (addresses.indexOf(address) === -1) {
      addressesObj = otherAddresses;
    }

    if (addressesObj[address] === undefined) {
      addressesObj[address] = emptySummary();
    }

    const key = confirmations ? `confirmed${type}` : `unconfirmed${type}`;
    addressesObj[address][key] = addressesObj[address][key].plus(value);
  };

  const addVoutToSummary = function (vout, confirmations) {
    for (let x = 0; x < vout.length; x++) {
      const value = Big(vout[x].value);
      const address = vout[x].addr;
      addToSummary('Received', value, address, confirmations);
    }
  };

  const addVinToSummary = function (vin, confirmations) {
    for (let x = 0; x < vin.length; x++) {
      const value = Big(vin[x].value);
      const address = vin[x].addr;
      addToSummary('Sent', value, address, confirmations);
    }
  };

  const addVoutVinToSummary = function (txs) {
    for (let i = 0; i < txs.length; i++) {
      addVoutToSummary(txs[i].vout, txs[i].confirmations);
      addVinToSummary(txs[i].vin, txs[i].confirmations);
    }
  };

  const sumBalances = function (addressObj) {
    for (const addr in addressObj) {
      const a = addressObj[addr];
      a.confirmedBalance = a.confirmedReceived.minus(a.confirmedSent);
      a.unconfirmedBalance = a.unconfirmedReceived.minus(a.unconfirmedSent);
      a.availableBalance = a.confirmedBalance.plus(a.unconfirmedBalance);
    }
  };

  const sumAll = function (addressObj, sumObj) {
    for (const addr in addressObj) {
      const a = addressObj[addr];
      for (const key in a) {
        sumObj[key] = sumObj[key].plus(a[key]);
      }
    }
  };

  // fillOwnAddresses(ownAddresses, addresses);
  addVoutVinToSummary(txs);

  sumBalances(ownAddresses);
  sumBalances(otherAddresses);

  const sumOwn = emptySummary();
  sumAll(ownAddresses, sumOwn);

  return {
    own: ownAddresses,
    other: otherAddresses,
    sumOwn,
  };
};

const summaryCache = {};
export const getSingleTxSummary = (tx, addresses) => getTransactionSummary([tx], addresses);
export const getTxBalanceChange = (tx, addresses) => {
  const summary = getSingleTxSummary(tx, addresses);

  tx.balanceChanged = Number(summary.sumOwn.availableBalance);

  tx.summaryOwn = {};
  for (addr in summary.own) {
    tx.summaryOwn[addr] = Number(summary.own[addr].availableBalance);
  }

  tx.summaryOther = {};
  for (addr in summary.other) {
    tx.summaryOther[addr] = Number(summary.other[addr].availableBalance);
  }

  return tx.balanceChanged;
};

export const fillTxBalanceChange = (txs, addresses) => {
  for (let i = 0; i < txs.length; i++) {
    getTxBalanceChange(txs[i], addresses);
  }
};

export const getConfirmationsFromBlockHeight = (tx, currentBlockHeight) => {
  const { blockHeight } = tx;

  if (!blockHeight) {
    return 0;
  }

  return 1 + Number(currentBlockHeight) - Number(blockHeight);
};
