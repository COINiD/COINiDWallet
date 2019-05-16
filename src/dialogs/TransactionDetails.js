import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, ScrollView, View, Platform, TextInput, Alert,
} from 'react-native';
import moment from 'moment';
import Big from 'big.js';
import ConvertCurrency from '../components/ConvertCurrency';

import {
  Text,
  TransactionState,
  Button,
  RowInfo,
  COINiDTransport,
  CancelButton,
  FontScale,
} from '../components';
import { numFormat } from '../utils/numFormat';
import { getConfirmationsFromBlockHeight } from '../libs/coinid-public/transactionHelper';
import {
  fontStack, colors, fontSize, fontWeight,
} from '../config/styling';

import styleMerge from '../utils/styleMerge';
import parentStyles from './styles/common';

import WalletContext from '../contexts/WalletContext';

const styles = styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    amountText: {
      fontSize: fontSize.large,
      marginBottom: 4,
      textAlign: 'center',
      ...fontWeight.bold,
    },
    fiatText: {
      color: colors.gray,
      fontSize: fontSize.h2,
      marginBottom: 16,
      textAlign: 'center',
    },
    outgoing: {
      color: colors.orange,
    },
    incoming: {
      color: colors.green,
    },
    header: {
      marginTop: 0,
      paddingTop: 8,
      backgroundColor: 'rgba(255,255,255,0.95)',
      zIndex: 10,
    },
    footer: {
      height: 0,
      backgroundColor: 'rgba(255,255,255,0.95)',
    },
    separator: {
      height: 1,
      backgroundColor: '#D8D8D8',
      marginVertical: 16,
    },
  }),
);

export default class TransactionDetails extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    info: PropTypes.shape({}).isRequired,
    currency: PropTypes.string.isRequired,
    blockHeight: PropTypes.number.isRequired,
    dialogRef: PropTypes.shape({}).isRequired,
  };

  constructor(props, context) {
    super(props);

    const { coinid } = context;
    const { ticker, noteHelper, network } = context.coinid;
    const { confirmations: recommendedConfirmations } = network;

    this.coinid = coinid;
    this.noteHelper = noteHelper;

    this.state = {
      note: '',
      ticker,
      maxFeeIncrease: 0,
      recommendedConfirmations,
    };
  }

  async componentDidMount() {
    const { info } = this.props;
    const { tx, address } = info;

    const note = await this.noteHelper.loadNote(tx, address);

    this.setState({
      maxFeeIncrease: 0, // getMaxFeeIncrease(tx, this.coinid.unspent),
      note,
    });
  }

  _handleReturnData = (data) => {
    if (data) {
      const { coinid } = this.context;
      const { info } = this.props;
      const { tx } = info;

      const [action, hex] = data.split('/');

      const refresh = () => {
        this._close();
      };

      if (action === 'TX' && hex) {
        coinid
          .queueTx(hex, this.savedUnsignedHex, tx.txid)
          .then(() => refresh())
          .catch((err) => {
            Alert.alert(err);
          });
      }
    }
  };

  _getNewFee = () => {
    const {
      info: { tx },
    } = this.props;
    const { maxFeeIncrease } = this.state;
    const oldFee = tx.fees;
    const maxFee = Number(Big(maxFeeIncrease).plus(oldFee));
    let newFee = Number(Big(oldFee).times(2));

    if (newFee > maxFee) {
      newFee = maxFee;
    }

    const feeIncrease = Number(Big(newFee).minus(oldFee));

    return {
      oldFee,
      newFee,
      feeIncrease,
      maxFeeIncrease,
    };
  };

  _getBumpFeeData = () => {
    const {
      info: { tx },
    } = this.props;
    const { newFee } = this._getNewFee();

    return new Promise((resolve, reject) => {
      try {
        const transactionData = this.coinid.buildBumpFeeTransactionData(tx, newFee);
        this.savedUnsignedHex = transactionData.split(':')[3];
        return resolve(transactionData);
      } catch (err) {
        Alert.alert(err);
        return reject(err);
      }
    });
  };

  _renderToolBox = () => {
    const { maxFeeIncrease } = this.state;

    if (maxFeeIncrease <= 0) {
      return null;
    }

    return (
      <React.Fragment>
        <View style={styles.separator} />
        <COINiDTransport
          getData={this._getBumpFeeData}
          handleReturnData={this._handleReturnData}
          parentDialog="TransactionDetails"
        >
          {({
            isSigning, signingText, cancel, submit,
          }) => (
            <React.Fragment>
              <Button
                onPress={() => {
                  const { oldFee, newFee, feeIncrease } = this._getNewFee();
                  Alert.alert(
                    'Bump fee?',
                    `Previous fee: ${oldFee.toFixed(8)}\nIncrease: ${feeIncrease.toFixed(
                      8,
                    )}\n New fee: ${newFee.toFixed(8)}`,
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      { text: 'Yes', onPress: () => submit() },
                    ],
                  );
                }}
                disabled={isSigning}
                isLoading={isSigning}
                loadingText={signingText}
              >
                Bump Fee
              </Button>
              <CancelButton show={isSigning} onPress={cancel} marginTop={16}>
                Cancel
              </CancelButton>
            </React.Fragment>
          )}
        </COINiDTransport>
      </React.Fragment>
    );
  };

  render() {
    const {
      dialogRef, currency, info, blockHeight,
    } = this.props;

    if (!info) return null;

    const { tx, address, balanceChanged } = info;
    const { note, ticker, recommendedConfirmations } = this.state;
    const { time, fees, size } = tx;
    const date = !time ? '-' : moment.unix(time).format('H:mm:ss - MMM D, YYYY');

    const confirmations = getConfirmationsFromBlockHeight(tx, blockHeight);

    return (
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <FontScale
            fontSizeMax={fontSize.large}
            fontSizeMin={fontSize.large / 3}
            text={`${numFormat(balanceChanged, ticker)} ${ticker}`}
            widthScale={0.95}
          >
            {({ fontSize: variableFontSize, text }) => (
              <Text
                style={[
                  styles.amountText,
                  styles[balanceChanged < 0 ? 'outgoing' : 'incoming'],
                  { fontSize: variableFontSize },
                ]}
              >
                {text}
              </Text>
            )}
          </FontScale>
          <ConvertCurrency value={balanceChanged}>
            {({ fiatText }) => (
              <FontScale
                fontSizeMax={fontSize.h2}
                fontSizeMin={fontSize.h2 / 3}
                text={`${fiatText}`}
                widthScale={0.65}
              >
                {({ fontSize: variableFontSize }) => (
                  <Text style={[styles.fiatText, { fontSize: variableFontSize }]}>{fiatText}</Text>
                )}
              </FontScale>
            )}
          </ConvertCurrency>
        </View>
        <ScrollView
          style={{
            overflow: 'visible',
            marginHorizontal: -16,
            paddingHorizontal: 16,
            marginBottom: -16,
          }}
          contentContainerStyle={{
            paddingBottom: 16,
          }}
          onLayout={(e) => {
            this.refContHeight = e.nativeEvent.layout.height;
            this.refContScroll = 0;
          }}
          onScroll={(e) => {
            this.refContScroll = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          <RowInfo title={balanceChanged < 0 ? 'Sent to' : 'Received on'} selectable multiLine>
            <FontScale
              fontSizeMax={fontSize.base}
              fontSizeMin={fontSize.base / 3}
              text={`${address}`}
              widthScale={0.98}
            >
              {({ fontSize: variableFontSize, text }) => (
                <Text selectable style={{ fontSize: variableFontSize, ...fontWeight.medium }}>
                  {text}
                </Text>
              )}
            </FontScale>
          </RowInfo>
          <View style={styles.separator} />
          <RowInfo title="Date">{date}</RowInfo>
          <RowInfo title="Status">
            <TransactionState
              confirmations={confirmations}
              recommendedConfirmations={recommendedConfirmations}
            />
          </RowInfo>
          <RowInfo title="Confirmations">{confirmations}</RowInfo>
          <View style={styles.separator} />
          <RowInfo
            title="Note"
            multiLine
            onLayout={(e) => {
              this.refNoteBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <TextInput
              value={note}
              onChangeText={note => this.setState({ note })}
              onBlur={() => {
                this.noteHelper.saveNote(tx, address, note || '');
              }}
              placeholder="-"
              maxLength={26}
              style={{
                fontSize: 16,
                fontFamily: fontStack.primary,
                ...fontWeight.medium,
                paddingVertical: 0,
              }}
              underlineColorAndroid="transparent"
              keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
              autoCorrect={false}
              spellCheck={false}
              textContentType="none"
              onFocus={() => {
                dialogRef._setKeyboardOffset(
                  this.refNoteBottom - this.refContHeight + 8 - this.refContScroll,
                );
              }}
            />
          </RowInfo>
          <View style={styles.separator} />
          <RowInfo title="Fee">{`${numFormat(fees, ticker)} ${ticker}`}</RowInfo>
          <RowInfo title="Size">{`${size} bytes`}</RowInfo>
          <ConvertCurrency value={balanceChanged} time={time}>
            {({ fiatText }) => (
              <RowInfo title={`${currency} on completion`}>{`${fiatText}`}</RowInfo>
            )}
          </ConvertCurrency>
          <View style={styles.separator} />
          <RowInfo title="Included in TXID" multiLine selectable>
            {tx.txid}
          </RowInfo>
          {this._renderToolBox()}
        </ScrollView>
        <View style={styles.footer} />
      </View>
    );
  }
}
