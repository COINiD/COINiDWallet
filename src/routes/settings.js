import { createStackNavigator } from 'react-navigation';
import SettingsRoute from '../components/SettingsRoute';

export const settingRoutes = {
  Home: {
    screen: SettingsRoute,
    swipeEnabled: false,
    title: 'settings',
    isHome: true,
  },
  Passcode: {
    screen: SettingsRoute,
    title: 'requireunlocking',
  },
  OfflineTransport: {
    screen: SettingsRoute,
    title: 'offlinetransport',
  },
  PreferredCurrency: {
    screen: SettingsRoute,
    title: 'preferredcurrency',
  },
  Language: {
    screen: SettingsRoute,
    title: 'language',
  },
  SignMessage: {
    screen: SettingsRoute,
    title: 'signmessage',
  },
  About: {
    screen: SettingsRoute,
    title: 'about',
  },
  AccountList: {
    screen: SettingsRoute,
    title: 'selectaccount',
  },
  AccountInformation: {
    screen: SettingsRoute,
    title: 'accountinformation',
  },
};

export const getSettingsNavigator = cardStyle => createStackNavigator(settingRoutes, {
  animationEnabled: true,
  headerMode: 'none',
  cardStyle,
});
