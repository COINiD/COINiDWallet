

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Platform,
  Linking,
} from 'react-native';
import {
  DetailsModal,
  Text,
  Button,
} from '../../components';
import styles from './styles';


const imageFiles = {
  coinid_icon: require('../../assets/images/coinid_icon.png'),
};

export default class COINiDNotFound extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { };
  }

  getChildContext() {
    const { theme: propsTheme } = this.props;
    const { theme: contextTheme } = this.context;

    return {
      theme: propsTheme || contextTheme,
    };
  }

  _open = () => {
    this.detailsModal._open();
  }

  _close = () => {
    this.detailsModal._close();
  }

  _download = () => {
    let url = 'itms-apps://itunes.apple.com/us/app/apple-store/1362831898?mt=8';
    if (Platform.OS === 'android') {
      url = 'market://details?id=org.coinid.vault';
    }

    Linking.canOpenURL(url).then((canOpen) => {
      if (canOpen) {
        Linking.openURL(url);
      }
    });
  }

  render() {
    return (
      <DetailsModal
        ref={(c) => { this.detailsModal = c; }}
        title="COINiD Vault not installed"
      >
        <View style={styles.container}>
          <Image style={styles.coinidIcon} source={imageFiles.coinid_icon} />
          <Text style={styles.text}>
            To setup your hot wallet you need to have COINiD Vault installed on this device.
          </Text>
          <Button onPress={this._download}>
            {Platform.OS === 'android' ? 'Download on the Play Store' : 'Download on the App Store'}
          </Button>
        </View>
      </DetailsModal>
    );
  }
}

COINiDNotFound.contextTypes = {
  theme: PropTypes.string,
};

COINiDNotFound.childContextTypes = {
  theme: PropTypes.string,
};

COINiDNotFound.propTypes = {
  theme: PropTypes.string,
};

COINiDNotFound.defaultProps = {
  theme: 'light',
};
