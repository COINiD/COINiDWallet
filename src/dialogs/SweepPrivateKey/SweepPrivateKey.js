import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import {
  Button, CancelButton, DetailsModal, Text, COINiDTransport,
} from '../../components';
import { SweepKeyDetails } from '..';
import styles from './styles';

export default class SweepPrivateKey extends PureComponent {
  constructor(props, context) {
    super(props);
    const { coinid } = context;
    const { coinTitle } = coinid;

    this.state = {
      coinTitle,
    };
  }

  getChildContext() {
    const { theme: propsTheme } = this.props;
    const { theme: contextTheme } = this.context;

    return {
      theme: propsTheme || contextTheme,
    };
  }

  _open = (address) => {
    this.address = address;
    this.refModal._open();
  };

  _getTransportData = () => {
    const { coinid } = this.context;
    const valData = coinid.buildSwpCoinIdData(this.address);
    return Promise.resolve(valData);
  };

  _handleReturnData = (data) => {
    const [, addressData] = data.split('/');
    const inputAddressInfo = addressData.split('+').map((e) => {
      const [type, address, compressedStr] = e.split('*');
      return { type, address, compressed: compressedStr === '1' };
    });

    // open PrivateKeyDetails with one output address and input addresses as argument.
    this._close();
    setTimeout(() => this.refSweepKeyDetails._open(inputAddressInfo), 100);
  };

  _close = () => {
    this.refModal._close();
  };

  _onOpened = () => {
    const { onOpened } = this.props;
    onOpened();
  };

  _onClosed = () => {
    const { onClosed } = this.props;
    onClosed();
  };

  render() {
    const { onOpened, onClosed } = this.props;
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
      <React.Fragment>
        <DetailsModal
          ref={(c) => {
            this.refModal = c;
          }}
          title="Sweep Private Key"
          onClosed={this._onClosed}
          onOpened={this._onOpened}
        >
          <COINiDTransport
            ref={(c) => {
              this.transportRef = c;
            }}
            getData={this._getTransportData}
            handleReturnData={this._handleReturnData}
          >
            {renderTransportContent}
          </COINiDTransport>
        </DetailsModal>
        <SweepKeyDetails
          ref={(c) => {
            this.refSweepKeyDetails = c;
          }}
          onClosed={onClosed}
          onOpened={onOpened}
        />
      </React.Fragment>
    );
  }
}

SweepPrivateKey.contextTypes = {
  coinid: PropTypes.shape({}),
  type: PropTypes.string,
  theme: PropTypes.string,
};

SweepPrivateKey.childContextTypes = {
  theme: PropTypes.string,
};

SweepPrivateKey.propTypes = {
  theme: PropTypes.string,
};

SweepPrivateKey.defaultProps = {
  theme: 'light',
};
