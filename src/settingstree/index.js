import Home from './Home';
import Passcode from './Passcode';
import OfflineTransport from './OfflineTransport';
import PreferredCurrency from './PreferredCurrency';
import Reset from './Reset';
import SignMessage from './SignMessage';
import About from './About';
import ExportPublicKeys from './ExportPublicKeys';

const SettingsTree = state => ({
  Home: Home(state),
  Passcode: Passcode(state),
  OfflineTransport: OfflineTransport(state),
  PreferredCurrency: PreferredCurrency(state),
  Reset: Reset(state),
  SignMessage: SignMessage(state),
  About: About(state),
  ExportPublicKeys: ExportPublicKeys(state),
});

export default SettingsTree;
