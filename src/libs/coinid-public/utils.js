export const getByteCount = (inputs, outputs, uncompressed) => {
  let totalWeight = 0;
  let hasWitness = false;

  const types = {
    inputs: {
      'MULTISIG-P2SH': 49 * 4,
      'MULTISIG-P2WSH': 6 + 41 * 4,
      'MULTISIG-P2SH-P2WSH': 6 + 76 * 4,
      P2PKH: uncompressed ? 181 * 4 : 148 * 4, // normal
      P2WPKH: 108 + 41 * 4, // segwit (bech32)
      'P2SH-P2WPKH': 108 + 64 * 4, // segwit
    },
    outputs: {
      'P2SH-P2WPKH': 34 * 4,
      P2SH: 32 * 4,
      P2PKH: 34 * 4, // normal
      P2WPKH: 31 * 4, // segwit
      P2WSH: 43 * 4,
    },
  };

  Object.keys(inputs).forEach((key) => {
    if (key.slice(0, 8) === 'MULTISIG') {
      // ex. "MULTISIG-P2SH:2-3" would mean 2 of 3 P2SH MULTISIG
      const keyParts = key.split(':');
      if (keyParts.length !== 2) throw new Error(`invalid input: ${key}`);
      const newKey = keyParts[0];
      const mAndN = keyParts[1].split('-').map(item => parseInt(item, 10));

      totalWeight += types.inputs[newKey] * inputs[key];
      const multiplyer = newKey === 'MULTISIG-P2SH' ? 4 : 1;
      totalWeight += (73 * mAndN[0] + 34 * mAndN[1]) * multiplyer * inputs[key];
    } else {
      totalWeight += types.inputs[key] * inputs[key];
    }
    if (key.indexOf('W') >= 0) hasWitness = true;
  });

  Object.keys(outputs).forEach((key) => {
    totalWeight += types.outputs[key] * outputs[key];
  });

  if (hasWitness) totalWeight += 2;

  totalWeight += 10 * 4;

  return Math.ceil(totalWeight / 4);
};

export const dataToString = dataArr => dataArr
  .map(v => (Array.isArray(v) ? v.join('+') : v))
  .join(':')
  .toUpperCase();

export const derivationToQr = path => path
  .replace('m/', '')
  .split('/')
  .map(v => v.replace("'", '-'))
  .join('*');

export const derivationArrToQr = pathArr => pathArr.map(derivationToQr).join('+');
