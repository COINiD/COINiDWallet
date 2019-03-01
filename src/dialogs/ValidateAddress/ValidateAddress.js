import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { fontWeight } from '../../config/styling';
import {
  Button, CancelButton, DetailsModal, Text, COINiDTransport,
} from '../../components';
import styles from './styles';

export default class ValidateAddress extends PureComponent {
  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  _open = (address) => {
    this.address = address;
    this.refModal._open();
  };

  _getValidateData = () => {
    const { coinid } = this.context;
    const valData = coinid.buildValCoinIdData(this.address);
    return Promise.resolve(valData);
  };

  _close = () => {
    this.refModal._close();
  };

  render() {
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
      <DetailsModal
        ref={(c) => {
          this.refModal = c;
        }}
        title="Validate Address"
        onClosed={this._onClosed}
      >
        <COINiDTransport
          ref={(c) => {
            this.transportRef = c;
          }}
          getData={this._getValidateData}
          onSent={this._close}
        >
          {renderTransportContent}
        </COINiDTransport>
      </DetailsModal>
    );
  }
}

ValidateAddress.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

ValidateAddress.childContextTypes = {
  theme: PropTypes.string,
};

ValidateAddress.propTypes = {
  theme: PropTypes.string,
};

ValidateAddress.defaultProps = {
  theme: 'light',
};
