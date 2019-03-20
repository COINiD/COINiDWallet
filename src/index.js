import React, { PureComponent } from 'react';
import {
  Platform, StatusBar, View, Linking,
} from 'react-native';
import { ifIphoneX } from 'react-native-iphone-x-helper';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import bleCentral from 'react-native-p2p-transfer-ble-central';

import { RootNavigator } from './routes/root';
import { InactiveOverlay } from './components';
import SettingHelper from './utils/settingHelper';
import GlobalContext from './contexts/GlobalContext';
import projectSettings from './config/settings';

export default class CoinidWalletMyriad extends PureComponent {
  constructor(props): void {
    super(props);

    StatusBar.setHidden(true);
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
    }

    const settingHelper = SettingHelper(projectSettings.coin);

    this.state = {
      hasCOINiD: false,
      isBLESupported: false,
      settingHelper,
      settings: settingHelper.getAll(),
    };
  }

  async componentDidMount() {
    const { settingHelper } = this.state;
    settingHelper.addListener('updated', this._onSettingsUpdated);

    const hasCOINiD = await Linking.canOpenURL('coinid://');
    const isBLESupported = await bleCentral.isSupported();

    this.setState({
      hasCOINiD,
      isBLESupported,
    });
  }

  componentWillUnmount() {
    const { settingHelper } = this.state;
    settingHelper.removeListener('updated', this._onSettingsUpdated);
  }

  _onSettingsUpdated = (settings) => {
    this.setState({ settings });
  };

  _getGlobalContextValue = () => {
    const {
      hasCOINiD, isBLESupported, settings, settingHelper,
    } = this.state;

    return {
      hasCOINiD,
      isBLESupported,
      settings,
      settingHelper,
    };
  };

  render() {
    return (
      <ActionSheetProvider>
        <GlobalContext.Provider value={this._getGlobalContextValue()}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#000',
              ...ifIphoneX(
                {
                  marginBottom: 0,
                  paddingTop: 44,
                },
                {
                  marginTop: Platform.OS === 'android' ? 0 : 20,
                },
              ),
            }}
          >
            <RootNavigator />
            <InactiveOverlay />
          </View>
        </GlobalContext.Provider>
      </ActionSheetProvider>
    );
  }
}
