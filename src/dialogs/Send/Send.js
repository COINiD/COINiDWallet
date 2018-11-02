

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Platform,
  Clipboard,
  Keyboard,
  TouchableOpacity,
  TextInput,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { Button, Text, DetailsModal } from '../../components';
import styles from './styles';
import { numFormat } from '../../utils/numFormat';

export default class Send extends PureComponent {
  constructor(props) {
    super(props);

    const { navigation } = this.props;

    this.navigate = navigation;

    this.state = {
      address: undefined,
      amount: '',
      note: undefined,
      editAddress: '',
      editAmount: 0,
    };
  }

  componentDidMount() {
    const { ticker } = this.context.coinid;
    this.setState({ ticker });
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
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
    if (qrResult.indexOf(':') > 0) {
      var address = qrResult.match(/[1-9A-HJ-NP-Za-km-z]{26,36}/g);
      if (address) {
        address = address[0];
        this.setState({ address });

        let uriAmount = qrResult.match(/=[0-9\.]+/g);

        if (uriAmount != null) {
          uriAmount = uriAmount[0].replace('=', '');
        }

        if (uriAmount) {
          this.setState({ amount: uriAmount });
        }
      }
    } else {
      var address = qrResult.match(/[1-9A-HJ-NP-Za-km-z]{26,36}/g);
      address = address[0];
      this.setState({ address });
    }
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

  _isValidInput = (text) => {
    const regex = /^([0-9]\d*(\.\d{0,8})?)?$/;
    return regex.test(text);
  };

  _onChangeAmountText = (inputAmount) => {
    const amount = inputAmount
      .replace(',', '.')
      .replace(/^\./, '0.')
      .replace(/^[0]{2,}/, '0')
      .replace(/([.]\d{8,8})(.*$)/, '$1');

    if (!this._isValidInput(amount)) {
      return false;
    }

    this.setState({ amount });
  };

  _getAmountMaxLength = (amount) => {
    const maxLength1 = `${amount}`.replace(/\.[0-9]*$/, '').length + 8 + 1;
    const maxLength2 = `${amount}`.length + 1;

    return maxLength1 < maxLength2 ? maxLength1 : maxLength2;
  };

  render() {
    const {
      editAddress,
      editAmount,
      amount,
      address,
      note,
      ticker,
    } = this.state;
    const { onOpened, onClosed, balance } = this.props;

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
                <TextInput
                  keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                  style={styles.formItemInput}
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
                <View style={styles.formItemIcons}>
                  <Icon
                    iconStyle={styles.formItemIcon}
                    type="material-community"
                    name="qrcode"
                    onPress={this._startQr}
                    hitSlop={{
                      top: 20,
                      bottom: 20,
                      left: 20,
                      right: 20,
                    }}
                  />
                </View>
              </View>
            </View>

            <View
              style={styles.formItem}
              ref={c => this.amountContRef = c}
              onFocus={(e) => { this.elModal._setKeyboardOffset(this.refAmountBottom - this.refContHeight + 8); }}
              onLayout={(e) => { this.refAmountBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}
            >
              <Text style={styles.formLabel}>Amount</Text>
              <View style={styles.formItemRow}>
                <TextInput
                  ref={c => (this.amountRef = c)}
                  keyboardType="numeric"
                  style={styles.formItemInput}
                  value={`${amount}`}
                  onChangeText={this._onChangeAmountText}
                  returnKeyType="done"
                  onSubmitEditing={() => this.noteRef.focus()}
                  underlineColorAndroid="transparent"
                  maxLength={this._getAmountMaxLength(amount)}
                />
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.formInfo}>{`Available balance: `}</Text>
                <Text style={[styles.formInfo, (availableBalance < 0 ? styles.negativeBalance : null)]}>{`${numFormat(availableBalance, ticker)} ${ticker}`}</Text>
              </View>
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
