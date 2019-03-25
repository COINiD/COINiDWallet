import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import {
  Button, CancelButton, Text, COINiDTransport,
} from '../components';

import WalletContext from '../contexts/WalletContext';

const styles = StyleSheet.create({
  container: {
    marginBottom: 11,
    marginHorizontal: 10,
  },
});

export default class SweepPrivateKey extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    address: PropTypes.string.isRequired,
    dialogRef: PropTypes.shape({}).isRequired,
  };

  constructor(props, context) {
    super(props);

    const { coinid } = context;
    const { coinTitle } = coinid;
    this.coinid = coinid;

    this.state = {
      coinTitle,
    };
  }

  _close = (cb) => {
    const { dialogRef } = this.props;
    dialogRef._close(cb);
  };

  _getTransportData = () => {
    const { address } = this.props;

    const valData = this.coinid.buildSwpCoinIdData(address);
    return Promise.resolve(valData);
  };

  _handleReturnData = (data) => {
    const [, addressData] = data.split('/');
    const inputAddressInfo = addressData.split('+').map((e) => {
      const [type, address, compressedStr] = e.split('*');
      return { type, address, compressed: compressedStr === '1' };
    });

    const { dialogNavigate } = this.context;

    dialogNavigate(
      'SweepKeyDetails',
      {
        inputAddressInfo,
      },
      this.context,
    );
  };

  render() {
    const { coinTitle } = this.state;

    const renderTransportContent = ({
      isSigning, signingText, cancel, submit,
    }) => {
      let disableButton = false;
      if (isSigning) {
        disableButton = true;
      }

      return (
        <View style={styles.container}>
          <Text style={{ marginBottom: 24, textAlign: 'center' }}>
            You can scan and sweep any {coinTitle} private key in WIF, WIFC or BIP38 format.
          </Text>
          <Text style={{ marginBottom: 24, textAlign: 'center', fontWeight: 'bold' }}>
            The private key will be scanned and stored in your COINiD Vault.
          </Text>
          <Button
            onPress={submit}
            disabled={disableButton}
            isLoading={isSigning}
            loadingText={signingText}
          >
            Scan key with COINiD Vault
          </Button>
          <CancelButton show={isSigning} onPress={cancel} marginTop={16}>
            Cancel
          </CancelButton>
        </View>
      );
    };

    return (
      <COINiDTransport
        ref={(c) => {
          this.transportRef = c;
        }}
        getData={this._getTransportData}
        handleReturnData={this._handleReturnData}
        parentDialog="SweepPrivateKey"
      >
        {renderTransportContent}
      </COINiDTransport>
    );
  }
}
