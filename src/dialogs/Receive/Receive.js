import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, Clipboard } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Text, DetailsModal } from '../../components';
import { MoreOptions, ValidateAddress } from '..';
import styles from './styles';

export default class Receive extends PureComponent {
  constructor(props) {
    super(props);

    const { address } = props;

    this.state = {
      address,
      qrAddress: address,
      requestAmount: '',
    };
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  componentDidMount() {
    const { ticker } = this.context.coinid;
    this.setState({ ticker });
    this._handleNewAddress(this.props.address);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.address !== nextProps.address) {
      this._handleNewAddress(nextProps.address);
    }
  }

  _handleNewAddress = (address) => {
    const uri = this._buildQrURI(address);
    this.setState({ qrAddress: uri, address });
  };

  _isValidInput = (text) => {
    const regex = /^([0-9]\d*(\.\d{0,8})?)?$/;
    return regex.test(text);
  };

  _onChangeAmountText = (inputAmount) => {
    const { address } = this.state;

    const requestAmount = inputAmount
      .replace(',', '.')
      .replace(/^\./, '0.')
      .replace(/^[0]{2,}/, '0')
      .replace(/([.]\d{8,8})(.*$)/, '$1');

    if (!this._isValidInput(requestAmount)) {
      return false;
    }

    this.setState({ requestAmount }, () => {
      if (this.qrTimer !== undefined) {
        clearTimeout(this.qrTimer);
      }

      this.qrTimer = setTimeout(() => {
        const uri = this._buildQrURI(address, requestAmount);
        this.setState({ qrAddress: uri });
      }, 400);
    });

    return true;
  };

  _getAmountMaxLength = (amount) => {
    const maxLength1 = `${amount}`.replace(/\.[0-9]*$/, '').length + 8 + 1;
    const maxLength2 = `${amount}`.length + 1;

    return maxLength1 < maxLength2 ? maxLength1 : maxLength2;
  };

  _buildQrURI(address, amount, label, message) {
    const { qrScheme } = this.context.coinid;
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
    Clipboard.setString(this.state.address);
    this.refMoreOptions._close();
  };

  _validateAddress = () => {
    this.refMoreOptions._close();
    this.refValidateAddress._open(this.state.address);
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

  render() {
    const {
      onOpened,
      onClosed,
      onOpen,
      onClose,
    } = this.props;

    const {
      ticker,
      requestAmount,
      qrAddress,
      address,
    } = this.state;

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
            <Text style={styles.addressText} selectable numberOfLines={1} ellipsizeMode="middle">
              {address}
            </Text>
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
              <TextInput
                style={styles.amountInput}
                value={requestAmount}
                onChangeText={this._onChangeAmountText}
                keyboardType="numeric"
                underlineColorAndroid="transparent"
                maxLength={this._getAmountMaxLength(requestAmount)}
              />
              <Text style={styles.amountCurrency}>{ticker}</Text>
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
