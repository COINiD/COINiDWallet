import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { fontWeight } from '../config/styling';
import {
  Button, CancelButton, Text, COINiDTransport,
} from '../components';
import { t, withLocaleContext } from '../contexts/LocaleContext';

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

class ValidateAddress extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    address: PropTypes.string.isRequired,
  };

  _getValidateData = () => {
    const { coinid } = this.context;
    const { address } = this.props;

    const valData = coinid.buildValCoinIdData(address);
    return Promise.resolve(valData);
  };

  _handleReturnData = () => {
    const { dialogNavigateToExisting } = this.context;
    dialogNavigateToExisting('Receive');
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
          <Text style={styles.textContainer}>{t('actionmenus.validateaddress.text1')}</Text>
          <Text style={styles.textContainer}>{t('actionmenus.validateaddress.text2')}</Text>
          <Text style={[styles.textContainer, { ...fontWeight.bold }]}>
            {t('actionmenus.validateaddress.text3')}
          </Text>
          <Button
            onPress={() => {
              submit(undefined, true);
            }}
            disabled={disableButton}
            isLoading={isSigning}
            loadingText={signingText}
          >
            {t('validateaddress.button')}
          </Button>
          <CancelButton show={isSigning} onPress={cancel} marginTop={16}>
            {t('generic.cancel')}
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
        handleReturnData={this._handleReturnData}
        parentDialog="ValidateAddress"
      >
        {renderTransportContent}
      </COINiDTransport>
    );
  }
}

export default withLocaleContext(ValidateAddress);
