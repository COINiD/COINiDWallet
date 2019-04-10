import COINiDPublic from '../src/libs/coinid-public';
import storageHelper from '../src/utils/storageHelper';

const coinArray = ['testnet', 'myriad', 'bitcoin', 'groestlcoin', 'groestlcoin-testnet'];

coinArray.forEach(coin => {
  describe(coin, () => {
    const {
      pubKeyData,
      unspent,
      balance,
      correctPayments,
      insufficientPayments,
      wrongAddressPayments,
      messageSignature,
      messageAddress,
      message,
      anotherMessage,
    } = require(`./data/${coin}.json`);

    var i = 0;
    const createCOINiD = (pubkey) => {
      i += 1;

      const c = COINiDPublic(
        coin,
        storageHelper(`${coin}-hot-${i}`),
        `${coin}-hot-${i}`,
      );

      c.createWallet(c.createPubKeyArrayFromDataString(pubkey));

      for (var i = 0; i < 5; i+=1) {
        c.nextReceiveAddress();
        c.nextChangeAddress();
      }

      c.unspent = unspent;
      c.balance = balance;

      return c;
    }

    const coinid = {
      P2SHP2WPKH: createCOINiD(pubKeyData.P2SHP2WPKH),
      P2PKH: createCOINiD(pubKeyData.P2PKH),
      P2WPKH: createCOINiD(pubKeyData.P2WPKH)
    }

    describe('COINiDPublic', () => {
      it('can create transaction data', () => {
        const payments = correctPayments;
        const isRBFEnabled = true;
        const fee = 0.00000204;
        const transactionData = coinid.P2SHP2WPKH.buildTransactionData(payments, fee, isRBFEnabled);

        expect(transactionData).toMatchSnapshot();
      });

      it('throws error when having insufficient funds', () => {
        const payments = insufficientPayments;
        const isRBFEnabled = true;
        const fee = 0.00000204;

        expect(() => {
          coinid.P2SHP2WPKH.buildTransactionData(payments, fee, isRBFEnabled);
        }).toThrowErrorMatchingSnapshot();
      });

      it('throws error when address not valid', () => {
        const payments = wrongAddressPayments;
        const isRBFEnabled = true;
        const fee = 0.00000204;

        expect(() => {
          coinid.P2SHP2WPKH.buildTransactionData(payments, fee, isRBFEnabled);
        }).toThrowErrorMatchingSnapshot();
      });

      it('generates a correct P2SHP2WPKH addresses', () => {
        expect(coinid.P2SHP2WPKH.getAllAddresses()).toMatchSnapshot();
      });

      it('generates a correct P2PKH addresses', () => {
        expect(coinid.P2PKH.getAllAddresses()).toMatchSnapshot();
      });

      it('generates a correct P2WPKH addresses', () => {
        expect(coinid.P2WPKH.getAllAddresses()).toMatchSnapshot();
      });

      it('can create message signing data', () => {
        const address = coinid.P2SHP2WPKH.getReceiveAddress();
        const message = 'This is a test message';
        const messageData = coinid.P2SHP2WPKH.buildMsgCoinIdData(address, message);

        expect(messageData).toMatchSnapshot();
      });

      it('fails to generate message with invalid address', () => {
        const address = coinid.P2PKH.getReceiveAddress();
        const message = 'This is a test message that will fail';

        expect(() => {
          coinid.P2SHP2WPKH.buildMsgCoinIdData(address, message);
        }).toThrowErrorMatchingSnapshot();
      });

      it('can verify message', () => {
        const verify = coinid.P2PKH.verifyMessage(message, messageAddress, messageSignature);
        expect(verify).toEqual(true);
      });

      it('fails to verify invalid signature', () => {
        expect(() => {
          coinid.P2PKH.verifyMessage(anotherMessage, messageAddress, messageSignature);
        }).toThrowErrorMatchingSnapshot();
      });

    });
  });

});
