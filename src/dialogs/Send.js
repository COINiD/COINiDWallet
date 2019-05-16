import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, StyleSheet, Platform, TextInput, View, TouchableOpacity,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Big from 'big.js';

import {
  Button, Text, AmountInput, FontScale,
} from '../components';
import { numFormat } from '../utils/numFormat';
import { fontSize, colors, fontWeight } from '../config/styling';
import { decodeQrRequest } from '../utils/addressHelper';

import WalletContext from '../contexts/WalletContext';
import { withExchangeRateContext } from '../contexts/ExchangeRateContext';

import styleMerge from '../utils/styleMerge';
import parentStyles from './styles/common';

const styles = styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    container: {
      paddingTop: 8,
    },
    deleteIcon: {
      color: '#FFFFFF',
      fontSize: 21,
    },
    deleteIconContainer: {},
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

class Send extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    navigation: PropTypes.shape({}).isRequired,
    dialogRef: PropTypes.shape({}).isRequired,
    editItem: PropTypes.shape({}),
    fee: PropTypes.number,
    balance: PropTypes.number.isRequired,
    onAddToBatch: PropTypes.func.isRequired,
    onRemoveFromBatch: PropTypes.func.isRequired,
    exchangeRateContext: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    editItem: {},
    fee: 0,
  };

  constructor(props, context) {
    super(props);

    const { navigation, editItem } = props;
    const { coinid } = context;
    const { ticker } = coinid;

    this.coinid = coinid;
    this.navigation = navigation;

    this.state = {
      exchangeRate: 0,
      ticker,
      inputInFiat: false,
      address: '',
      note: '',
      amount: '',
      editAddress: '',
      editAmount: 0,
    };

    if (editItem.address) {
      this.state = {
        ...this.state,
        address: editItem.address,
        note: editItem.note,
        amount: editItem.amount,
        editAddress: editItem.address,
        editAmount: editItem.amount,
      };
    }
  }

  _verify = () => {
    const { address } = this.state;
    let { amount } = this.state;

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
    const { editAmount } = this.state;

    const { balance } = this.props;
    const availableBalance = balance + editAmount;

    if (amount > availableBalance) {
      errors.push({
        type: 'balance',
        message: 'not enough funds',
      });
    }
    */

    if (!this.coinid.validateAddress(address)) {
      errors.push({
        type: 'address',
        message: `address is not a valid ${this.coinid.coin} address`,
      });
    }

    if (errors.length) {
      throw errors;
    }

    return true;
  };

  _addToBatch = () => {
    const { onAddToBatch } = this.props;

    let { amount } = this.state;
    const { address, note, editAddress } = this.state;
    amount = Number(amount);

    onAddToBatch({ amount, address, note }, editAddress);
  };

  _removeFromBatch = () => {
    const { onRemoveFromBatch } = this.props;

    const { editAddress } = this.state;
    onRemoveFromBatch(editAddress);
  };

  _submit = () => {
    try {
      if (this._verify()) {
        this._addToBatch();
      }
    } catch (err) {
      Alert.alert(err[0].message);
    }
  };

  _startQr = () => {
    this.navigation.navigate('QRScan', { qrCodeResult: this._parseQRCodeResult });
  };

  _parseQRCodeResult = (qrResult) => {
    const {
      coinid: {
        network: { bech32, qrScheme },
      },
    } = this.context;

    const decoded = decodeQrRequest(qrResult, { qrScheme, bech32 });
    const { address, amount = '', note = '' } = decoded;

    if (address) {
      this.amountRef._updateAmount(amount);
      this.setState({ address, amount, note });
      return true;
    }

    return false;
  };

  _onChangeAmount = (amount) => {
    this.setState({ amount });
  };

  _toggleInputFiat = () => {
    const { inputInFiat } = this.state;
    const { exchangeRateContext } = this.props;
    const { exchangeRate } = exchangeRateContext;

    if (!exchangeRate) {
      return;
    }

    this.setState({ inputInFiat: !inputInFiat });
  };

  render() {
    const {
      editAddress, editAmount, address, note, ticker, amount,
    } = this.state;

    const {
      balance, dialogRef, fee, exchangeRateContext,
    } = this.props;
    const { exchangeRate, currency } = exchangeRateContext;

    let { inputInFiat } = this.state;

    if (!exchangeRate) {
      inputInFiat = false;
    }

    const availableBalance = Big(balance)
      .plus(editAmount)
      .minus(fee);

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
          <TouchableOpacity
            onPress={() => {
              if (availableBalance > 0) {
                this.amountRef._updateAmount(availableBalance);
              }
            }}
          >
            <Text style={[styles.formInfo, availableBalance < 0 ? styles.negativeBalance : null]}>
              {getAmount()}
            </Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderSendButton = () => (
      <Button style={styles.formButton} onPress={this._submit}>
        Add transaction
      </Button>
    );

    return (
      <View
        style={styles.container}
        ref={(c) => {
          this.refCont = c;
        }}
        onLayout={() => {}}
      >
        <View
          style={styles.modalContent}
          onLayout={(e) => {
            this.refContHeight = e.nativeEvent.layout.height;
          }}
        >
          <View
            style={styles.formItem}
            onFocus={() => {
              dialogRef._setKeyboardOffset(this.refToBottom - this.refContHeight + 8);
            }}
            onLayout={(e) => {
              this.refToBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <Text style={styles.formLabel}>To</Text>
            <View style={styles.formItemRow}>
              <FontScale
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
                fontSizeMax={fontSize.base}
                fontSizeMin={6}
                text={address.trim()}
                widthScale={0.9}
                ref={(c) => {
                  this.toScaleRef = c;
                }}
              >
                {({ fontSize: scaledFontSize }) => (
                  <TextInput
                    keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                    style={[
                      styles.formItemInput,
                      { flex: 0, width: '100%', fontSize: scaledFontSize },
                    ]}
                    value={address}
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="none"
                    onChangeText={(changedAddress) => {
                      this.setState({ address: changedAddress.trim() });
                    }}
                    onBlur={() => {
                      const orgAddress = address;

                      this.setState({ address: `${orgAddress} ` }, () => {
                        setTimeout(() => {
                          this.setState({ address: `${orgAddress}` });
                        }, 100);
                      });
                    }}
                    ref={(c) => {
                      this.toRef = c;
                    }}
                    returnKeyType="done"
                    onSubmitEditing={() => this.amountRef.focus()}
                    underlineColorAndroid="transparent"
                    allowFontScaling={false}
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
            ref={(c) => {
              this.amountContRef = c;
            }}
            onFocus={() => {
              dialogRef._setKeyboardOffset(this.refAmountBottom - this.refContHeight + 8);
            }}
            onLayout={(e) => {
              this.refAmountBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <View>
              <Text style={styles.formLabel}>Amount</Text>
              <View style={styles.formItemRow}>
                <AmountInput
                  ref={(c) => {
                    this.amountRef = c;
                  }}
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
              <TouchableOpacity style={styles.currencyButton} onPress={this._toggleInputFiat}>
                <Text style={styles.currencyButtonText}>{inputInFiat ? currency : ticker}</Text>
              </TouchableOpacity>
            </View>
            {renderAvailableBalance()}
          </View>

          <View
            style={styles.formItem}
            onFocus={() => {
              dialogRef._setKeyboardOffset(this.refNoteBottom - this.refContHeight + 8);
            }}
            onLayout={(e) => {
              this.refNoteBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <Text style={styles.formLabel}>Note</Text>
            <View style={styles.formItemRow}>
              <TextInput
                keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                autoCorrect={false}
                spellCheck={false}
                textContentType="none"
                style={styles.formItemInput}
                value={note}
                maxLength={26}
                onChangeText={newNote => this.setState({ note: newNote })}
                ref={(c) => {
                  this.noteRef = c;
                }}
                returnKeyType="done"
                onSubmitEditing={() => this.noteRef.blur()}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>

          {editAddress ? renderEditButton() : renderSendButton()}
        </View>
      </View>
    );
  }
}

export default withExchangeRateContext()(Send);
