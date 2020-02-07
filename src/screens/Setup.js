import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  View,
  Linking,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {
  Button, Text, CancelButton, COINiDTransport,
} from '../components';
import projectSettings from '../config/settings';
import { Build } from '.';
import { colors, fontWeight } from '../config/styling';

import WalletContext from '../contexts/WalletContext';
import { t, withLocaleContext } from '../contexts/LocaleContext';

import { memoize } from '../utils/generic';

const lottieFiles = {
  setuphot: require('../animations/setuphot.json'),
  setupcold: require('../animations/setupcold.json'),
};

const imageFiles = {
  coinid_icon: require('../assets/images/coinid_icon.png'),
};

const themedStyleGenerator = memoize(theme => StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  hotLottieWrapper: {
    width: 88,
    height: 146,
    marginTop: 16,
    marginBottom: 16,
  },
  coldLottieWrapper: {
    width: 200,
    height: 146,
    marginTop: 16,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  paragraph: {
    textAlign: 'center',
    marginBottom: 16,
  },
  linkWrapper: {
    height: 30,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  link: {
    fontSize: 16,
    color: '#617AF7',
    ...fontWeight.normal,
  },
  linkIcon: {
    height: 30,
    width: 30,
    marginLeft: 16,
  },
  buttonContainer: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: colors.getTheme(theme).background,
  },
  scrollView: {
    flex: 1,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scrollViewContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

class Setup extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    onReady: PropTypes.func.isRequired,
    onBuild: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props);

    const { coinid, theme } = context;
    this.coinid = coinid;

    this.state = {
      isBuilding: false,
      buildStatus: '',
      styles: themedStyleGenerator(theme),
    };
  }

  _onSnapTo = () => {
    if (this.lottieAnim !== undefined) {
      try {
        this.lottieAnim.play();
      } catch (err) {}
    }
  };

  _onSnapFrom = () => {};

  _checkForCOINiD = () => {
    const { type } = this.context;

    if (type === 'cold') {
      return Promise.resolve(true); // always resolve cold to true;
    }

    return Linking.canOpenURL('coinid://');
  };

  _handleReturnData = (data) => {
    this._buildWallet(data);
  };

  _buildWallet = (data) => {
    const { onReady, onBuild } = this.props;

    onBuild();

    const createAccount = (pubKeyArray) => {
      let usedCount = 0;
      let derivedCount = 0;

      const setBuildStatus = buildStatus => new Promise((resolve) => {
        this.setState({ buildStatus }, () => setTimeout(resolve, 100));
      });

      const createWallet = () => setBuildStatus(t('setup.build.settingup')).then(() => {
        const account = this.coinid.createWallet(pubKeyArray);
        return account;
      });

      const updateDiscoveryStatus = () => setBuildStatus(t('setup.build.discovery', { usedCount, derivedCount }));

      const discoverChain = chain => new Promise((resolve, reject) => {
        updateDiscoveryStatus().then(() => {
          this.coinid
            .discover(
              chain,
              (derivedAddresses) => {
                derivedCount += derivedAddresses.length;
                return updateDiscoveryStatus();
              },
              (usedAddressesObj) => {
                const usedAddresses = Object.values(usedAddressesObj).filter(e => e);

                usedCount += usedAddresses.length;
                return updateDiscoveryStatus();
              },
            )
            .then(resolve)
            .catch(reject);
        });
      });

      const save = () => {
        this.setState({ buildStatus: t('setup.build.saving') });
        return this.coinid.saveAll();
      };

      const onWalletReady = () => {
        this.setState({ buildStatus: t('setup.build.walletready') }, () => {
          setTimeout(() => {
            onReady();
            global.enableInactiveOverlay();
          }, 400);
        });
      };

      return createWallet()
        .then(() => discoverChain(0))
        .then(() => discoverChain(1))
        .then(save)
        .then(onWalletReady)
        .catch((err) => {
          this.coinid.account = undefined;
          onReady(true);
          global.enableInactiveOverlay();

          Alert.alert(t('setup.build.errorcreating'), `${err}`);
          this.setState({
            isBuilding: false,
          });
        });
    };

    const pubKeyData = data.split('/')[1];
    const pubKeyArray = this.coinid.createPubKeyArrayFromDataString(pubKeyData);
    if (pubKeyArray) {
      this.setState(
        {
          isBuilding: true,
          buildStatus: t('setup.build.wait'),
        },
        () => {
          this.coinid.pubKeyData = pubKeyData;
          createAccount(pubKeyArray);
        },
      );
    }
  };

  _selectAddressType = () => {
    const { dialogNavigate } = this.context;

    this._checkForCOINiD().then((hasCOINiD) => {
      if (!hasCOINiD) {
        dialogNavigate('COINiDNotFound');
        return;
      }

      const { supportedAddressTypes } = this.coinid.network;

      if (supportedAddressTypes.length === 1) {
        this._onSelectAddressType(supportedAddressTypes[0]);
      } else {
        dialogNavigate(
          'SelectAddressType',
          {
            onSelectAddressType: this._onSelectAddressType,
          },
          this.context,
          false,
        );
      }
    });
  };

  _showSetupWallet = (setupSubmit) => {
    const { dialogNavigate } = this.context;

    this.setupSubmit = setupSubmit;

    dialogNavigate(
      'SetupWallet',
      {
        onContinue: this._selectAddressType,
        onContinuePublic: this._enterPublicKey,
      },
      this.context,
    );
  };

  _enterPublicKey = () => {
    const { dialogNavigate } = this.context;

    dialogNavigate(
      'InputPublicKey',
      {
        onContinue: (data) => {
          const pubKeyData = data.split('://')[1];
          this._handleReturnData(pubKeyData);
        },
      },
      this.context,
      false,
    );
  };

  _onSelectAddressType = (addressType) => {
    this.setupSubmit(addressType, false, true);
  };

  _getSetupData = (addressType) => {
    const derivationPath = this.coinid.getDerivationPath(addressType, true);
    const { ticker } = this.coinid;
    const data = `PUB/${ticker}::${derivationPath}`;

    return Promise.resolve(data);
  };

  _openAbout = () => {
    Linking.openURL(projectSettings.aboutUrl);
  };

  _openOfflineGuide = () => {
    const url = Platform.OS === 'ios'
      ? projectSettings.offlineGuideUrl.ios
      : projectSettings.offlineGuideUrl.android;
    Linking.openURL(url);
  };

  _coldView = ({
    isSigning, signingText, cancel, submit,
  }) => {
    const { styles } = this.state;

    const renderButton = () => {
      let disableButton = false;
      if (isSigning) {
        disableButton = true;
      }

      return (
        <View style={[styles.buttonContainer]}>
          <Button
            big
            style={[styles.createBtn]}
            onPress={() => this._showSetupWallet(submit)}
            disabled={disableButton}
            isLoading={isSigning}
            loadingText={signingText}
            testID="button-setup-cold"
          >
            {t('setup.cold.start')}
          </Button>
          <CancelButton show={isSigning} onPress={cancel}>
            {t('generic.cancel')}
          </CancelButton>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.coldLottieWrapper}>
            <LottieView
              ref={(c) => {
                this.lottieAnim = c;
              }}
              source={lottieFiles.setupcold}
              loop={false}
              autoPlay
            />
          </View>
          <Text h1 center margin>
            {t('setup.welcome')}
          </Text>
          <Text h2 center margin>
            {t('setup.cold.setup')}
          </Text>
          <Text p center margin>
            {t('setup.cold.before')}
          </Text>

          <TouchableOpacity onPress={this._openOfflineGuide} style={styles.linkWrapper}>
            <Text style={styles.link}>{t('setup.cold.howto')}</Text>
            <Image style={styles.linkIcon} source={imageFiles.coinid_icon} />
          </TouchableOpacity>

          <Text p center margin>
            {t('setup.cold.text')}
          </Text>
        </ScrollView>

        {renderButton()}
      </View>
    );
  };

  _hotView = ({
    isSigning, signingText, cancel, submit,
  }) => {
    const { styles } = this.state;

    let disableButton = false;
    if (isSigning) {
      disableButton = true;
    }

    const renderButton = () => (
      <View style={styles.buttonContainer}>
        <Button
          big
          style={styles.createBtn}
          onPress={() => this._showSetupWallet(submit)}
          disabled={disableButton}
          isLoading={isSigning}
          loadingText={signingText}
          testID="button-setup-hot"
        >
          {t('setup.hot.start')}
        </Button>
        <CancelButton show={isSigning} onPress={cancel}>
          {t('generic.text')}
        </CancelButton>
      </View>
    );

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.hotLottieWrapper}>
            <LottieView
              ref={(c) => {
                this.lottieAnim = c;
              }}
              source={lottieFiles.setuphot}
              loop={false}
              autoPlay
            />
          </View>
          <Text h1 center margin>
            {t('setup.welcome')}
          </Text>
          <Text h2 center margin>
            {t('setup.hot.setup')}
          </Text>
          <Text p center margin>
            {t('setup.hot.text')}
          </Text>

          <TouchableOpacity onPress={this._openAbout} style={styles.linkWrapper}>
            <Text style={styles.link}>{t('setup.readmore')}</Text>
            <Image style={styles.linkIcon} source={imageFiles.coinid_icon} />
          </TouchableOpacity>

          <Text p center margin>
            {t('setup.hot.privatekeys')}
          </Text>
        </ScrollView>

        {renderButton()}
      </View>
    );
  };

  render() {
    const { isBuilding, buildStatus } = this.state;

    if (isBuilding) {
      return <Build status={buildStatus} />;
    }

    const renderView = (renderArgs) => {
      const { type } = renderArgs;
      if (type === 'cold') {
        return this._coldView(renderArgs);
      }

      return this._hotView(renderArgs);
    };

    const renderTransportContent = renderArgs => renderView(renderArgs);

    return (
      <View style={{ flex: 1 }}>
        <COINiDTransport
          getData={this._getSetupData}
          handleReturnData={this._handleReturnData}
          parentDialog="none"
        >
          {renderTransportContent}
        </COINiDTransport>
      </View>
    );
  }
}

export default withLocaleContext(Setup);
