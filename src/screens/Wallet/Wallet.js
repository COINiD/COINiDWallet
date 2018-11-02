import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Loading } from '../../components';
import { InstalledWallet, Setup } from '..';
import styles from './styles';
import { COINiDNotFound, SelectColdTransportType, QRDataSender } from '../../dialogs';

class Wallet extends PureComponent {
  constructor(props) {
    super(props);

    const { coinid } = this.props;

    this.coinid = coinid;

    this.state = {
      isLoading: true,
      isInstalled: false,
      hasBeenSetup: false,
    };
  }

  getChildContext() {
    const {
      coinid,
      settingHelper,
      type,
      theme,
      navigation,
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

  _onSnapTo = () => {
    if (this.walletRef !== undefined) {
      this.walletRef._onSnapTo();
    }
  }

  _onSnapFrom = () => {
    if (this.walletRef !== undefined) {
      this.walletRef._onSnapFrom();
    }
  }

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
          ref={(c) => { this.walletRef = c; }}
          onReady={this._setupReady}
          onBuild={onBuild}
        />
      );
    }

    return (
      <InstalledWallet
        ref={(c) => { this.walletRef = c; }}
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

  render() {
    const { theme } = this.props;
    const themeStyle = styles(theme);

    return (
      <View style={themeStyle.container}>
        {this._content}
        <COINiDNotFound
          ref={(c) => { this.notFoundModal = c; }}
        />
        <SelectColdTransportType
          ref={(c) => { this.coldTransportModal = c; }}
        />
        <QRDataSender
          ref={(c) => { this.qrDataSenderModal = c; }}
        />
      </View>
    );
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
