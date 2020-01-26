import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, View, ActivityIndicator, Animated, StyleSheet,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Big from 'big.js';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import {
  BatchSummary, ConnectionStatus, Balance, TransactionList, Text,
} from '../components';
import { withStatusBox } from '../contexts/StatusBoxContext';
import { withLocaleContext } from '../contexts/LocaleContext';

import projectSettings from '../config/settings';
import { colors } from '../config/styling';

import WalletContext from '../contexts/WalletContext';

const themedStyleGenerator = theme => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 24,
    paddingLeft: 16,
    paddingRight: 16,
    overflow: 'hidden',
    zIndex: 1,
    marginBottom: -getBottomSpace(),
  },
  topContainer: {
    paddingTop: 24,
    marginTop: -24,
    backgroundColor: colors.getTheme(theme).seeThrough,
    position: 'relative',
    zIndex: 10,
    paddingBottom: 16,
  },
  footer: {
    marginLeft: -16,
    marginRight: -16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderTopWidth: 1,
    borderColor: colors.getTheme(theme).border,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.getTheme(theme).seeThrough,
    height: 50 + getBottomSpace(),
    paddingBottom: getBottomSpace(),
  },
  footerIcon: {
    color: colors.getTheme(theme).highlight,
    marginLeft: 36,
    marginRight: 36,
  },
});

class InstalledWallet extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    navigation: PropTypes.shape({}).isRequired,
    hideSensitive: PropTypes.bool,
    hasBeenSetup: PropTypes.bool,
    statusBoxContext: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    hideSensitive: false,
    hasBeenSetup: false,
  };

  constructor(props, context) {
    super(props);

    const {
      theme,
      coinid,
      globalContext: { settingHelper },
    } = context;

    this.coinid = coinid;
    this.settingHelper = settingHelper;

    this.state = {
      isLoading: true,
      transactions: [],
      isLoadingTxs: true,
      balance: 0,
      blockHeight: 0,
      paymentsInBatch: [],
      balanceReserved: 0,
      realBalance: 0,
      antiBlurOpacity: new Animated.Value(1),
      styles: themedStyleGenerator(theme),
    };
  }

  componentDidMount() {
    this._startWallet();

    const { hideSensitive } = this.props;
    this._blurScreen(hideSensitive ? 1 : 0, true, 'props');

    this.setState({
      receiveAddress: this.coinid.getReceiveAddress(),
    });

    const storage = this.coinid.getStorage();
    storage.get('paymentsInBatch').then(this._updatePayments);
  }

  componentWillReceiveProps(nextProps) {
    this._handleHideSensitiveChange(nextProps.hideSensitive);
  }

  _handleHideSensitiveChange = (newHideSensitive) => {
    const { hideSensitive } = this.props;

    if (hideSensitive !== newHideSensitive) {
      this._blurScreen(newHideSensitive ? 1 : 0, true, 'props');
    }
  };

  _startWallet = () => {
    this.coinid.on('balance', () => {
      const realBalance = this.coinid.balance;
      const { balanceReserved } = this.state;
      const balance = Number(Big(realBalance).minus(balanceReserved));

      this.setState({ balance, realBalance });
    });

    this.coinid.on('connectionChange', (isConnected) => {
      this.setState({ isConnected });
    });

    this.coinid.on('blockHeight', (blockHeight) => {
      this.setState({ blockHeight });
    });

    this.setState({
      isLoading: false,
    });

    const { hasBeenSetup } = this.props;

    if (hasBeenSetup) {
      this.coinid.on('transactions', () => {
        this._onTransactions();
      });
    } else {
      global._addOnUnlock(this._onFirstUnlock);
    }

    this.coinid.startWallet();
  };

  _onFirstUnlock = () => {
    if (this.hasUnlocked === true) {
      return;
    }
    this.hasUnlocked = true;

    setTimeout(() => {
      // Start checking tx events on first unlock.
      this._onTransactions();

      this.coinid.on('transactions', () => {
        this._onTransactions();
      });
    }, 100);

    const { statusBoxContext } = this.props;

    setTimeout(() => {
      statusBoxContext.showStatus(
        "Keep it safe. Don't forget to backup the recovery phrase from your COINiD Vault.",
        { hideAfter: 10000 },
      );
    }, 3000);
  };

  _onTransactions = () => {
    this.setState({
      receiveAddress: this.coinid.getReceiveAddress(),
      transactions: this.coinid.transactions,
      isLoadingTxs: false,
    });
  };

  _openTransactionDetails = (info) => {
    const {
      dialogNavigate,
      globalContext: {
        settings: { currency },
      },
    } = this.context;
    const { blockHeight } = this.state;

    dialogNavigate(
      'TransactionDetails',
      {
        info,
        blockHeight,
        currency,
      },
      this.context,
    );
  };

  _openReceive = () => {
    const { dialogNavigate } = this.context;
    const { receiveAddress } = this.state;

    dialogNavigate(
      'Receive',
      {
        address: receiveAddress,
        onOpen: () => {
          this._blurScreen(1, true, 'receive');
          global.disableInactiveOverlay();
        },
        onClose: () => {
          this._blurScreen(0, true, 'receive');
          global.enableInactiveOverlay();
        },
      },
      this.context,
    );
  };

  _openSignMessage = () => {
    const { dialogNavigate } = this.context;
    dialogNavigate('SignMessage', {}, this.context);
  };

  _openVerifyMessage = () => {
    const { dialogNavigate } = this.context;
    dialogNavigate('VerifyMessage', {}, this.context);
  };

  _openSend = () => {
    const { dialogNavigate } = this.context;
    const { balance } = this.state;
    const { navigation } = this.props;

    dialogNavigate(
      'Send',
      {
        onAddToBatch: this._onAddToBatch,
        onRemoveFromBatch: this._onRemoveFromBatch,
        balance,
        navigation,
      },
      this.context,
    );
  };

  _openSign = () => {
    const { dialogNavigate } = this.context;
    const { balance, realBalance, paymentsInBatch } = this.state;
    const { navigation } = this.props;

    if (paymentsInBatch.length === 0) {
      return;
    }

    dialogNavigate(
      'Sign',
      {
        payments: paymentsInBatch,
        balance,
        realBalance,
        navigation,
        onQueuedTx: this._onQueuedTx,
        onAddToBatch: this._onAddToBatch,
        onRemoveFromBatch: this._onRemoveFromBatch,
      },
      this.context,
    );
  };

  _updatePayments = (paymentsInBatch, cb) => {
    if (!Array.isArray(paymentsInBatch)) {
      return false;
    }

    const { realBalance } = this.state;

    const balanceReserved = Number(paymentsInBatch.reduce((a, c) => a.plus(c.amount), Big(0)));
    const balance = Number(Big(realBalance).minus(balanceReserved));
    this.setState({ paymentsInBatch: [...paymentsInBatch], balanceReserved, balance }, cb);

    const storage = this.coinid.getStorage();
    storage.set('paymentsInBatch', paymentsInBatch);

    return true;
  };

  _onRemoveFromBatch = (editAddress) => {
    if (editAddress) {
      const { paymentsInBatch } = this.state;
      const { dialogCloseAndClear } = this.context;

      const newPayments = paymentsInBatch.filter(e => e.address !== editAddress);

      this._updatePayments(newPayments, () => {
        if (newPayments.length) {
          this._openSign();
        } else {
          dialogCloseAndClear(true);
        }
      });
    }
  };

  _onAddToBatch = (paymentToBatch, editAddress) => {
    const { dialogCloseAndClear } = this.context;

    const { paymentsInBatch } = this.state;
    const paymentWithSameAddress = paymentsInBatch.filter(
      e => e.address === paymentToBatch.address,
    );

    if (paymentWithSameAddress.length && paymentWithSameAddress[0].address !== editAddress) {
      Alert.alert('A payment with this address have already been batched...');
    } else if (editAddress) {
      const [paymentToUpdate] = paymentsInBatch.filter(e => e.address === editAddress);
      const indexToUpdate = paymentsInBatch.indexOf(paymentToUpdate);

      if (indexToUpdate === -1) {
        Alert.alert('Could not find payment to update...');
      } else {
        paymentsInBatch[indexToUpdate] = {
          ...paymentToBatch,
        };
        this._updatePayments(paymentsInBatch, () => {
          this._openSign();
        });
      }
    } else {
      paymentsInBatch.push(paymentToBatch);
      this._updatePayments(paymentsInBatch);

      dialogCloseAndClear(true);
    }
  };

  _onQueuedTx = () => {
    const { dialogCloseAndClear } = this.context;

    this._updatePayments([]);
    setTimeout(() => {
      dialogCloseAndClear(true);
    }, 350);
  };

  _toggleRange = () => {
    const {
      globalContext: { settings },
    } = this.context;

    let range = settings.range + 1;

    if (range > projectSettings.ranges.length - 1) {
      range = 0;
    }

    this.settingHelper.update('range', range);
  };

  _blurScreen = (value, animated, key) => {
    if (this._activeBlur !== key && this._activeBlur !== undefined) {
      return;
    }

    this._activeBlur = value ? key : undefined;

    const { antiBlurOpacity } = this.state;

    if (animated) {
      Animated.timing(antiBlurOpacity, {
        toValue: 1 - value,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      antiBlurOpacity.setValue(1 - value);
    }
  };

  render() {
    const {
      isConnected,
      isLoading,
      antiBlurOpacity,
      realBalance,
      paymentsInBatch,
      styles,
    } = this.state;

    const {
      globalContext: { settings },
    } = this.context;

    const { transactions, isLoadingTxs } = this.state;

    if (isLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator animating size="large" style={{ marginBottom: 20 }} />
          <Text h2>Loading Wallet</Text>
          <Text style={{ marginTop: 20 }}>Your wallet will be ready soon</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.topContainer}>
            <Animated.View style={{ opacity: antiBlurOpacity }}>
              <Balance balance={realBalance} />
            </Animated.View>
          </View>

          <TransactionList
            range={settings.range}
            toggleRange={this._toggleRange}
            transactions={transactions}
            isLoadingTxs={isLoadingTxs}
            showTransactionDetails={this._openTransactionDetails}
          />

          <BatchSummary payments={paymentsInBatch} onPress={this._openSign} />

          <ConnectionStatus connected={isConnected} />

          <View style={styles.footer}>
            <Icon
              iconStyle={styles.footerIcon}
              size={21}
              name="send"
              onPress={this._openSend}
              underlayColor={colors.transparent}
              testID="button-send"
            />
            <Icon
              iconStyle={styles.footerIcon}
              size={21}
              name="qrcode"
              onPress={this._openReceive}
              type="material-community"
              underlayColor={colors.transparent}
              testID="button-receive"
            />
          </View>
        </View>
      </View>
    );
  }
}

export default withLocaleContext(withStatusBox(InstalledWallet));
