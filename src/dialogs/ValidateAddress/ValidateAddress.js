

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
} from 'react-native';
import { fontWeight } from '../../config/styling';
import {
  Button, DetailsModal, Text, COINiDTransport,
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
    this.transportRef._submit(undefined, true);
  };

  _getValidateData = () => {
    const { coinid } = this.context;
    const valData = coinid.buildValCoinIdData(this.address);
    return Promise.resolve(valData);
  }

  _close = () => {
    this.refModal._close();
  };

  render() {
    const renderStatus = ({ signingText, signingCode }) => {
      if (signingCode) {
        return (
          <React.Fragment>
            <Text
              style={{
                color: '#8A8A8F',
                fontSize: 22,
                marginBottom: 8,
                marginTop: 25,
                textAlign: 'center',
              }}
            >
              Connect with code
            </Text>
            <Text
              style={{
                color: '#617AF7',
                fontSize: 28,
                marginBottom: 32,
                textAlign: 'center',
                ...fontWeight.bold,
              }}
            >
              {signingCode}
            </Text>
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          <Text
            style={{
              color: '#8A8A8F',
              fontSize: 22,
              marginBottom: 8,
              marginTop: 25,
              textAlign: 'center',
            }}
          >
            Status
          </Text>
          <Text
            style={{
              color: '#617AF7',
              fontSize: 22,
              marginBottom: 32,
              textAlign: 'center',
              ...fontWeight.bold,
            }}
          >
            {signingText}
          </Text>
        </React.Fragment>
      );
    };

    const renderTransportContent = transportArgs => (
      <DetailsModal
        ref={(c) => {
          this.refModal = c;
        }}
        title="Validate address"
        onClosed={this._onClosed}
      >
        <View style={styles.container}>
          {renderStatus(transportArgs)}
          <Button style={styles.cancelButton} onPress={this._close}>
            Cancel
          </Button>
        </View>
      </DetailsModal>
    );

    return (
      <COINiDTransport
        ref={(c) => { this.transportRef = c; }}
        getData={this._getValidateData}
        onSent={this._close}
        onBLEInit={() => { this.refModal._open(); }}
        onBLEFail={() => { this.refModal._close(); }}
      >
        { renderTransportContent }
      </COINiDTransport>
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
