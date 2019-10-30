import coinConfig from '../src/config/settings';
const coinData = require(`./data/${coinConfig.coin}`);

const commonTests = (accountKey) => {
  let i = 0;
  async function takeScreenshot(name) {
    i += 1;
    const num = `${i}`.padStart(3, '0');
    await device.takeScreenshot(`${accountKey}-${num}-${name}`);
  }

  const replaceTextAndLeave = async (id, value, skipTyping) => {
    const input = element(by.id(id))
    await input.tap();
    await input.replaceText(value);
    if(!skipTyping) {
      if(device.getPlatform() === 'ios') {
        await input.typeText("d");
        await input.tapBackspaceKey();
      }
    }
    await takeScreenshot(id);

    await input.tapAtPoint({x: 100, y: -30});
  }

  const scrollAndTap = async (button, scroller) => {
    await waitFor(element(button)).toBeVisible().whileElement(scroller).scroll(50, 'down');
    await expect(element(button)).toBeVisible();
    await element(button).tap();
  }

  const removeStatusBox = async () => {
    await waitFor(element(by.id('statusbox'))).toBeVisible().withTimeout(10000);
    await element(by.id('statusbox')).swipe('down');
  }

  it('should install a wallet', async () => {
    await expect(element(by.id('button-setup-'+accountKey))).toBeVisible();

    await takeScreenshot('wallet-setup');

    await element(by.id('button-setup-'+accountKey)).tap();
    await element(by.id('button-setup-public-key')).tap();

    await replaceTextAndLeave('input-public-key', coinData.pubKeyData.P2SHP2WPKH)
    await element(by.id('button-create-public-key')).tap();

    await waitFor(element(by.id('button-receive'))).toBeVisible().withTimeout(5000);
    await expect(element(by.id('button-receive'))).toBeVisible();
  });

  it('should have filtering options', async () => {
    await removeStatusBox();

    await expect(element(by.id('button-filter-list'))).toBeVisible();
    await takeScreenshot('wallet-main');

    await element(by.id('button-filter-list')).tap();
    await takeScreenshot('filtering-options');
    await expect(element(by.id('input-filter-search'))).toBeVisible();
  });

  it('should have a receive dialog', async () => {
    await removeStatusBox();

    await waitFor(element(by.id('button-receive'))).toBeVisible().withTimeout(5000);
    await element(by.id('button-receive')).tap();
    await expect(element(by.id('dialog-title'))).toHaveText('Receive');

    await expect(element(by.id('text-receive-address'))).toHaveText(coinData.receiveAddress.P2SHP2WPKH);
    await takeScreenshot('receive-dialog');

    await element(by.id('receive-qrcode')).tap();
    await takeScreenshot('receive-dialog-copy');

    await element(by.id('button-actionsheet')).tap();
    await takeScreenshot('receive-dialog-actionsheet');

    await element(by.id('button-close')).tap();
  });

  it('should have a send dialog', async () => {
    await removeStatusBox();

    await waitFor(element(by.id('button-send'))).toBeVisible().withTimeout(5000);
    await element(by.id('button-send')).tap();
    await expect(element(by.id('dialog-title'))).toHaveText('Send');

    await replaceTextAndLeave('input-send-address', coinData.sendTest.address);
    await replaceTextAndLeave('input-send-amount', coinData.sendTest.amount, true);
    await replaceTextAndLeave('input-send-note', coinData.sendTest.note);

    await element(by.id('button-add-transaction')).tap();

    await takeScreenshot('added-1-transaction');
  });

  it('should have a sign and edit dialog', async () => {
    await removeStatusBox();

    await waitFor(element(by.id('button-batch-summary'))).toBeVisible().withTimeout(5000);
    await element(by.id('button-batch-summary')).tap();
    await expect(element(by.text('Sign transactions'))).toBeVisible();
    await takeScreenshot('sign-modal');

    await element(by.id('batch-item-0')).tap();
    await expect(element(by.text('Edit transaction'))).toBeVisible();
    await takeScreenshot('edit-modal');

    await element(by.id('button-remove-batch')).tap();
  });

  it('should have a transaction details dialog', async () => {
    await removeStatusBox();

    await element(by.id('transaction-item')).atIndex(0).tap();
    await expect(element(by.id('dialog-title'))).toHaveText('Transaction details');
    await takeScreenshot('transaction-detail');
    await element(by.id('button-close')).tap();
  });

  it('should have a settings screen', async () => {
    await removeStatusBox();

    await waitFor(element(by.id('button-settings'))).toBeVisible().withTimeout(5000);
    await element(by.id('button-settings')).tap();
    await expect(element(by.text('Settings'))).toBeVisible();

    await takeScreenshot('settings-screen');

    await scrollAndTap(by.text('Offline transport'), by.id('settings-scroll'));
    await takeScreenshot('settings-offline-transport');
    await element(by.id('button-back')).tap();

    await scrollAndTap(by.text('Preferred currency'), by.id('settings-scroll'));
    await takeScreenshot('settings-preferred-currency');
    await element(by.id('button-back')).tap();

    await scrollAndTap(by.text('Account information'), by.id('settings-scroll'));
    await takeScreenshot('settings-account');
    await element(by.id('button-back')).tap();

    await scrollAndTap(by.text('About'), by.id('settings-scroll'));
    await takeScreenshot('settings-about');
    await element(by.id('button-back')).tap();

    await element(by.id('button-settings-close')).tap();
  })

  it('should have a sign message dialog', async () => {
    await removeStatusBox();

    await waitFor(element(by.id('button-settings'))).toBeVisible().withTimeout(5000);
    await element(by.id('button-settings')).tap();
    await takeScreenshot('settings-screen');

    await scrollAndTap(by.text('Sign message'), by.id('settings-scroll'));
    await expect(element(by.id('dialog-title'))).toHaveText('Sign message');
    await takeScreenshot('settings-sign-message');

    await element(by.id('button-close')).tap();
  })

  it('should have a verify message dialog', async () => {
    await removeStatusBox();

    await waitFor(element(by.id('button-settings'))).toBeVisible().withTimeout(5000);
    await element(by.id('button-settings')).tap();
    await takeScreenshot('settings-screen');

    await scrollAndTap(by.text('Verify message'), by.id('settings-scroll'));
    await expect(element(by.id('dialog-title'))).toHaveText('Verify message');
    await takeScreenshot('settings-verify-message');

    await replaceTextAndLeave('input-verify-address', coinData.messageAddress)
    await replaceTextAndLeave('input-verify-message', coinData.message)
    await replaceTextAndLeave('input-verify-signature', coinData.messageSignature)

    await element(by.id('button-verify')).tap();

    await expect(element(by.text('Message verified'))).toBeVisible();
  })
}

describe(`${coinConfig.coin} hot wallet`, () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  commonTests('hot');
});

describe(`${coinConfig.coin} cold wallet`, () => {
  beforeAll(async () => {
    await device.relaunchApp({delete: true})
  })

  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.id('carousel')).swipe('left');
  });

  commonTests('cold');
});
