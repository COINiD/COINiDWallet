import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  ScrollView, View, Platform, TextInput, Alert, Text as DefaultText,
} from 'react-native';
import moment from 'moment';
import Big from 'big.js';

import {
  DetailsModal,
  Text,
  TransactionState,
  Button,
  RowInfo,
  COINiDTransport,
  CancelButton,
  FontScale,
} from '../../components';
import Settings from '../../config/settings';
import ExchangeHelper from '../../utils/exchangeHelper';
import { numFormat } from '../../utils/numFormat';
import styles from './styles';
import {
  getConfirmationsFromBlockHeight,
  getMaxFeeIncrease,
} from '../../libs/coinid-public/transactionHelper';
import { fontStack, fontWeight, fontSize } from '../../config/styling';

export default class TransactionDetails extends PureComponent {
  constructor(props, context) {
    super(props);

    const { coinid } = context;
    const { ticker, noteHelper, network } = context.coinid;
    const { confirmations: recommendedConfirmations } = network;

    this.coinid = coinid;
    this.noteHelper = noteHelper;

    this.exchangeHelper = ExchangeHelper(ticker);

    this.state = {
      fiatAmount: '',
      note: '',
      ticker,
      maxFeeIncrease: 0,
      recommendedConfirmations,
    };
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.info) {
      const { info, currency } = nextProps;
      const { tx, address, balanceChanged } = info;

      if (info !== this.props.info || currency !== this.props.currency) {
        this.setState({
          fiatAmount: '',
          fiatAmountOnDate: '',
          maxFeeIncrease: 0, // getMaxFeeIncrease(tx, this.coinid.unspent),
        });

        this._refreshFiatAmount(balanceChanged, currency);

        if (tx.time) {
          this._refreshFiatAmountOnDate(balanceChanged, currency, tx.time);
        }

        this.noteHelper.loadNote(tx, address).then(note => this.setState({ note }));
      }
    }
  }

  _refreshFiatAmount = (amount, currency) => {
    this.exchangeHelper.convert(amount, currency).then(fiatAmount => this.setState({ fiatAmount }));
  };

  _refreshFiatAmountOnDate = (amount, currency, time) => {
    this.exchangeHelper
      .convertOnTime(amount, currency, time)
      .then(fiatAmountOnDate => this.setState({ fiatAmountOnDate }));
  };

  _open = () => {
    this.elModal._open();
  };

  _close = () => {
    this.elModal._close();
  };

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

  _onOpened = () => {
    this.props.onOpened();
  };

  _onClosed = () => {
    this.props.onClosed();
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

  render() {
    const { currency, info, blockHeight } = this.props;

    const getContent = () => {
      if (!info) return null;

      const { tx, address, balanceChanged } = info;
      const {
        fiatAmount,
        fiatAmountOnDate,
        note,
        ticker,
        recommendedConfirmations,
        maxFeeIncrease,
      } = this.state;
      const { time, fees, size } = tx;
      const date = !time ? '-' : moment.unix(time).format('H:mm:ss - MMM D, YYYY');

      const confirmations = getConfirmationsFromBlockHeight(tx, blockHeight);

      const renderToolBox = () => {
        if (maxFeeIncrease <= 0) {
          return null;
        }

        return (
          <React.Fragment>
            <View style={styles.separator} />
            <COINiDTransport
              getData={this._getBumpFeeData}
              handleReturnData={this._handleReturnData}
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
            <FontScale
              fontSizeMax={fontSize.h2}
              fontSizeMin={fontSize.h2 / 3}
              text={`${numFormat(fiatAmount, currency)} ${currency}`}
              widthScale={0.65}
            >
              {({ fontSize: variableFontSize, text }) => (
                <Text style={[styles.fiatText, { fontSize: variableFontSize }]}>{text}</Text>
              )}
            </FontScale>
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
                textContentType={false}
                onFocus={(e) => {
                  this.elModal._setKeyboardOffset(
                    this.refNoteBottom - this.refContHeight + 8 - this.refContScroll,
                  );
                }}
              />
            </RowInfo>
            <View style={styles.separator} />
            <RowInfo title="Fee">{`${numFormat(fees, ticker)} ${ticker}`}</RowInfo>
            <RowInfo title="Size">{`${size} bytes`}</RowInfo>
            <RowInfo title={`${currency} on completion`}>
              {`${numFormat(fiatAmountOnDate, currency)} ${currency}`}
            </RowInfo>
            <View style={styles.separator} />
            <RowInfo title="Included in TXID" multiLine selectable>
              {tx.txid}
            </RowInfo>
            {renderToolBox()}
          </ScrollView>
          <View style={styles.footer} />
        </View>
      );
    };

    return (
      <DetailsModal
        ref={(c) => {
          this.elModal = c;
        }}
        title="Transaction Details"
        onOpened={this._onOpened}
        onClosed={this._onClosed}
        avoidKeyboard
        avoidKeyboardOffset={40}
      >
        {getContent()}
      </DetailsModal>
    );
  }
}

TransactionDetails.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

TransactionDetails.childContextTypes = {
  theme: PropTypes.string,
};

TransactionDetails.propTypes = {
  tx: PropTypes.object,
  txDetailsInfo: PropTypes.object,
  currency: PropTypes.string,
  theme: PropTypes.string,
};

TransactionDetails.defaultProps = {
  fiatAmount: 0.0,
  // fiatAmountOnTxTime: 0.0,
  currency: Settings.currency,
  onClosed: () => {},
  onOpened: () => {},
  theme: 'light',
};
