const bip21 = require('bip21');

export const decodeQrRequest = (qrResult, { qrScheme, bech32 }) => {
  try {
    // try first with bip21
    const decoded = bip21.decode(qrResult, qrScheme);
    const { address, options: { amount = '', message = '' } } = decoded;

    return { address, amount: `${amount}`, note: `${message}` };
  } catch (err) {
    // fallback to only match address in qr
    let addressMatch;

    if (bech32) {
      addressMatch = qrResult.match(new RegExp(`^(${bech32}[0-9a-z]{10,88})(\\s|$)`));

      if (!addressMatch) {
        addressMatch = qrResult.match(new RegExp(`^(${bech32.toUpperCase()}[0-9A-Z]{10,88})(\\s|$)`));
      }
    }

    if (!addressMatch) {
      addressMatch = qrResult.match(new RegExp('^([1-9A-HJ-NP-Za-km-z]{26,36})(\\s|$)'));
    }

    if (!addressMatch || !addressMatch[1]) {
      return { address: '' };
    }

    const address = addressMatch[1];
    return { address };
  }
};
