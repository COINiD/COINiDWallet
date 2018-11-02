// Usage:
// getByteCount({'MULTISIG-P2SH:2-4':45},{'P2PKH':1}) Means "45 inputs of P2SH Multisig and 1 output of P2PKH"
// getByteCount({'P2PKH':1,'MULTISIG-P2SH:2-3':2},{'P2PKH':2}) means "1 P2PKH input and 2 Multisig P2SH (2 of 3) inputs along with 2 P2PKH outputs"
export const getByteCount = (inputs, outputs) => {
    var totalWeight = 0
    var hasWitness = false
    // assumes compressed pubkeys in all cases.
    var types = {
        'inputs': {
            'MULTISIG-P2SH': 49 * 4,
            'MULTISIG-P2WSH': 6 + (41 * 4),
            'MULTISIG-P2SH-P2WSH': 6 + (76 * 4),
            'P2PKH': 148 * 4, // normal
            'P2WPKH': 108 + (41 * 4),  // segwit (bech32)
            'P2SH-P2WPKH': 108 + (64 * 4) // segwit
        },
        'outputs': {
            'P2SH': 32 * 4,
            'P2PKH': 34 * 4, // normal
            'P2WPKH': 31 * 4, // segwit
            'P2WSH': 43 * 4
        }
    }

    Object.keys(inputs).forEach(function(key) {
        if (key.slice(0,8) === 'MULTISIG') {
            // ex. "MULTISIG-P2SH:2-3" would mean 2 of 3 P2SH MULTISIG
            var keyParts = key.split(':')
            if (keyParts.length !== 2) throw new Error('invalid input: ' + key)
            var newKey = keyParts[0]
            var mAndN = keyParts[1].split('-').map(function (item) { return parseInt(item) })

            totalWeight += types.inputs[newKey] * inputs[key]
            var multiplyer = (newKey === 'MULTISIG-P2SH') ? 4 : 1
            totalWeight += ((73 * mAndN[0]) + (34 * mAndN[1])) * multiplyer * inputs[key]
        } else {
            totalWeight += types.inputs[key] * inputs[key]
        }
        if (key.indexOf('W') >= 0) hasWitness = true
    })

    Object.keys(outputs).forEach(function(key) {
        totalWeight += types.outputs[key] * outputs[key]
    })

    if (hasWitness) totalWeight += 2

    totalWeight += 10 * 4

    return Math.ceil(totalWeight / 4)
}

export const dataToString = function(dataArr) {
  return dataArr.map(v => Array.isArray(v) ? v.join('+') : v).join(':').toUpperCase();
}

export const derivationToQr = (path) => {
  return path
  .replace('m/','')
  .split('/')
  .map(v => v.replace("'", '-'))
  .join('*');
}

export const derivationArrToQr = (pathArr) => (pathArr.map(derivationToQr)).join('+');
