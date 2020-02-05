import { createStackNavigator } from 'react-navigation';
import SettingsRoute from '../components/SettingsRoute';

export const settingRoutes = {
  Home: {
    screen: SettingsRoute,
    swipeEnabled: false,
    title: 'settings.settings.title',
    isHome: true,
  },
  Passcode: {
    screen: SettingsRoute,
    title: 'settings.requireunlocking.title',
  },
  OfflineTransport: {
    screen: SettingsRoute,
    title: 'settings.offlinetransport.title',
  },
  PreferredCurrency: {
    screen: SettingsRoute,
    title: 'settings.preferredcurrency.title',
  },
  Language: {
    screen: SettingsRoute,
    title: 'settings.language.title',
  },
  SignMessage: {
    screen: SettingsRoute,
    title: 'settings.signmessage.title',
  },
  About: {
    screen: SettingsRoute,
    title: 'settings.about.title',
  },
  AccountList: {
    screen: SettingsRoute,
    title: 'settings.selectaccount.title',
  },
  AccountInformation: {
    screen: SettingsRoute,
    title: 'settings.accountinformation.title',
  },
};

export const getSettingsNavigator = cardStyle => createStackNavigator(settingRoutes, {
  animationEnabled: true,
  headerMode: 'none',
  cardStyle,
});
