import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, StyleSheet, View, TextInput, Platform,
} from 'react-native';
import { Button, Text } from '../components';

import WalletContext from '../contexts/WalletContext';

import styleMerge from '../utils/styleMerge';
import parentStyles from './styles/common';

const bitcoinMessage = require('bitcoinjs-message');

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
  };

  constructor(props, context) {
    super(props);

    const { coinid } = context;
    this.coinid = coinid;
    this.state = { address: '', message: '', signature: '' };
  }

  _verifyMessage = () => {
    const { message, address, signature } = this.state;
    const { dialogCloseAndClear } = this.context;
    const { network } = this.coinid;

    try {
      const verify = bitcoinMessage.verify(message, address, signature, network);

      if (verify) {
        Alert.alert('Verify message', 'Message successfully verified');
        dialogCloseAndClear();
      } else {
        Alert.alert(
          'Verification error',
          'Message could not be verified with the supplied signature and address',
        );
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
              />
            </View>
          </View>

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
              />
            </View>
          </View>

          <Button onPress={this._verifyMessage}>Verify message</Button>
        </View>
      </View>
    );
  }
}
