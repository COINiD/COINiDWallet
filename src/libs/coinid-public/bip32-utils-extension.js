const bip32utils     = require('bip32-utils');
const bitcoin      = require('bitcoinjs-lib');
import { getAddressFunctionFromDerivation } from 'coinid-address-types'

bip32utils.Chain.prototype.getDerivationPath = function() {
  return this.derivationPath || undefined;
}

bip32utils.Chain.prototype.setDerivationPath = function(derivationPath) {
  this.derivationPath = derivationPath;
}

bip32utils.Chain.prototype.toJSON = function() {
  return {
    k: this.k,
    map: this.map,
    node: this.getParent().toBase58(),
    derivationPath: this.derivationPath
  }
}

bip32utils.Chain.prototype.clone = function () {
  var chain = new bip32utils.Chain(this.__parent, this.k, this.addressFunction)
  
  chain.derivationPath = this.derivationPath;
  chain.addresses = this.addresses.concat()
  for (var s in this.map) chain.map[s] = this.map[s]
    
  return chain
}

bip32utils.createChains = function (derivationPath, pubKey, network) {
  const hdNode = bitcoin.HDNode.fromBase58(pubKey, network);

  return [
    bip32utils.createChain(hdNode.derive(0).neutered(), derivationPath+'/0'),
    bip32utils.createChain(hdNode.derive(1).neutered(), derivationPath+'/1')
  ]
}

bip32utils.createChain = function(node, derivationPath, k, addressFunction) {
  addressFunction = addressFunction ? addressFunction : getAddressFunctionFromDerivation(derivationPath);
  
  const chain = new bip32utils.Chain(node, k, addressFunction);
  chain.setDerivationPath(derivationPath);

  return chain;
}

bip32utils.Account.prototype.toJSON = function () {
  return this.chains.map((chain) => chain.toJSON());
}

bip32utils.Account.fromCoinIdJSON = function (json, network, addressFunction) {
  var chains = json.map(function (j) {
    var node = bitcoin.HDNode.fromBase58(j.node, network),
        chain = bip32utils.createChain(node, j.derivationPath, j.k, addressFunction);
    
    chain.map = j.map

    // derive from k map
    chain.addresses = Object.keys(chain.map).sort(function (a, b) {
      return chain.map[a] - chain.map[b]
    })

    return chain
  })

  return new bip32utils.Account(chains)
}

module.exports = bip32utils;
