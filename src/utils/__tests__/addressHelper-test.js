import { decodeQrRequest } from '../addressHelper';

describe('decodeQrRequest', () => {
  const qrScheme = 'bitcoin';
  const bech32 = 'tb';

  it('should decode bip21 qr request', () => {
    const qrResult = 'bitcoin:mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D?amount=10&message=Hello';
    const decoded = decodeQrRequest(qrResult, { qrScheme, bech32 });

    expect(decoded).toEqual({
      address: 'mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D',
      amount: '10',
      note: 'Hello',
    });
  });

  it('should detect legacy address in qr', () => {
    const qrResult = 'mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D';
    const decoded = decodeQrRequest(qrResult, { qrScheme, bech32 });

    expect(decoded).toEqual({
      address: 'mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D',
    });
  });

  it('should detect legacy address in qr with junk after', () => {
    const qrResult = 'mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D JUNK';
    const decoded = decodeQrRequest(qrResult, { qrScheme, bech32 });

    expect(decoded).toEqual({
      address: 'mhNR7zLchYfX5GtFZ1opW8FeAG63wVjP9D',
    });
  });

  it('should detect bech32 address in qr', () => {
    const qrResult = 'tb1q97jxsq2rzvsz47a83xj84ggs3nuursqvy9p40r';
    const decoded = decodeQrRequest(qrResult, { qrScheme, bech32 });

    expect(decoded).toEqual({
      address: 'tb1q97jxsq2rzvsz47a83xj84ggs3nuursqvy9p40r',
    });
  });

  it('should detect bech32 address in qr with junk after', () => {
    const qrResult = 'tb1q97jxsq2rzvsz47a83xj84ggs3nuursqvy9p40r JUNK';
    const decoded = decodeQrRequest(qrResult, { qrScheme, bech32 });

    expect(decoded).toEqual({
      address: 'tb1q97jxsq2rzvsz47a83xj84ggs3nuursqvy9p40r',
    });
  });
});
