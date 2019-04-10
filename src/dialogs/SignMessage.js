import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Alert, StyleSheet, View, TextInput, Platform, Clipboard,
} from 'react-native';
import Share from 'react-native-share';
import {
  Button, CancelButton, Text, COINiDTransport,
} from '../components';

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
  };

  constructor(props, context) {
    super(props);

    const { coinid } = context;
    this.coinid = coinid;
    this.state = { address: this.coinid.getReceiveAddress(), message: '' };
  }

  _getTransportData = () => {
    const { address, message } = this.state;
    try {
      const valData = this.coinid.buildMsgCoinIdData(address, message);
      return Promise.resolve(valData);
    } catch (err) {
      Alert.alert('Validation Error', 'Make sure address belongs to this wallet.');
    }
  };

  _handleReturnData = (data) => {
    const { address, message } = this.state;
    const { dialogCloseAndClear, showStatus } = this.context;
    const signature = data
      .split('/')
      .slice(1)
      .join('/');
    const coinTitle = this.coinid.coinTitle.toUpperCase();

    const lines = [];
    lines.push(`-----BEGIN ${coinTitle} SIGNED MESSAGE-----`);
    lines.push(`${message}`);
    lines.push('-----BEGIN SIGNATURE-----');
    lines.push(`${address}`);
    lines.push(`${signature}`);
    lines.push(`-----END ${coinTitle} SIGNED MESSAGE-----`);
    const signedMessage = lines.join('\n');

    Clipboard.setString(signedMessage);
    dialogCloseAndClear();
    showStatus('Signed message copied to clipboard', {
      linkIcon: Platform.OS === 'ios' ? 'share-apple' : 'share-google',
      linkIconType: 'evilicon',
      onLinkPress: () => this._share(signedMessage),
    });
  };

  _share = (signedMessage) => {
    const options = {
      title: 'Share via',
      message: signedMessage,
    };

    Share.open(options)
      .then(() => {
        if (Platform.OS === 'ios') {
          this.showStatus('QR code shared successfully');
        }
      })
      .catch(() => {});
  };

  _renderTransportContent = ({
    isSigning, signingText, cancel, submit,
  }) => {
    let disableButton = false;
    if (isSigning) {
      disableButton = true;
    }

    const { dialogRef } = this.props;
    const { message, address } = this.state;

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
                ref={(c) => {
                  this.addressRef = c;
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

          <Button
            onPress={submit}
            disabled={disableButton}
            isLoading={isSigning}
            loadingText={signingText}
          >
            Sign message
          </Button>
          <CancelButton show={isSigning} onPress={cancel} marginTop={16}>
            Cancel
          </CancelButton>
        </View>
      </View>
    );
  };

  render() {
    return (
      <COINiDTransport
        getData={this._getTransportData}
        handleReturnData={this._handleReturnData}
        parentDialog="SignMessage"
      >
        {arg => this._renderTransportContent(arg)}
      </COINiDTransport>
    );
  }
}
