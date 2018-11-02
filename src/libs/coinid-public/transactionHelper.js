import Big from 'big.js';
const bitcoin = require('bitcoinjs-lib');
var md5 = require('md5');
var bufferReverse = require('buffer-reverse')

export const isAddressUsed = function(address, txs) {
  for (var i = 0; i < txs.length; i++) {
    for (var x = 0; x < txs[i].vout.length; x++) {
      if(txs[i].vout[x].addr === address) {
        return true;
      }
    }
  }
  for (var i = 0; i < txs.length; i++) {
    for (var x = 0; x < txs[i].vin.length; x++) {
      if(txs[i].vin[x].addr === address) {
        return true;
      }
    }
  }
  return false;
}

uniqueHashByTxid = {}
export const getTxUniqueHash = (tx) => {
  if(tx.uniqueHash !== undefined) {
    return tx.uniqueHash;  
  }

  if(uniqueHashByTxid[tx.txid] !== undefined) {
    tx.uniqueHash = uniqueHashByTxid[tx.txid];
    return tx.uniqueHash
  }

  tx.uniqueHash = md5(JSON.stringify([
    tx.vin.map(input => [input.txid, input.vout]),
    tx.vout.map(output => [output.addr, Number(Big(output.value).times(1e8))])
  ]));

  uniqueHashByTxid[tx.txid] = tx.uniqueHash;
  return tx.uniqueHash;
} 

export const findTx = (tx, txs) => {
  var uniqueHash = getTxUniqueHash(tx);

  for (var i = 0; i < txs.length; i++) {
    if(getTxUniqueHash(txs[i]) === uniqueHash) {  // unique hash should be built when adding tx to history...
      return txs[i];
    }
  }
  return false;
}

export const removeDoubleSpendTxs = (txs) => {
  var usedInputs = txs.reduce((a, c) => a.concat(c.vin.map(e => ({ txid: c.txid, inputTxid: e.txid+'_'+e.vout }))), []);
  var usedInputsMap = new Map(usedInputs.map(({txid, inputTxid}) => [inputTxid, txid]));

  return txs.reverse().filter(tx => !isTxDoubleSpend(tx, txs, usedInputsMap)).reverse();
}

export const isTxDoubleSpend = (tx, txs, usedInputsMap) => {
  if(tx.confirmations < 6) {
    return false;
  }

  for (var i = 0; i < tx.vin.length; i++) {
    var inputTxid = tx.vin[i].txid+'_'+tx.vin[i].vout;

    if(usedInputsMap.has(inputTxid)) {
      let otherTxid = usedInputsMap.get(inputTxid);

      if(otherTxid !== tx.txid) {
        return true;
      }
    }
  }
  return false;
}

export const invalidInput = (qtx, txs) => {
  // filter out unconfirmed..
  //txs = txs.filter(e => e.blockHeight);

  var txMap = new Map(txs.map(tx => [tx.txid, tx]));

  var usedInputs = txs.reduce((a, c) => a.concat(c.vin.map(e => ({parentTxid:c.txid, inputIdentifier: e.txid+'_'+e.vout}) )), []);
  usedInputsMap = new Map(usedInputs.map(({parentTxid, inputIdentifier}) => [inputIdentifier, parentTxid]));

  for (var i = 0; i < qtx.vin.length; i++) {
    // Check if qtx input txid is in tx list if it is not return true (invalid)
    var qTxid = qtx.vin[i].txid;
    if(!txMap.has(qTxid)) {
      return true;
    }

    // Check if qtx input txid is used in another tx input
    var parentTxid = usedInputsMap.get(qTxid+'_'+qtx.vin[i].vout);
    if (parentTxid) {
      var parentTx = txMap.get(parentTxid);

      if (qtx.vin[0].sequence <= parentTx.vin[0].sequence) {
        return true;
      }
    }
  }
  return false;
}

// remove any queuedtxs that exist in txs
export const cleanQueuedTxs = (queuedTxs, txs) => {
  if(!queuedTxs.length) {
    return [];
  }

  // Remove queued txs that now exists in regular chain...
  // Remove queued txs with invalid inputs... 
  return queuedTxs
  .filter(qtx => !findTx(qtx.tx, txs))
  .filter(qtx => !invalidInput(qtx.tx, txs));
}

export const rawHexToObject = (txHex, history, network) => {
  var tx = bitcoin.Transaction.fromHex(txHex);
  var historyMap = new Map(history.map(tx => [tx.txid, tx]));
  var valueIn = Big(0);

  var vins = tx.ins.map((input, index) => {
    txHash = bufferReverse(new Buffer(input.hash, 'hex'))

    var txId = txHash.toString('hex');
    var inputTx = historyMap.get(txId);
    var vout = input.index; // spentvout index of input....
    var spentVout = inputTx.vout[vout];
    var address = spentVout.addr;
    var value = Big(spentVout.value);
    var valueSat = value.times(1e8);
    var sequence = input.sequence;

    valueIn = valueIn.plus(value);

    return {
      n: index,
      addr: address,
      txid: txId,
      value: Number(value),
      vout: vout,
      sequence,
    }
  });

  var valueOut = Big(0);

  var vouts = tx.outs.map((output, index) => {
    var value = Big(output.value).div(1e8);
    valueOut = valueOut.plus(value);

    return {
      n: index,
      addr: bitcoin.address.fromOutputScript(output.script, network),
      value: Number(value),
    };
  });

  var fees = valueIn.minus(valueOut);

  var cleanTx = {
    unPublished: 1,
    blockHeight: 0,
    blockhash: '',
    confirmations: 0,
    fees: Number(fees),
    size: txHex.length/2,
    time: Date.now()/1000,
    txid: tx.getId(),
    vin: vins,
    vout: vouts,
  }

  cleanTx.uniqueHash = getTxUniqueHash(cleanTx);
  return cleanTx;
}

export const getUnspent = function(txs, addresses) {
  var addressObj = {};
  fillOwnAddresses(addressObj, addresses);

  // filter out unconfirmed..
  // txs = txs.filter(e => e.blockHeight);

  // filter out replacements..
  txs = txs.filter(e => e.replacingTxid === undefined);

  var vins = txs.map(tx => tx.vin).reduce((a, c) => a.concat(c), []).filter(e => addressObj[e.addr] );
  var vinMap = new Map(vins.map(vin => [vin.txid+':'+vin.vout, vin]));

  var vouts = txs.map(tx => tx.vout.map(vout => [tx, vout, vout.addr])).reduce((a, c) => a.concat(c), []);
  var unspentInputs = vouts.filter(([tx, vout, address]) => addressObj[address] && !vinMap.has(tx.txid+':'+vout.n));

  var unspent = unspentInputs.map(([tx, vout, address]) => ({
    unPublished: tx.unPublished ? 1 : 0,
    hash: tx.txid,
    index: vout.n,
    address: address,
    value: Number(Big(vout.value)),
    valueSat: Number(Big(vout.value).times(1e8)),
  }));

  unspent.reverse(); // order unspent so oldest is first...

  return unspent;
}

var emptySummary = () => ({
  confirmedSent: Big(0),
  confirmedReceived: Big(0),
  confirmedBalance: Big(0),
  unconfirmedSent: Big(0),
  unconfirmedReceived: Big(0),
  unconfirmedBalance: Big(0),
  availableBalance: Big(0),
});

var fillOwnAddresses = function(ownAddresses, addresses) {
  for (var i = 0; i < addresses.length; i++) {
    ownAddresses[addresses[i]] = emptySummary();
  }
};

export const getMaxFeeIncrease = (tx, unspent) => {
  // if confirmed fee cannot be changed
  if(tx.confirmations !== 0) {
    return 0;
  }

  const foundUnspent = unspent.filter(e => e.hash === tx.txid);
  if(foundUnspent.length === 0) {
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
}

export const getTransactionSummary = (txs, addresses) => {
  var ownAddresses = {};
  var otherAddresses = {};

  var addToSummary = function(type, value, address, confirmations) {
    var addressesObj = ownAddresses;
    if(addresses.indexOf(address) === -1) {
      addressesObj = otherAddresses;
    }

    if(addressesObj[address] === undefined) {
      addressesObj[address] = emptySummary();
    }

    var key = confirmations ? 'confirmed'+type : 'unconfirmed'+type;
    addressesObj[address][key] = addressesObj[address][key].plus(value);
  }

  var addVoutToSummary = function(vout, confirmations) {
    for (var x = 0; x < vout.length; x++) {
      var value = Big(vout[x].value);
      var address = vout[x].addr;
      addToSummary('Received', value, address, confirmations);
    }
  }

  var addVinToSummary = function(vin, confirmations) {
    for (var x = 0; x < vin.length; x++) {
      var value = Big(vin[x].value);
      var address = vin[x].addr;
      addToSummary('Sent', value, address, confirmations);
    }
  }

  var addVoutVinToSummary = function(txs) {
    for (var i = 0; i < txs.length; i++) {
      addVoutToSummary(txs[i].vout, txs[i].confirmations);
      addVinToSummary(txs[i].vin, txs[i].confirmations);
    }
  }

  var sumBalances = function(addressObj) {
    for (var addr in addressObj) {
      var a = addressObj[addr];
      a.confirmedBalance = a.confirmedReceived.minus(a.confirmedSent);
      a.unconfirmedBalance = a.unconfirmedReceived.minus(a.unconfirmedSent);
      a.availableBalance = a.confirmedBalance.plus(a.unconfirmedBalance);
    }
  }

  var sumAll = function(addressObj, sumObj) {
    for (var addr in addressObj) {
      var a = addressObj[addr];
      for (var key in a) {
        sumObj[key] = sumObj[key].plus(a[key]);
      }
    }
  }

  //fillOwnAddresses(ownAddresses, addresses);
  addVoutVinToSummary(txs);

  sumBalances(ownAddresses);
  sumBalances(otherAddresses);

  var sumOwn = emptySummary();
  sumAll(ownAddresses, sumOwn);

  return {
    own: ownAddresses,
    other: otherAddresses,
    sumOwn: sumOwn,
  }
}

let summaryCache = {};
export const getSingleTxSummary = (tx, addresses) => {
  /*
  const key = tx.txid;
  if(summaryCache[key] === undefined) {
    summaryCache[key] = getTransactionSummary([tx], addresses);
  }

  return summaryCache[key];
  */

  return getTransactionSummary([tx], addresses);
}

export const getTxBalanceChange = (tx, addresses) => {
  let summary = getSingleTxSummary(tx, addresses);

  tx.balanceChanged = Number(summary.sumOwn.availableBalance);

  tx.summaryOwn = {};
  for(addr in summary.own) {
    tx.summaryOwn[addr] = Number(summary.own[addr].availableBalance);
  }

  tx.summaryOther = {};
  for(addr in summary.other) {
    tx.summaryOther[addr] = Number(summary.other[addr].availableBalance);
  }

  return tx.balanceChanged;
}

export const fillTxBalanceChange = (txs, addresses) => {
  for (var i = 0; i < txs.length; i++) {
    getTxBalanceChange(txs[i], addresses);
  }
}

export const getConfirmationsFromBlockHeight = (tx, currentBlockHeight) => {
  const { blockHeight } = tx;
  
  if(!blockHeight) {
    return 0;
  }

  return 1 + Number(currentBlockHeight) - Number(blockHeight);
}
