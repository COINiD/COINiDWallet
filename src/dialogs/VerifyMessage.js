import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, StyleSheet, View, TextInput, Platform, Clipboard,
} from 'react-native';
import { Button, Text } from '../components';
import VerifyMessageActionMenu from '../actionmenus/VerifyMessageActionMenu';

import WalletContext from '../contexts/WalletContext';

import styleMerge from '../utils/styleMerge';
import parentStyles from './styles/common';

const styles = styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    container: {
      paddingTop: 8,
    },
  }),
);

export default class SignMessage extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    dialogRef: PropTypes.shape({}).isRequired,
    setMoreOptionsFunc: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props);

    const { setMoreOptionsFunc } = props;

    const {
      coinid,
      globalContext: { showActionSheetWithOptions },
    } = context;
    this.coinid = coinid;

    setMoreOptionsFunc(this._onMoreOptions);

    this.state = {
      address: '',
      message: '',
      signature: '',
      showActionSheetWithOptions,
    };
  }

  _onMoreOptions = () => {
    const { showActionSheetWithOptions } = this.state;

    const actionMenu = new VerifyMessageActionMenu({
      showActionSheetWithOptions,
      onParseClipboard: this._parseClipboard,
    });

    actionMenu.show();
  };

  _parseClipboard = async () => {
    const coinTitle = this.coinid.coinTitle.toUpperCase();

    const re = new RegExp(
      `-----BEGIN ${coinTitle} SIGNED MESSAGE-----\n(.*?)\n-----BEGIN SIGNATURE-----\n(?!-----BEGIN SIGNATURE-----)([^\n]*)\n([^\n]*)\n-----END ${coinTitle} SIGNED MESSAGE-----`,
      's',
    );

    try {
      const clipboardData = await Clipboard.getString();
      const [, message, address, signature] = re.exec(clipboardData);

      this.setState({
        message,
        address,
        signature,
      });
    } catch (err) {
      Alert.alert(
        'Parsing error',
        'Could not parse clipboard data, make sure it is formatted correctly.',
      );
    }
  };

  _verifyMessage = () => {
    const { message, address, signature } = this.state;
    const { dialogCloseAndClear } = this.context;

    try {
      const verify = this.coinid.verifyMessage(message, address, signature);

      if (verify) {
        Alert.alert('Message verified', `Message verified to be from ${address}`);
        dialogCloseAndClear();
      }
    } catch (err) {
      Alert.alert('Verification error', `${err}`);
    }
  };

  render() {
    const { dialogRef } = this.props;
    const { message, address, signature } = this.state;

    return (
      <View style={styles.container}>
        <View
          style={styles.modalContent}
          onLayout={(e) => {
            this.refContHeight = e.nativeEvent.layout.height;
          }}
        >
          <View
            style={styles.formItem}
            onFocus={() => {
              dialogRef._setKeyboardOffset(this.refAddressBottom - this.refContHeight + 8);
            }}
            onLayout={(e) => {
              this.refAddressBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <Text style={styles.formLabel}>Address</Text>
            <View style={styles.formItemRow}>
              <TextInput
                keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                autoCorrect={false}
                spellCheck={false}
                value={address}
                textContentType="none"
                style={styles.formItemInput}
                onChangeText={(newAddress) => {
                  this.setState({ address: newAddress });
                }}
                underlineColorAndroid="transparent"
                testID="input-verify-address"
              />
            </View>
          </View>

          <View
            style={styles.formItem}
            onFocus={() => {
              dialogRef._setKeyboardOffset(this.refMessageBottom - this.refContHeight + 8);
            }}
            onLayout={(e) => {
              this.refMessageBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <Text style={styles.formLabel}>Message</Text>
            <View style={styles.formItemRow}>
              <TextInput
                keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                autoCorrect={false}
                spellCheck={false}
                value={message}
                textContentType="none"
                style={styles.formItemInput}
                multiline
                onChangeText={(newMessage) => {
                  this.setState({ message: newMessage });
                }}
                ref={(c) => {
                  this.messageRef = c;
                }}
                underlineColorAndroid="transparent"
                testID="input-verify-message"
              />
            </View>
          </View>

          <View
            style={styles.formItem}
            onFocus={() => {
              dialogRef._setKeyboardOffset(this.refSignatureBottom - this.refContHeight + 8);
            }}
            onLayout={(e) => {
              this.refSignatureBottom = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            }}
          >
            <Text style={styles.formLabel}>Signature</Text>
            <View style={styles.formItemRow}>
              <TextInput
                keyboardType={Platform.OS === 'ios' ? 'default' : 'visible-password'}
                autoCorrect={false}
                spellCheck={false}
                value={signature}
                textContentType="none"
                style={styles.formItemInput}
                onChangeText={(newSignature) => {
                  this.setState({ signature: newSignature });
                }}
                underlineColorAndroid="transparent"
                testID="input-verify-signature"
              />
            </View>
          </View>

          <Button onPress={this._verifyMessage} testID="button-verify">
            Verify message
          </Button>
        </View>
      </View>
    );
  }
}
