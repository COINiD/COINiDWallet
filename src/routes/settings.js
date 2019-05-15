import { createStackNavigator } from 'react-navigation';
import SettingsRoute from '../components/SettingsRoute';

export const settingRoutes = {
  Home: {
    screen: SettingsRoute,
    swipeEnabled: false,
    title: 'Settings',
    isHome: true,
  },
  Passcode: {
    screen: SettingsRoute,
    title: 'Require unlocking',
  },
  OfflineTransport: {
    screen: SettingsRoute,
    title: 'Offline transport',
  },
  PreferredCurrency: {
    screen: SettingsRoute,
    title: 'Preferred currency',
  },
  SignMessage: {
    screen: SettingsRoute,
    title: 'Sign message',
  },
  About: {
    screen: SettingsRoute,
    title: 'About',
  },
  AccountList: {
    screen: SettingsRoute,
    title: 'Select an account',
  },
  AccountInformation: {
    screen: SettingsRoute,
    title: 'Account information',
  },
};

export const getSettingsNavigator = cardStyle => createStackNavigator(settingRoutes, {
  animationEnabled: true,
  headerMode: 'none',
  cardStyle,
});
