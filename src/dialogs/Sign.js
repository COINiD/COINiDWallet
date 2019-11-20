import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Alert, View } from 'react-native';
import Big from 'big.js';

import {
  Text,
  BatchList,
  RowInfo,
  FeeSlider,
  COINiDTransport,
  Button,
  CancelButton,
} from '../components';

import { numFormat } from '../utils/numFormat';

import { colors, fontWeight, fontSize } from '../config/styling';
import styleMerge from '../utils/styleMerge';
import parentStyles from './styles/common';

import WalletContext from '../contexts/WalletContext';

const styles = styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    summaryContainer: {
      width: '100%',
      zIndex: 100,
      position: 'relative',
      marginBottom: -16,
      paddingBottom: 16,
      backgroundColor: colors.getTheme('light').seeThrough,
    },
    batchedHeaderContainer: {
      width: '100%',
      zIndex: 100,
      position: 'relative',
      backgroundColor: colors.getTheme('light').seeThrough,
    },
    batchedHeader: {
      marginBottom: 8,
      ...fontWeight.medium,
    },
    totalError: { color: '#FA503C' },
    warningText: {
      fontSize: fontSize.small,
      color: colors.getTheme('light').warning,
      marginTop: -16,
      marginBottom: 16,
    },
  }),
);

class Sign extends Component {
  static contextType = WalletContext;

  static propTypes = {
    payments: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    balance: PropTypes.number.isRequired,
    realBalance: PropTypes.number.isRequired,
    navigation: PropTypes.shape({}).isRequired,
    dialogRef: PropTypes.shape({}).isRequired,
    onAddToBatch: PropTypes.func.isRequired,
    onRemoveFromBatch: PropTypes.func.isRequired,
    onQueuedTx: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props);

    this.fee = 0;
    const { ticker } = context.coinid;

    this.state = {
      total: 0,
      subTotal: 0,
      fee: this.fee,
      ticker,
    };
  }

  componentDidMount() {
    this._calculateTotal();
  }

  componentWillReceiveProps() {
    this._calculateTotal();
  }

  /*
  shouldComponentUpdate() {
    if (this.forceNoRender) {
      return false;
    }
    return true;
  }
  */

  _calculateTotal = () => {
    const { payments } = this.props;
    const { fee } = this;

    let subTotal = payments.reduce((a, c) => a.plus(c.amount), Big(0));
    const total = Number(subTotal.plus(fee));
    subTotal = Number(subTotal);

    this.setState({
      total,
      subTotal,
      fee,
    });
  };

  _verify = () => {
    let { total } = this.state;
    total = Number(total);

    const { payments, realBalance } = this.props;
    const errors = [];

    if (!payments.length) {
      errors.push({
        type: 'payments',
        message: 'No payments...',
      });
    }

    if (isNaN(total)) {
      errors.push({
        type: 'amount',
        message: 'Amount is not a number',
      });
    }

    if (total === Number(0)) {
      errors.push({
        type: 'amount',
        message: 'Amount cannot be zero',
      });
    }

    if (total > realBalance) {
      errors.push({
        type: 'balance',
        message: 'You do not have enough funds.',
      });
    }

    if (errors.length) {
      throw errors;
    }

    return true;
  };

  _getTransactionData = () => {
    const { coinid } = this.context;
    const { payments } = this.props;
    const { fee } = this.state;
    const isRBFEnabled = true;

    return new Promise((resolve, reject) => {
      try {
        if (this._verify()) {
          const transactionData = coinid.buildTransactionData(payments, fee, isRBFEnabled);
          const splitData = transactionData.split(':');
          this.savedUnsignedHex = splitData[3];
          return resolve(transactionData);
        }
      } catch (err) {
        Alert.alert(`${err}`);
        return reject(err);
      }
    });
  };

  _setFee = (fee) => {
    this.fee = fee;
    this._calculateTotal();
  };

  _onPressItem = (item) => {
    const { dialogNavigate } = this.context;
    const {
      navigation, balance, onAddToBatch, onRemoveFromBatch,
    } = this.props;

    dialogNavigate(
      'EditTransaction',
      {
        onAddToBatch,
        onRemoveFromBatch,
        balance,
        navigation,
        editItem: item,
        fee: this.fee,
      },
      this.context,
      false,
    );
  };

  _handleReturnData = (data) => {
    const { coinid } = this.context;
    const { payments, onQueuedTx } = this.props;
    const [action, hex] = data.split('/');

    const refresh = () => {
      // this.forceNoRender = true;
      onQueuedTx();
    };

    if (action === 'TX' && hex) {
      coinid
        .queueTx(hex, this.savedUnsignedHex)
        .then(queueData => coinid.noteHelper.saveNotes(queueData.tx, payments))
        .then(() => refresh())
        .catch((err) => {
          Alert.alert(`${err}`);
        });
    }
  };

  render() {
    const { subTotal, total, ticker } = this.state;
    const { payments } = this.props;

    const renderTransportContent = ({
      isSigning, signingText, cancel, submit,
    }) => {
      let validationError = [];
      try {
        this._verify();
      } catch (err) {
        validationError = err;
      }

      let disableButton = false;
      if (isSigning || validationError.length) {
        disableButton = true;
      }

      const renderError = () => {
        if (!validationError.length) {
          return null;
        }

        return validationError.map(({ message }, i) => (
          <Text key={i} style={styles.warningText}>
            {message}
          </Text>
        ));
      };

      return (
        <View style={styles.modalContent}>
          <View style={styles.batchedHeaderContainer}>
            <Text style={styles.batchedHeader}>Batched Transactions</Text>
          </View>
          <BatchList onPress={this._onPressItem} batchedTxs={payments} disabled={isSigning} />
          <View style={styles.summaryContainer}>
            <View style={{ marginBottom: 24, marginTop: 16 }}>
              <FeeSlider
                onChange={(val) => {
                  this._setFee(val);
                }}
                amount={subTotal}
                batchedTransactions={payments}
                disabled={isSigning}
              />
            </View>

            <RowInfo
              style={[{ marginBottom: 24 }]}
              childStyle={validationError.length ? styles.totalError : {}}
              title="Total"
            >
              {`${numFormat(total, ticker)} ${ticker}`}
            </RowInfo>
            {renderError()}
            <Button
              style={styles.formButton}
              onPress={submit}
              disabled={disableButton}
              isLoading={isSigning}
              loadingText={signingText}
            >
              Sign with COINiD
            </Button>
            <CancelButton show={isSigning} onPress={cancel} marginTop={16}>
              Cancel
            </CancelButton>
          </View>
        </View>
      );
    };

    return (
      <COINiDTransport
        getData={this._getTransactionData}
        handleReturnData={this._handleReturnData}
        parentDialog="Sign"
      >
        {renderTransportContent}
      </COINiDTransport>
    );
  }
}

export default Sign;
