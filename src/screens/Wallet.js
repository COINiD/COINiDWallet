import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Loading } from '../components';
import { InstalledWallet, Setup } from '.';
import { COINiDNotFound, SelectColdTransportType, QRDataSender } from '../dialogs';

import GlobalContext from '../contexts/GlobalContext';
import WalletContext from '../contexts/WalletContext';

import { colors } from '../config/styling';

const themedStyleGenerator = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.getTheme(theme).background,
    borderRadius: 16,
    paddingBottom: getBottomSpace(),
  },
});

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
      modals: {
        notFoundModal: this.notFoundModal,
        coldTransportModal: this.coldTransportModal,
        qrDataSenderModal: this.qrDataSenderModal,
      },
    };
  }

  componentDidMount() {
    this._checkAccount();
  }

  get _content() {
    const { isLoading, isInstalled, hasBeenSetup } = this.state;
    const {
      hideSensitive, onBuild, onBuildReady, navigation, blurScreen,
    } = this.props;

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
      <InstalledWallet
        settingHelper={this.settingHelper}
        onBuild={onBuild}
        onReady={onBuildReady}
        navigation={navigation}
        blurScreen={blurScreen}
        hideSensitive={hideSensitive}
        hasBeenSetup={hasBeenSetup}
      />
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

  _checkAccount = (hasBeenSetup) => {
    this.coinid
      .getAccount()
      .then((account) => {
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
      return true;
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
      modals: {
        notFoundModal: this.notFoundModal,
        coldTransportModal: this.coldTransportModal,
        qrDataSenderModal: this.qrDataSenderModal,
      },
    };

    return contextValue;
  };

  _renderGlobalContextConsumer = (globalContext) => {
    const { styles } = this.state;

    return (
      <WalletContext.Provider value={{ ...this._getWalletContextValue(), globalContext }}>
        <View style={styles.container}>
          {this._content}
          <COINiDNotFound
            ref={(c) => {
              this.notFoundModal = c;
            }}
          />
          <SelectColdTransportType
            ref={(c) => {
              this.coldTransportModal = c;
            }}
          />
          <QRDataSender
            ref={(c) => {
              this.qrDataSenderModal = c;
            }}
          />
        </View>
      </WalletContext.Provider>
    );
  };

  render() {
    return <GlobalContext.Consumer>{this._renderGlobalContextConsumer}</GlobalContext.Consumer>;
  }
}

Wallet.childContextTypes = {
  coinid: PropTypes.object,
  settingHelper: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
  modals: PropTypes.object,
  navigation: PropTypes.object,
};

Wallet.propTypes = {
  navigation: PropTypes.object,
  coinid: PropTypes.object,
  settingHelper: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

Wallet.defaultProps = {
  type: 'hot',
  theme: 'light',
  hideSensitive: false,
};

export default Wallet;
