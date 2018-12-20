import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Clipboard, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {
  DetailsModal, Text, FontScale, AmountInput,
} from '../../components';
import { MoreOptions, ValidateAddress } from '..';
import styles from './styles';
import { fontSize } from '../../config/styling';
import ExchangeHelper from '../../utils/exchangeHelper';

export default class Receive extends PureComponent {
  constructor(props, context) {
    super(props);

    const { address } = props;
    const { coinid, settingHelper } = context;
    const { ticker } = coinid;

    this.settingHelper = settingHelper;
    this.exchangeHelper = ExchangeHelper(ticker);

    this.state = {
      address,
      ticker,
      qrAddress: address,
      requestAmount: '',
      exchangeRate: 0,
      currency: '',
      amount: 0,
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

  _onSettingsUpdated = (settings) => {
    const { currency } = settings;
    this.setState({ currency });
    this._refreshExchangeRate(currency);
  };

  _refreshExchangeRate = (currency) => {
    this.exchangeHelper
      .convert(1, currency)
      .then((exchangeRate) => {
        this.setState({ exchangeRate });
      });
  }

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
    const { coinid: { qrScheme } } = this.context;
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
  }

  _open = () => {
    this.elModal._open();
  };

  _close = () => {
    this.elModal._close();
  };

  _copyAddress = () => {
    const { address } = this.state;
    Clipboard.setString(address);
    this.refMoreOptions._close();
  };

  _validateAddress = () => {
    const { address } = this.state;
    this.refMoreOptions._close();
    this.refValidateAddress._open(address);
  };

  _showMoreOptions = () => {
    this.refMoreOptions._open([
      [
        {
          title: 'Copy Address',
          onPress: this._copyAddress,
        },
        {
          title: 'Validate Address',
          onPress: this._validateAddress,
        },
      ],
      [
        {
          title: 'Cancel',
          onPress: this.refMoreOptions._close,
        },
      ],
    ]);
  };

  _toggleInputFiat = () => {
    const { inputInFiat, exchangeRate } = this.state;

    if (!exchangeRate) {
      return false;
    }

    this.setState({ inputInFiat: !inputInFiat });
  };

  render() {
    const {
      onOpened,
      onClosed,
      onOpen,
      onClose,
    } = this.props;

    const {
      ticker,
      qrAddress,
      address,
      exchangeRate,
      currency,
      amount,
    } = this.state;

    let { inputInFiat } = this.state;

    if (!exchangeRate) {
      inputInFiat = false;
    }

    return [
      <DetailsModal
        key="modal"
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
        <View
          style={styles.container}
        >
          <View style={styles.modalContent}>
            <View style={styles.qrCode}>
              <QRCode
                value={qrAddress}
                size={160}
                ecl="Q"
                logo={require('../../assets/images/qr_logo_full.png')}
                logoSize={80}
                logoBackgroundColor="transparent"
              />
            </View>
            <FontScale
              fontSizeMax={fontSize.small}
              fontSizeMin={8}
              text={address}
              widthScale={0.9}
            >
              {({ fontSize }) => (
                <Text style={[styles.addressText, { fontSize }]} selectable>
                  {address}
                </Text>
              )}
            </FontScale>
          </View>
          <View
            style={styles.modalFooter}
            onLayout={(e) => { this.refContHeight = e.nativeEvent.layout.height; }}
          >
            <Text style={styles.smallText}>Request custom amount</Text>
            <View
              style={styles.amountForm}
              onFocus={(e) => { this.elModal._setKeyboardOffset(this.refAmountBottom - this.refContHeight + 8); }}
              onLayout={(e) => { this.refAmountBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}
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
              <TouchableOpacity
                style={styles.currencyButton}
                onPress={this._toggleInputFiat}
              >
                <Text style={styles.currencyButtonText}>
                  {inputInFiat ? currency : ticker}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </DetailsModal>,
      <MoreOptions key="more" ref={c => (this.refMoreOptions = c)} />,
      <ValidateAddress
        key="validateaddress"
        ref={c => (this.refValidateAddress = c)}
      />,
    ];
  }
}

Receive.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
  settingHelper: PropTypes.object,
};

Receive.childContextTypes = {
  theme: PropTypes.string,
};

Receive.propTypes = {
  address: PropTypes.string,
  theme: PropTypes.string,
};

Receive.defaultProps = {
  address: undefined,
  theme: 'light',
};
