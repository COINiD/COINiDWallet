import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { DetailsModal, Text, Button } from '../components';
import { colors, fontWeight } from '../config/styling';

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
  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  _open = () => {
    this.detailsModal._open();
  };

  _close = () => {
    this.detailsModal._close();
  };

  _continue = () => {
    this._close();
    this.props.onContinue();
  };

  _continuePublic = () => {
    this._close();
    this.props.onContinuePublic();
  };

  render() {
    const { type } = this.context;

    const renderHotView = () => (
      <DetailsModal
        ref={(c) => {
          this.detailsModal = c;
        }}
        title="Setup your Hot Wallet"
      >
        <View style={styles.container}>
          <Text style={styles.text}>
            To setup your hot wallet you need to have the COINiD Vault app installed on this device.
          </Text>
          <Button big onPress={this._continue}>
            Continue with COINiD Vault
          </Button>
          <Button
            big
            link
            onPress={this._continuePublic}
            style={styles.manualPublic}
            textStyle={styles.manualPublicText}
          >
            Or enter public key manually
          </Button>
        </View>
      </DetailsModal>
    );

    const renderColdView = () => {
      const buttonText = 'Continue with COINiD Vault';
      const disableButton = false;

      return (
        <DetailsModal
          ref={(c) => {
            this.detailsModal = c;
          }}
          title="Setup your Cold Wallet"
        >
          <View style={styles.container}>
            <Text style={styles.text}>
              To setup your cold wallet you need to have the COINiD Vault app installed on a
              separate offline device.
            </Text>
            <Button big onPress={this._continue} disabled={disableButton}>
              {buttonText}
            </Button>
            <Button
              big
              link
              onPress={this._continuePublic}
              style={styles.manualPublic}
              textStyle={styles.manualPublicText}
            >
              Or enter public key manually
            </Button>
          </View>
        </DetailsModal>
      );
    };

    return type === 'hot' ? renderHotView() : renderColdView();
  }
}

SetupWallet.contextTypes = {
  theme: PropTypes.string,
  type: PropTypes.string,
};

SetupWallet.childContextTypes = {
  theme: PropTypes.string,
};

SetupWallet.propTypes = {
  theme: PropTypes.string,
};

SetupWallet.defaultProps = {
  theme: 'light',
};
