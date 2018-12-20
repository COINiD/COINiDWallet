import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Big from 'big.js';

import {
  Button, Text, DetailsModal, AmountInput, FontScale,
} from '../../components';
import styles from './styles';
import { numFormat } from '../../utils/numFormat';
import ExchangeHelper from '../../utils/exchangeHelper';
import { fontSize } from '../../config/styling';

const bip21 = require('bip21');

export default class Send extends PureComponent {
  constructor(props, context) {
    super(props);

    const { navigation } = props;
    const { coinid, settingHelper } = context;
    const { ticker } = coinid;

    this.settingHelper = settingHelper;
    this.exchangeHelper = ExchangeHelper(ticker);
    this.navigate = navigation;

    this.state = {
      exchangeRate: 0,
      currency: '',
      ticker,
      address: undefined,
      amount: '',
      note: undefined,
      editAddress: '',
      editAmount: 0,
      inputInFiat: false,
    };
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  componentDidMount() {
    this._onSettingsUpdated(this.settingHelper.getAll());
    this.settingHelper.on('updated', this._onSettingsUpdated);
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

  _verify = () => {
    let { amount, address, editAmount } = this.state;
    const { balance } = this.props;
    const availableBalance = balance + editAmount;

    amount = Number(amount);

    const errors = [];

    if (isNaN(amount)) {
      errors.push({
        type: 'amount',
        message: 'amount is not a number',
      });
    }

    if (amount === Number(0)) {
      errors.push({
        type: 'amount',
        message: 'amount cannot be zero',
      });
    }

    /*
    if (amount > availableBalance) {
      errors.push({
        type: 'balance',
        message: 'not enough funds',
      });
    }
    */

    if (!this.context.coinid.validateAddress(address)) {
      errors.push({
        type: 'address',
        message:
          `address is not a valid ${this.context.coinid.coin} address`,
      });
    }

    if (errors.length) {
      throw errors;
    }

    return true;
  };

  _addToBatch = () => {
    let {
      amount, address, note, editAddress,
    } = this.state;
    amount = Number(amount);
    this.props.onAddToBatch({ amount, address, note }, editAddress);
  };

  _removeFromBatch = () => {
    const { editAddress } = this.state;
    this.props.onRemoveFromBatch(editAddress);
  };

  _submit = () => {
    try {
      if (this._verify()) {
        this._addToBatch();
        // this._close();
      }
    } catch (err) {
      alert(err[0].message);
    }
  };

  _startQr = () => {
    this.navigate('QRScan', { qrCodeResult: this._parseQRCodeResult });
  };

  _parseQRCodeResult = (qrResult) => {
    const { coinid: { network: { bech32, qrScheme } } } = this.context;

    try {
      // try first with bip21
      const decoded = bip21.decode(qrResult, qrScheme);
      const { address, options: { amount = '', message = '' } } = decoded;

      this.setState({ address, amount: `${amount}`, note: `${message}` });

      this.amountRef._updateAmount(`${amount}`);
    } catch (err) {
      // fallback to only match address in qr
      let addressMatch = qrResult.match(/^[1-9A-HJ-NP-Za-km-z]{26,36}$/);

      if (!addressMatch) {
        const re = new RegExp(`^${bech32}[0-9a-z]{10,88}$`);
        addressMatch = qrResult.match(re);
      }

      if (!addressMatch || !addressMatch[0]) {
        return false;
      }

      const [address] = addressMatch;
      this.setState({ address });
    }

    return true;
  };

  _open = (item) => {
    // if item is set then we enter edit mode
    if (item !== undefined) {
      this.setState({
        ...item,
        editAddress: item.address,
        editAmount: item.amount,
      });
    } else {
      this.setState({
        address: '',
        note: '',
        amount: '',
        editAddress: '',
        editAmount: 0,
      });
    }
    this.elModal._open();
  };

  _close = () => {
    this.elModal._close();
  };

  _onChangeAmount = (amount) => {
    this.setState({ amount });
  };

  _toggleInputFiat = () => {
    const { inputInFiat, exchangeRate } = this.state;

    if (!exchangeRate) {
      return false;
    }

    this.setState({ inputInFiat: !inputInFiat });
  }

  render() {
    const {
      editAddress,
      editAmount,
      address,
      note,
      ticker,
      amount,
      exchangeRate,
      currency,
    } = this.state;

    const {
      onOpened, onClosed, balance,
    } = this.props;

    let { inputInFiat } = this.state;

    if (!exchangeRate) {
      inputInFiat = false;
    }

    const availableBalance = balance + editAmount;

    const renderEditButton = () => (
      <View style={{ flexDirection: 'row' }}>
        <Button
          style={[
            styles.formButton,
            {
              backgroundColor: '#2A2937',
              maxWidth: 48,
              marginRight: 10,
            },
          ]}
          onPress={this._removeFromBatch}
        >
          <Icon
            name="delete"
            containerStyle={styles.deleteIconContainer}
            iconStyle={styles.deleteIcon}
          />
        </Button>
        <Button style={styles.formButton} onPress={this._submit}>
            Update
        </Button>
      </View>
    );

    const renderAvailableBalance = () => {
      const getAmount = () => {
        if (inputInFiat) {
          const fiatAmount = Big(availableBalance).times(exchangeRate);

          return `${numFormat(fiatAmount, currency)} ${currency}`;
        }

        return `${numFormat(availableBalance, ticker)} ${ticker}`;
      };

      return (
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.formInfo}>Available balance: </Text>
          <Text style={[styles.formInfo, (availableBalance < 0 ? styles.negativeBalance : null)]}>
            { getAmount() }
          </Text>
        </View>
      );
    };

    const renderSendButton = () => (
      <Button style={styles.formButton} onPress={this._submit}>
          Add transaction
      </Button>
    );

    return (
      <DetailsModal
        ref={(c) => { this.elModal = c; }}
        title={editAddress ? 'Edit Transaction' : 'Send'}
        verticalPosition="flex-end"
        onOpened={onOpened}
        onClosed={onClosed}
        avoidKeyboard
        avoidKeyboardOffset={40}
      >
        <View
          style={styles.container}
          ref={(c) => {
            this.refCont = c;
          }}
          onLayout={() => {}}
        >
          <View
            style={styles.modalContent}
            onLayout={(e) => { this.refContHeight = e.nativeEvent.layout.height; }}
          >

            <View
              style={styles.formItem}
              onLayout={c => this.toContPos = c}
              ref={c => this.toContRef = c}
              onFocus={(e) => { this.elModal._setKeyboardOffset(this.refToBottom - this.refContHeight + 8); }}
              onLayout={(e) => { this.refToBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}
            >
              <Text style={styles.formLabel}>To</Text>
              <View style={styles.formItemRow}>
                <FontScale
                  style={{flex: 1, flexDirection: 'column', alignItems: 'flex-start'}}
                  fontSizeMax={fontSize.base}
                  fontSizeMin={6}
                  text={address}
                  widthScale={0.9}
                >
                  {({fontSize}) => (
                    <TextInput
                      keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                      style={[styles.formItemInput, {flex: 0, width: '100%', fontSize}]}
                      value={address}
                      autoCorrect={false}
                      spellCheck={false}
                      textContentType={false}
                      onChangeText={address => this.setState({ address: address.trim() })}
                      ref={(c) => { this.toRef = c; }}
                      returnKeyType="done"
                      onSubmitEditing={() => this.amountRef.focus()}
                      underlineColorAndroid="transparent"
                    />
                  )}
                </FontScale>
                <View style={styles.formItemIcons}>
                  <Icon
                    iconStyle={styles.formItemIcon}
                    type="material-community"
                    name="qrcode"
                    onPress={this._startQr}
                    hitSlop={{
                      top: 20,
                      bottom: 20,
                      left: 0,
                      right: 20,
                    }}
                  />
                </View>
              </View>
            </View>

            <View
              style={styles.formItem}
              ref={(c) => { this.amountContRef = c; }}
              onFocus={(e) => { this.elModal._setKeyboardOffset(this.refAmountBottom - this.refContHeight + 8); }}
              onLayout={(e) => { this.refAmountBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}
            >
              <View>
                <Text style={styles.formLabel}>Amount</Text>
                <View style={styles.formItemRow}>
                  <AmountInput
                    ref={(c) => { this.amountRef = c; }}
                    style={[styles.formItemInput, { paddingRight: 60 }]}
                    onChangeAmount={this._onChangeAmount}
                    onSubmitEditing={() => this.noteRef.focus()}
                    exchangeRate={exchangeRate}
                    inputInFiat={inputInFiat}
                    amount={amount}
                    exchangeTo={currency}
                    exchangeFrom={ticker}
                  />
                </View>
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={this._toggleInputFiat}
                >
                  <Text style={styles.currencyButtonText}>
                    {inputInFiat ? currency : ticker}
                  </Text>
                </TouchableOpacity>
              </View>
              { renderAvailableBalance() }
            </View>

            <View
              style={styles.formItem}
              onFocus={(e) => { this.elModal._setKeyboardOffset(this.refNoteBottom - this.refContHeight + 8); }}
              onLayout={(e) => { this.refNoteBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}
            >
              <Text style={styles.formLabel}>Note</Text>
              <View style={styles.formItemRow}>
                <TextInput
                  keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType={false}
                  style={styles.formItemInput}
                  value={note}
                  maxLength={26}
                  onChangeText={note => this.setState({ note })}
                  ref={c => (this.noteRef = c)}
                  returnKeyType="done"
                  onSubmitEditing={() => this.noteRef.blur()}
                  underlineColorAndroid="transparent"
                />
              </View>
            </View>

            {editAddress ? renderEditButton() : renderSendButton()}
          </View>
        </View>
      </DetailsModal>
    );
  }
}

Send.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
  settingHelper: PropTypes.object,
};

Send.childContextTypes = {
  theme: PropTypes.string,
};

Send.propTypes = {
  theme: PropTypes.string,
};

Send.defaultProps = {
  theme: 'light',
};
