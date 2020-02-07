import Home from './Home';
import Passcode from './Passcode';
import OfflineTransport from './OfflineTransport';
import PreferredCurrency from './PreferredCurrency';
import Language from './Language';
import SignMessage from './SignMessage';
import About from './About';
import AccountList from './AccountList';
import AccountInformation from './AccountInformation';

const SettingsTree = state => ({
  Home: Home(state),
  Passcode: Passcode(state),
  OfflineTransport: OfflineTransport(state),
  PreferredCurrency: PreferredCurrency(state),
  Language: Language(state),
  SignMessage: SignMessage(state),
  About: About(state),
  AccountList: AccountList(state),
  AccountInformation: AccountInformation(state),
});

export default SettingsTree;
