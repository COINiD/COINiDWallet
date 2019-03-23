import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { fontWeight } from '../config/styling';
import {
  Button, CancelButton, Text, COINiDTransport,
} from '../components';

import WalletContext from '../contexts/WalletContext';

const styles = StyleSheet.create({
  container: {
    marginBottom: 11,
    marginHorizontal: 10,
  },
  textContainer: {
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default class ValidateAddress extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    address: PropTypes.string.isRequired,
    dialogRef: PropTypes.shape({}).isRequired,
  };

  _getValidateData = () => {
    const { coinid } = this.context;
    const { address } = this.props;

    const valData = coinid.buildValCoinIdData(address);
    return Promise.resolve(valData);
  };

  render() {
    const { dialogGoBack } = this.context;

    const renderTransportContent = ({
      isSigning, signingText, cancel, submit,
    }) => {
      let disableButton = false;
      if (isSigning) {
        disableButton = true;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.textContainer}>
            The COINiD Vault will independently generate the expected receive address.
          </Text>
          <Text style={styles.textContainer}>
            If it generates a different address. The wallet might have been compromised or been
            created with a different private key.
          </Text>
          <Text style={[styles.textContainer, { ...fontWeight.bold }]}>
            In that case the receive address must not be used or shared!
          </Text>
          <Button
            onPress={submit}
            disabled={disableButton}
            isLoading={isSigning}
            loadingText={signingText}
          >
            Validate with COINiD Vault
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
        getData={this._getValidateData}
        onSent={dialogGoBack}
      >
        {renderTransportContent}
      </COINiDTransport>
    );
  }
}
