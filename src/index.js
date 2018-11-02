import React, { PureComponent } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { HomeStack } from './config/routes';
import { InactiveOverlay } from './components';

export default class CoinidWalletMyriad extends PureComponent {
  constructor(props): void {
    super(props);

    StatusBar.setHidden(true);
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          ...ifIphoneX(
            {
              marginBottom: 0,
              marginTop: 44,
            },
            {
              marginTop: Platform.OS === 'android' ? 0 : 20,
            },
          ),
        }}
      >
        <HomeStack />
        <InactiveOverlay />
      </View>
    );
  }
}
