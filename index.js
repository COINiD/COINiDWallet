/**
 * @format
 */

import { AppRegistry, YellowBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

YellowBox.ignoreWarnings([
  'Unrecognized WebSocket',
  'Sending `didUpdateState`',
  'Warning: Async Storage',
  'Remote debugger is in a background',
  'Setting a timer for a long period',
]);

AppRegistry.registerComponent(appName, () => App);
