

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert, View } from 'react-native';
import Big from 'big.js';

import {
  Text, BatchList, RowInfo, FeeSlider, DetailsModal, COINiDTransport, Button, CancelButton,
} from '../../components';

import styles from './styles';
import { numFormat } from '../../utils/numFormat';

export default class Sign extends Component {
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

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  componentDidMount() {
    this._calculateTotal();
  }

  componentWillReceiveProps() {
    this._calculateTotal();
  }

  shouldComponentUpdate() {
    if (this.forceNoRender) {
      return false;
    }
    return true;
  }

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
  }

  _verify = () => {
    let { total } = this.state;
    total = Number(total);

    const { payments, balance } = this.props;
    const errors = [];

    if (!payments.length) {
      errors.push({
        type: 'payments',
        message: 'no payments...',
      });
    }

    if (isNaN(total)) {
      errors.push({
        type: 'amount',
        message: 'amount is not a number',
      });
    }

    if (total === Number(0)) {
      errors.push({
        type: 'amount',
        message: 'amount cannot be zero',
      });
    }

    if (total > balance) {
      errors.push({
        type: 'balance',
        message: 'not enough funds',
      });
    }

    if (errors.length) {
      throw (errors);
    }

    return true;
  }

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
  }

  _setFee = (fee) => {
    this.fee = fee;
    this._calculateTotal();
  }

  _open = () => {
    this.forceNoRender = false;
    this.forceUpdate();
    this.elModal._open();
  }

  _close = () => {
    this.forceNoRender = true;
    this.elModal._close();
  }

  _onPressItem = (item) => {
    const { sendModal } = this.props;
    this._close();
    sendModal._open(item);
  }

  _onOpened = () => {
    const { onOpened } = this.props;
    onOpened();
  }

  _onClosed = () => {
    const { onClosed } = this.props;
    onClosed();
  }

  _handleReturnData = (data) => {
    const { coinid } = this.context;
    const { payments, onQueuedTx } = this.props;
    const [action, hex] = data.split('/');

    const refresh = () => {
      this.forceNoRender = true;
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

      return (
        <View style={styles.modalContent}>
          <View style={styles.batchedHeaderContainer}>
            <Text style={styles.batchedHeader}>Batched Transactions</Text>
          </View>
          <BatchList
            onPress={this._onPressItem}
            batchedTxs={payments}
            disabled={isSigning}
          />
          <View style={styles.summaryContainer}>
            <View style={{ marginBottom: 24, marginTop: 16 }}>
              <FeeSlider
                onChange={(val) => { this._setFee(val); }}
                amount={subTotal}
                batchedTransactions={payments}
                disabled={isSigning}
              />
            </View>

            <RowInfo
              style={[{ marginBottom: 24 }]}
              childStyle={validationError.length ? { color: '#FA503C' } : {}}
              title="Total"
            >
              { `${numFormat(total, ticker)} ${ticker}` }
            </RowInfo>
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
        </View>);
    };

    return (
      <DetailsModal
        ref={(c) => { this.elModal = c; }}
        title="Sign Transactions"
        verticalPosition="flex-end"
        onOpened={this._onOpened}
        onClosed={this._onClosed}
      >
        <COINiDTransport
          getData={this._getTransactionData}
          handleReturnData={this._handleReturnData}
        >
          { renderTransportContent }
        </COINiDTransport>
      </DetailsModal>
    );
  }
}

Sign.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

Sign.childContextTypes = {
  theme: PropTypes.string,
};

Sign.propTypes = {
  payments: PropTypes.array,
  balance: PropTypes.number,
  theme: PropTypes.string,
};

Sign.defaultProps = {
  payments: [],
  balance: 0,
  theme: 'light',
};
