import { AppRegistry, YellowBox } from 'react-native';
import App from './App';

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated']);
AppRegistry.registerComponent('COINiDWallet', () => App);
