import React, { PureComponent } from 'react';
import {
  Platform, StatusBar, View, StyleSheet,
} from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

import { RootNavigator } from './routes/root';
import { InactiveOverlay } from './components';
import GlobalContext from './contexts/GlobalContext';
import StatusBoxContext from './contexts/StatusBoxContext';
import LocaleContext from './contexts/LocaleContext';

import { QRCodeProvider } from './contexts/QRCodeContext';
import { colors } from './config/styling';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    paddingTop: Platform.OS === 'android' ? 0 : getStatusBarHeight(true),
  },
});

class COINiDWallet extends PureComponent {
  constructor(props) {
    super(props);

    StatusBar.setHidden(true);
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
    }
  }

  render() {
    return (
      <QRCodeProvider>
        <GlobalContext.Provider>
          <LocaleContext.Provider>
            <StatusBoxContext.Provider>
              <View style={styles.container}>
                <RootNavigator />
                <InactiveOverlay />
              </View>
            </StatusBoxContext.Provider>
          </LocaleContext.Provider>
        </GlobalContext.Provider>
      </QRCodeProvider>
    );
  }
}

export default COINiDWallet;
