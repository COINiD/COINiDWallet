import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TouchableOpacity, Platform,
} from 'react-native';
import Share from 'react-native-share';
import {
  DetailsModal, Text, AmountInput, ReceiveQRCode,
} from '../components';
import { colors, fontSize, fontWeight } from '../config/styling';
import ExchangeHelper from '../utils/exchangeHelper';
import ReceiveActionMenu from '../actionmenus/ReceiveActionMenu';

import WalletContext from '../contexts/WalletContext';

import styleMerge from '../utils/styleMerge';
import parentStyles from './styles/common';

const styles = styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    smallText: {
      color: colors.getTheme('light').fadedText,
      margin: 0,
      width: '100%',
      ...fontWeight.medium,
    },
    amountForm: {
      borderBottomWidth: 1,
      borderBottomColor: colors.gray,
      flexDirection: 'row',
      paddingTop: 6,
    },
    amountInput: {
      color: colors.black,
      fontSize: fontSize.base,
      paddingBottom: 8,
      flex: 1,
      ...fontWeight.normal,
    },
    amountCurrency: {
      color: colors.getTheme('light').fadedText,
      paddingTop: Platform.OS === 'ios' ? 0 : 13,
      paddingLeft: 8,
    },
    currencyButton: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      borderWidth: 1,
      borderColor: colors.purple,
      borderRadius: 8,
      paddingTop: 6,
      paddingBottom: 5,
      paddingHorizontal: 7,
      marginBottom: 8,
    },
    currencyButtonText: {
      color: '#617AF7',
      ...fontWeight.medium,
      letterSpacing: 0.1,
    },
  }),
);

class Receive extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    address: PropTypes.string,
    theme: PropTypes.string,
  };

  static defaultProps = {
    address: '',
    theme: 'light',
  };

  constructor(props, context) {
    super(props);

    const { address } = props;
    const {
      coinid,
      globalContext: { settingHelper, showActionSheetWithOptions },
    } = context;
    const { ticker, coinTitle } = coinid;

    this.settingHelper = settingHelper;
    this.exchangeHelper = ExchangeHelper(ticker);

    this.state = {
      address,
      ticker,
      qrAddress: address,
      exchangeRate: 0,
      currency: '',
      amount: 0,
      coinTitle,
      showActionSheetWithOptions,
    };
  }

  getChildContext() {
    const { theme: propTheme } = this.props;
    const { theme: contextTheme } = this.context;

    return {
      theme: propTheme || contextTheme,
    };
  }

  componentDidMount() {
    const { address } = this.props;
    this._handleNewData({ address });

    this._onSettingsUpdated(this.settingHelper.getAll());
    this.settingHelper.on('updated', this._onSettingsUpdated);
  }

  componentWillReceiveProps(nextProps) {
    const { address: oldProps } = this.props;
    const { address } = nextProps;

    if (address !== oldProps) {
      this._handleNewData({ address });
    }
  }

  componentWillUnmount() {
    this.settingHelper.removeListener('updated', this._onSettingsUpdated);
  }

  _onSettingsUpdated = (settings) => {
    const { currency } = settings;
    this.setState({ currency });
    this._refreshExchangeRate(currency);
  };

  _refreshExchangeRate = (currency) => {
    this.exchangeHelper.convert(1, currency).then((exchangeRate) => {
      this.setState({ exchangeRate });
    });
  };

  _handleNewData = (newData) => {
    const { address: oldAddress, amount: oldAmount } = this.state;
    const { address = oldAddress, amount = oldAmount } = newData;

    const qrAddress = this._buildQrURI({ address, amount });
    this.setState({ qrAddress, address, amount });
  };

  _onChangeAmount = (amount) => {
    this._handleNewData({ amount });
  };

  _buildQrURI = ({
    address, amount, label, message,
  }) => {
    const {
      coinid: { qrScheme },
    } = this.context;
    let tmpl = [`${qrScheme}:`, address, '?']; // https://github.com/bitcoin/bips/blob/master/bip-0021.mediawiki

    if (amount) {
      tmpl = tmpl.concat(['amount=', encodeURIComponent(amount), '&']);
    }

    if (label) {
      tmpl = tmpl.concat(['label=', encodeURIComponent(label), '&']); // name of receiver
    }

    if (message) {
      tmpl = tmpl.concat(['message=', encodeURIComponent(message), '&']); // note
    }

    // Remove prefixing extra
    const lastc = tmpl[tmpl.length - 1];
    if (lastc === '&' || lastc === '?') {
      tmpl = tmpl.splice(0, tmpl.length - 1);
    }
    return tmpl.join('');
  };

  _open = () => {
    this.elModal._open();
  };

  _close = () => {
    this.elModal._close();
  };

  _validateAddress = () => {
    const { dialogNavigate } = this.context;
    const { address } = this.state;

    dialogNavigate(
      'ValidateAddress',
      {
        address,
      },
      this.context,
      false,
    );
  };

  _sweepPrivateKey = () => {
    const { dialogNavigate } = this.context;
    const { address } = this.state;

    dialogNavigate(
      'SweepPrivateKey',
      {
        address,
      },
      this.context,
    );
  };

  _share = async () => {
    const {
      address, amount, coinTitle, ticker,
    } = this.state;

    const getShareMessage = () => {
      let message = `My ${coinTitle} Address: ${address}`;

      if (amount) {
        message += `\nRequested Amount: ${amount} ${ticker}`;
      }

      return message;
    };

    const getQRUri = () => new Promise((resolve) => {
      this.viewShot.capture().then((uri) => {
        resolve(uri);
      });
    });

    const url = await getQRUri();

    const options = {
      title: 'Share via',
      message: getShareMessage(),
      url,
      type: 'image/png',
    };

    Share.open(options);
  };

  _showMoreOptions = () => {
    const { showActionSheetWithOptions } = this.state;

    const receiveActionMenu = new ReceiveActionMenu({
      showActionSheetWithOptions,
      onSweepPrivateKey: this._sweepPrivateKey,
      onValidateAddress: this._validateAddress,
      onShare: this._share,
    });

    receiveActionMenu.show();
  };

  _toggleInputFiat = () => {
    const { inputInFiat, exchangeRate } = this.state;

    if (!exchangeRate) {
      return false;
    }

    this.setState({ inputInFiat: !inputInFiat });
    return true;
  };

  render() {
    const {
      onOpened, onClosed, onOpen, onClose,
    } = this.props;

    const {
      ticker, qrAddress, address, exchangeRate, currency, amount,
    } = this.state;

    let { inputInFiat } = this.state;

    if (!exchangeRate) {
      inputInFiat = false;
    }

    return (
      <DetailsModal
        verticalPosition="flex-end"
        ref={(el) => {
          this.elModal = el;
        }}
        onOpened={onOpened}
        onClosed={onClosed}
        onOpen={onOpen}
        onClose={onClose}
        showMoreOptions
        onMoreOptions={this._showMoreOptions}
        avoidKeyboard
        avoidKeyboardOffset={40}
        title="Receive"
      >
        <View style={styles.container}>
          <View style={styles.modalContent}>
            <ReceiveQRCode
              getViewShot={(c) => {
                this.viewShot = c;
              }}
              address={address}
              qrAddress={qrAddress}
            />
          </View>

          <View
            style={styles.modalFooter}
            onLayout={(e) => {
              this.refContHeight = e.nativeEvent.layout.height;
            }}
          >
            <Text style={styles.smallText}>Request custom amount</Text>
            <View
              style={styles.amountForm}
              onFocus={(e) => {
                this.elModal._setKeyboardOffset(this.refAmountBottom - this.refContHeight + 8);
              }}
              onLayout={(e) => {
                this.refAmountBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
              }}
            >
              <AmountInput
                style={[styles.amountInput, { paddingRight: 60 }]}
                onChangeAmount={this._onChangeAmount}
                exchangeRate={exchangeRate}
                inputInFiat={inputInFiat}
                amount={amount}
                exchangeTo={currency}
                exchangeFrom={ticker}
              />
              <TouchableOpacity style={styles.currencyButton} onPress={this._toggleInputFiat}>
                <Text style={styles.currencyButtonText}>{inputInFiat ? currency : ticker}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </DetailsModal>
    );
  }
}

Receive.childContextTypes = {
  theme: PropTypes.string,
};

export default Receive;
