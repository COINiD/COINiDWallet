import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TextInput,
  Alert,
} from 'react-native';
import {
  DetailsModal,
  Text,
  Button,
} from '../../components';
import styles from './styles';

export default class InputPublicKey extends PureComponent {
  constructor(props, context) {
    super(props);

    this.coinid = context.coinid;
    this.settingHelper = context.settingHelper;

    this.state = {
      publicKey: '',
    };
  }

  getChildContext() {
    return {
      theme: this.props.theme ? this.props.theme : this.context.theme,
    };
  }

  _open = () => {
    this.detailsModal._open();
  }

  _close = () => {
    this.detailsModal._close();
  }

  _verifyPublicKey = (data) => {
    const pubKeyData = data.split('/')[1];
    const pubKeyArray = this.coinid.createPubKeyArrayFromDataString(pubKeyData);
    const account = this.coinid.getAccountFromPubKeyArray(pubKeyArray);

    if (account === undefined) {
      throw ('The input public key is invalid');
    }

    return true;
  }

  _continue = () => {
    const { publicKey } = this.state;
    const { onContinue } = this.props;
    const { type } = this.context;
    const data = `coinid://PUB/${publicKey}`;

    try {
      this._verifyPublicKey(data.split('://')[1]);
      onContinue(data);

      if (type === 'hot') {
        this.settingHelper.update('usePasscode', false); // disable passcode if creating hot wallet via publickey
      }

      this._close();
    } catch (err) {
      Alert.alert('Pubkey invalid', `${err}`);
    }
  }

  _onChangePublicKey = (publicKey) => {
    this.setState({publicKey});
  }

  render() {
    const { publicKey } = this.state;

    return (
      <DetailsModal
        ref={(c) => { this.detailsModal = c; }}
        title="Enter Public Key"
        avoidKeyboard
        avoidKeyboardOffset={40}
      >
        <View style={styles.container}>
          <Text style={styles.formLabel}>Public key data</Text>
          <View style={styles.formItemRow}>
            <TextInput
              style={[styles.formItemInput, {}]}
              value={publicKey}
              autoCorrect={false}
              spellCheck={false}
              textContentType={false}
              returnKeyType="done"
              onChangeText={this._onChangePublicKey}
              underlineColorAndroid="transparent"
              blurOnSubmit={true}
              multiline
            />
          </View>
          <Button big onPress={this._continue} style={{marginTop: 24}}>
              Create Wallet
          </Button>
        </View>
      </DetailsModal>
    );
  }
}

InputPublicKey.contextTypes = {
  theme: PropTypes.string,
  type: PropTypes.string,
  coinid: PropTypes.object,
  settingHelper: PropTypes.object,
};

InputPublicKey.childContextTypes = {
  theme: PropTypes.string,
};

InputPublicKey.propTypes = {
  theme: PropTypes.string,
  onContinue: PropTypes.func,
};

InputPublicKey.defaultProps = {
  theme: 'light',
  onContinue: () => {},
};
