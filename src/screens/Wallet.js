import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Loading } from '../components';
import { InstalledWallet, Setup } from '.';

import GlobalContext from '../contexts/GlobalContext';
import WalletContext from '../contexts/WalletContext';
import DialogBoxContext from '../contexts/DialogBoxContext';
import StatusBoxContext from '../contexts/StatusBoxContext';
import { ExchangeRateContextProvider } from '../contexts/ExchangeRateContext';

import { colors } from '../config/styling';
import { memoize } from '../utils/generic';

const themedStyleGenerator = memoize(theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.getTheme(theme).background,
    borderRadius: 16,
    paddingBottom: getBottomSpace(),
  },
}));

class Wallet extends PureComponent {
  constructor(props) {
    super(props);

    const { coinid, theme } = this.props;

    this.coinid = coinid;

    this.state = {
      isLoading: true,
      isInstalled: false,
      hasBeenSetup: false,
      styles: themedStyleGenerator(theme),
    };
  }

  getChildContext() {
    const {
      coinid, settingHelper, type, theme, navigation,
    } = this.props;

    return {
      coinid,
      settingHelper,
      type,
      theme,
      navigation,
    };
  }

  componentDidMount() {
    this._checkAccount();
  }

  get _content() {
    const { isLoading, isInstalled, hasBeenSetup } = this.state;
    const { hideSensitive, onBuild, navigation } = this.props;

    if (isLoading) {
      return <Loading />;
    }

    if (!isInstalled) {
      return (
        <Setup
          ref={(c) => {
            this.walletRef = c;
          }}
          onReady={this._setupReady}
          onBuild={onBuild}
        />
      );
    }

    return (
      <ExchangeRateContextProvider>
        <InstalledWallet
          ref={(c) => {
            this.walletRef = c;
          }}
          settingHelper={this.settingHelper}
          navigation={navigation}
          hideSensitive={hideSensitive}
          hasBeenSetup={hasBeenSetup}
        />
      </ExchangeRateContextProvider>
    );
  }

  _onSnapTo = () => {
    if (this.walletRef && this.walletRef._onSnapTo) {
      this.walletRef._onSnapTo();
    }
  };

  _onSnapFrom = () => {
    if (this.walletRef && this.walletRef._onSnapFrom) {
      this.walletRef._onSnapFrom();
    }
  };

  _openSignMessage = () => {
    if (this.walletRef && this.walletRef._openSignMessage) {
      this.walletRef._openSignMessage();
    }
  };

  _openVerifyMessage = () => {
    if (this.walletRef && this.walletRef._openVerifyMessage) {
      this.walletRef._openVerifyMessage();
    }
  };

  _checkAccount = (hasBeenSetup) => {
    this.coinid
      .getAccount()
      .then(() => {
        this.setState({
          isLoading: false,
          isInstalled: true,
          hasBeenSetup,
        });
      })
      .catch(() => {
        this.setState({
          isLoading: false,
          isInstalled: false,
          hasBeenSetup,
        });
      });
  };

  _setupReady = (skipCheck) => {
    const { onBuildReady } = this.props;
    onBuildReady();

    if (skipCheck) {
      return;
    }

    this.setState({
      isLoading: true,
    });

    this._checkAccount(true);
  };

  _getWalletContextValue = () => {
    const {
      coinid, type, theme, navigation,
    } = this.props;

    const contextValue = {
      coinid,
      type,
      theme,
      navigation,
      setContextBridger: this._setContextBridger,
    };

    return contextValue;
  };

  _setContextBridger = (contextBridger) => {
    this.contextBridger = contextBridger;
  };

  _renderContent = (globalContext, dialogBoxContext, statusBoxContext) => {
    const { styles } = this.state;

    const context = {
      ...this._getWalletContextValue(),
      globalContext,
      ...dialogBoxContext,
      ...statusBoxContext,
    };

    if (this.contextBridger) {
      this.contextBridger(context);
    }

    return (
      <WalletContext.Provider value={context}>
        <View style={styles.container}>{this._content}</View>
      </WalletContext.Provider>
    );
  };

  render() {
    return (
      <StatusBoxContext.Consumer>
        {statusBoxContext => (
          <DialogBoxContext.Consumer>
            {dialogBoxContext => (
              <GlobalContext.Consumer>
                {globalContext => this._renderContent(globalContext, dialogBoxContext, statusBoxContext)
                }
              </GlobalContext.Consumer>
            )}
          </DialogBoxContext.Consumer>
        )}
      </StatusBoxContext.Consumer>
    );
  }
}

Wallet.childContextTypes = {
  coinid: PropTypes.shape({}),
  settingHelper: PropTypes.shape({}),
  type: PropTypes.string,
  theme: PropTypes.string,
  modals: PropTypes.shape({}),
  navigation: PropTypes.shape({}),
};

Wallet.propTypes = {
  navigation: PropTypes.shape({}).isRequired,
  coinid: PropTypes.shape({}).isRequired,
  settingHelper: PropTypes.shape({}).isRequired,
  type: PropTypes.string,
  theme: PropTypes.string,
  hideSensitive: PropTypes.bool,
  onBuild: PropTypes.func.isRequired,
  onBuildReady: PropTypes.func.isRequired,
};

Wallet.defaultProps = {
  type: 'hot',
  theme: 'light',
  hideSensitive: false,
};

export default Wallet;
