import React, { PureComponent } from 'react';
import {
  View, Image, Platform, Linking, StyleSheet,
} from 'react-native';
import { Text, Button } from '../components';

import { fontWeight } from '../config/styling';

const imageFiles = {
  coinid_icon: require('../assets/images/coinid_icon.png'),
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinidIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  text: {
    marginBottom: 24,
    fontSize: 16,
    color: '#000',
    ...fontWeight.normal,
  },
});

export default class COINiDNotFound extends PureComponent {
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
  };

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.coinidIcon} source={imageFiles.coinid_icon} />
        <Text style={styles.text}>
          To setup your hot wallet you need to have COINiD Vault installed on this device.
        </Text>
        <Button onPress={this._download}>
          {Platform.OS === 'android' ? 'Download on the Play Store' : 'Download on the App Store'}
        </Button>
      </View>
    );
  }
}
