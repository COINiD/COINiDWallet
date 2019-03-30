import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TextInput, Alert,
} from 'react-native';
import { Text, Button } from '../components';
import { fontWeight } from '../config/styling';
import parentStyles from './styles/common';
import styleMerge from '../utils/styleMerge';

import WalletContext from '../contexts/WalletContext';

const styles = styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 16,
      paddingTop: 0,
    },
    text: {
      marginBottom: 24,
      fontSize: 16,
      color: '#000',
      ...fontWeight.normal,
    },
  }),
);

export default class InputPublicKey extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    dialogRef: PropTypes.shape({}).isRequired,
    onContinue: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props);

    const {
      coinid,
      globalContext: { settingHelper },
    } = context;

    this.coinid = coinid;
    this.settingHelper = settingHelper;

    this.state = {
      publicKey: '',
    };
  }

  _verifyPublicKey = (data) => {
    const pubKeyData = data.split('/')[1];
    const pubKeyArray = this.coinid.createPubKeyArrayFromDataString(pubKeyData);
    const account = this.coinid.getAccountFromPubKeyArray(pubKeyArray);

    if (account === undefined) {
      throw 'The input public key is invalid';
    }

    return true;
  };

  _continue = () => {
    const { publicKey } = this.state;
    const { onContinue } = this.props;
    const { type, dialogCloseAndClear } = this.context;
    const data = `coinid://PUB/${publicKey}`;

    try {
      this._verifyPublicKey(data.split('://')[1]);

      onContinue(data);

      if (type === 'hot') {
        this.settingHelper.update('usePasscode', false); // disable passcode if creating hot wallet via publickey
      }

      dialogCloseAndClear(true);
    } catch (err) {
      Alert.alert('Pubkey invalid', `${err}`);
    }
  };

  _onChangePublicKey = (publicKey) => {
    this.setState({ publicKey });
  };

  render() {
    const { dialogRef } = this.props;

    return (
      <View
        style={styles.container}
        onLayout={(e) => {
          this.refContHeight = e.nativeEvent.layout.height;
        }}
      >
        <Text style={styles.formLabel}>Public key data</Text>
        <View
          style={styles.formItemRow}
          onFocus={() => {
            dialogRef._setKeyboardOffset(this.refAmountBottom - this.refContHeight + 8);
          }}
          onLayout={(e) => {
            this.refAmountBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
          }}
        >
          <TextInput
            style={[styles.formItemInput]}
            autoCorrect={false}
            spellCheck={false}
            textContentType="none"
            returnKeyType="done"
            onChangeText={this._onChangePublicKey}
            underlineColorAndroid="transparent"
            blurOnSubmit
            multiline
          />
        </View>
        <Button big onPress={this._continue} style={{ marginTop: 24 }}>
          Create Wallet
        </Button>
      </View>
    );
  }
}
