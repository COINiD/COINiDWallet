import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View, ActivityIndicator, Animated, StyleSheet, Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Big from 'big.js';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import {
  BatchSummary, ConnectionStatus, Balance, TransactionList, Text,
} from '../components';
import {
  Sign, Receive, Send, TransactionDetails,
} from '../dialogs';

import Settings from '../config/settings';
import { colors } from '../config/styling';

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
    backgroundColor: Platform.OS === 'ios' ? colors.getTheme(theme).seeThrough : null,
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
    backgroundColor: Platform.OS === 'ios' ? colors.getTheme(theme).seeThrough : null,
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
  constructor(props, context) {
    super(props);

    const { theme, coinid, settingHelper } = context;

    this.coinid = coinid;
    this.settingHelper = settingHelper;

    this.state = {
      isLoading: true,
      transactions: [],
      isLoadingTxs: true,
      settings: this.settingHelper.getAll(),
      balance: 0,
      blockHeight: 0,
      paymentsInBatch: [],
      balanceReserved: 0,
      realBalance: 0,
      blurOpacity: new Animated.Value(0),
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

    this.settingHelper.on('updated', (settings) => {
      this.setState({ settings });
    });

    this.settingHelper.load();

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
      return false;
    }
    this.hasUnlocked = true;

    setTimeout(() => {
      // Start checking tx events on first unlock.
      this._onTransactions();

      this.coinid.on('transactions', () => {
        this._onTransactions();
      });
    }, 100);
  };

  _onTransactions = () => {
    this.setState({
      receiveAddress: this.coinid.getReceiveAddress(),
      transactions: this.coinid.transactions,
      isLoadingTxs: false,
    });
  };

  _openTransactionDetails = (info) => {
    this.setState({
      txDetailsInfo: info,
    });
    this.detailsModal._open();
  };

  _openReceive = () => {
    this.receiveModal._open();
  };

  _openSend = () => {
    this.sendModal._open();
  };

  _openSign = () => {
    this.signModal._open();
  };

  _updatePayments = (paymentsInBatch) => {
    if (!Array.isArray(paymentsInBatch)) {
      return false;
    }

    const balanceReserved = Number(paymentsInBatch.reduce((a, c) => a.plus(c.amount), Big(0)));
    const balance = Number(Big(this.state.realBalance).minus(balanceReserved));
    this.setState({ paymentsInBatch, balanceReserved, balance });

    const storage = this.coinid.getStorage();
    storage.set('paymentsInBatch', paymentsInBatch);

    return true;
  };

  _onRemoveFromBatch = (editAddress) => {
    if (editAddress) {
      const { paymentsInBatch } = this.state;

      newPayments = paymentsInBatch.filter(e => e.address !== editAddress);

      this._updatePayments(newPayments);

      if (this.sendModal) {
        this.sendModal._close();
      }

      if (newPayments.length && this.signModal) {
        this.signModal._open();
      }
    }
  };

  _onAddToBatch = (paymentToBatch, editAddress) => {
    const { paymentsInBatch } = this.state;
    const paymentWithSameAddress = paymentsInBatch.filter(
      e => e.address === paymentToBatch.address,
    );

    if (paymentWithSameAddress.length && paymentWithSameAddress[0].address !== editAddress) {
      alert('A payment with this address have already been batched...');
    } else if (editAddress) {
      paymentToUpdate = paymentsInBatch.filter(e => e.address === editAddress);

      if (!paymentToUpdate.length) {
        alert('Could not find payment to update...');
      } else {
        paymentToUpdate[0].address = paymentToBatch.address;
        paymentToUpdate[0].amount = paymentToBatch.amount;
        paymentToUpdate[0].note = paymentToBatch.note;
        this._updatePayments(paymentsInBatch);

        if (this.sendModal) {
          this.sendModal._close();
        }
        if (this.signModal) {
          this.signModal._open();
        }
      }
    } else {
      paymentsInBatch.push(paymentToBatch);
      this._updatePayments(paymentsInBatch);
      if (this.sendModal) {
        this.sendModal._close();
      }
    }
  };

  _onQueuedTx = () => {
    this._updatePayments([]);
    setTimeout(this.signModal._close, 350);
  };

  _toggleRange = () => {
    let range = ++this.state.settings.range;

    if (range > Settings.ranges.length - 1) {
      range = 0;
    }

    this.settingHelper.update('range', range);
  };

  _blurScreen = (value, animated, key) => {
    if (this._activeBlur !== key && this._activeBlur !== undefined) {
      return;
    }

    this._activeBlur = value ? key : undefined;

    const { blurOpacity, antiBlurOpacity } = this.state;

    if (animated) {
      // only blur whole screen if blur comes from receive dialog..
      if (key === 'receive') {
        Animated.timing(blurOpacity, {
          toValue: value,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }

      Animated.timing(antiBlurOpacity, {
        toValue: 1 - value,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      if (key === 'receive') {
        blurOpacity.setValue(value);
      }
      antiBlurOpacity.setValue(1 - value);
    }
  };

  render() {
    const { navigation, showActionSheetWithOptions } = this.props;
    const { navigate } = navigation;
    const {
      isConnected,
      isLoading,
      antiBlurOpacity,
      realBalance,
      paymentsInBatch,
      receiveAddress,
      styles,
    } = this.state;

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
            range={this.state.settings.range}
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
            />
            <Icon
              iconStyle={styles.footerIcon}
              size={21}
              name="qrcode"
              onPress={this._openReceive}
              type="material-community"
              underlayColor={colors.transparent}
            />
          </View>
        </View>

        <Receive
          ref={(c) => {
            this.receiveModal = c;
          }}
          showActionSheetWithOptions={showActionSheetWithOptions}
          address={receiveAddress}
          onOpened={() => {
            this.props.onBuild();
          }}
          onClosed={() => {
            this.props.onReady();
          }}
          onOpen={() => this._blurScreen(1, true, 'receive')}
          onClose={() => this._blurScreen(0, true, 'receive')}
        />

        <Sign
          ref={(c) => {
            this.signModal = c;
          }}
          payments={this.state.paymentsInBatch}
          balance={this.state.realBalance}
          onQueuedTx={this._onQueuedTx}
          onOpened={this.props.onBuild}
          onClosed={this.props.onReady}
          sendModal={this.sendModal}
        />

        <Send
          ref={(c) => {
            this.sendModal = c;
          }}
          onAddToBatch={this._onAddToBatch}
          onRemoveFromBatch={this._onRemoveFromBatch}
          balance={this.state.balance}
          navigation={navigate}
          onOpened={this.props.onBuild}
          onClosed={this.props.onReady}
          signModal={this.signModal}
        />

        <TransactionDetails
          ref={(c) => {
            this.detailsModal = c;
          }}
          info={this.state.txDetailsInfo}
          currency={this.state.settings.currency}
          blockHeight={this.state.blockHeight}
          onOpened={this.props.onBuild}
          onClosed={this.props.onReady}
        />
      </View>
    );
  }
}

InstalledWallet.contextTypes = {
  coinid: PropTypes.object,
  settingHelper: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

InstalledWallet.propTypes = {
  navigation: PropTypes.shape({}),
  hideSensitive: PropTypes.bool,
  settings: PropTypes.shape({}),
};

InstalledWallet.defaultProps = {
  settings: {
    range: 0,
  },
  hideSensitive: false,
};

export default connectActionSheet(InstalledWallet);
