import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { Text, Button } from '../components';
import { colors, fontWeight } from '../config/styling';

import WalletContext from '../contexts/WalletContext';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manualPublic: {
    marginBottom: -16,
  },
  manualPublicText: {
    color: colors.gray,
  },
  text: {
    marginBottom: 24,
    fontSize: 16,
    color: '#000',
    ...fontWeight.normal,
  },
});

export default class SetupWallet extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    onContinue: PropTypes.func.isRequired,
    onContinuePublic: PropTypes.func.isRequired,
  };

  _continue = () => {
    const { onContinue } = this.props;
    onContinue();
  };

  _continuePublic = () => {
    const { onContinuePublic } = this.props;
    onContinuePublic();
  };

  render() {
    const { type } = this.context;

    const renderHotView = () => (
      <View style={styles.container}>
        <Text style={styles.text}>
          To setup your hot wallet you need to have the COINiD Vault app installed on this device.
        </Text>
        <Button big onPress={this._continue} testID="button-setup-continue">
          Continue with COINiD Vault
        </Button>
        <Button
          big
          link
          onPress={this._continuePublic}
          style={styles.manualPublic}
          textStyle={styles.manualPublicText}
          testID="button-setup-public-key"
        >
          Or enter public key manually
        </Button>
      </View>
    );

    const renderColdView = () => {
      const buttonText = 'Continue with COINiD Vault';
      const disableButton = false;

      return (
        <View style={styles.container}>
          <Text style={styles.text}>
            To setup your cold wallet you need to have the COINiD Vault app installed on a separate
            offline device.
          </Text>
          <Button
            big
            onPress={this._continue}
            disabled={disableButton}
            testID="button-setup-continue"
          >
            {buttonText}
          </Button>
          <Button
            big
            link
            onPress={this._continuePublic}
            style={styles.manualPublic}
            textStyle={styles.manualPublicText}
            testID="button-setup-public-key"
          >
            Or enter public key manually
          </Button>
        </View>
      );
    };

    return type === 'hot' ? renderHotView() : renderColdView();
  }
}
