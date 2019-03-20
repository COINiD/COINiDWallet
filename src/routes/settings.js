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
  Reset: {
    screen: SettingsRoute,
    title: 'Remove account',
  },
};

export const getSettingsNavigator = cardStyle => createStackNavigator(settingRoutes, {
  animationEnabled: true,
  headerMode: 'none',
  cardStyle,
});
