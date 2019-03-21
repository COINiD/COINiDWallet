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
import { SelectAddressType, SetupWallet, InputPublicKey } from '../dialogs';
import Settings from '../config/settings';
import { Build } from '.';
import { colors, fontWeight } from '../config/styling';

const lottieFiles = {
  setuphot: require('../animations/setuphot.json'),
  setupcold: require('../animations/setupcold.json'),
};

const imageFiles = {
  coinid_icon: require('../assets/images/coinid_icon.png'),
};

const themedStyleGenerator = theme => StyleSheet.create({
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
});

class Setup extends PureComponent {
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
      this.lottieAnim.play();
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
    const createAccount = (pubKeyArray) => {
      let usedCount = 0;
      let derivedCount = 0;

      const setBuildStatus = buildStatus => new Promise((resolve) => {
        this.setState({ buildStatus }, () => setTimeout(resolve, 100));
      });

      const createWallet = () => setBuildStatus('Setting up your account...').then(() => {
        const account = this.coinid.createWallet(pubKeyArray);
        return account;
      });

      const updateDiscoveryStatus = () => setBuildStatus(`Account discovery (${usedCount}/${derivedCount})...`);

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
        this.setState({ buildStatus: 'Saving...' });
        return this.coinid.saveAll();
      };

      const onReady = () => {
        this.setState({ buildStatus: 'Your wallet is ready!' }, () => {
          setTimeout(() => {
            this.props.onReady();
            global.enableInactiveOverlay();
          }, 400);
        });
      };

      return createWallet()
        .then(() => discoverChain(0))
        .then(() => discoverChain(1))
        .then(save)
        .then(onReady)
        .catch((err) => {
          this.coinid.account = undefined;
          this.props.onReady(true);
          global.enableInactiveOverlay();

          Alert.alert('Error creating wallet', `${err}`);
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
          buildStatus: 'Please wait...',
        },
        () => {
          this.coinid.pubKeyData = pubKeyData;
          createAccount(pubKeyArray);
        },
      );
    }
  };

  _openNotFoundModal = () => {
    const {
      modals: { notFoundModal },
    } = this.context;
    notFoundModal._open();
  };

  _selectAddressType = () => {
    this._checkForCOINiD().then((hasCOINiD) => {
      if (!hasCOINiD) {
        this._openNotFoundModal();
        return false;
      }

      const { supportedAddressTypes } = this.coinid.network;

      if (supportedAddressTypes.length === 1) {
        this._onSelectAddressType(supportedAddressTypes[0]);
      } else {
        this.addressTypeModal._open();
      }
    });
  };

  _onReturnFromSelectAddressType = (addressType) => {
    this.addressTypeModal._close();
    this._onSelectAddressType(addressType);
  };

  _showSetupWallet = (setupSubmit) => {
    this.setupSubmit = setupSubmit;
    this.setupWalletModal._open();
  };

  _enterPublicKey = () => {
    this.inputPublicKeyModal._open();
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
    Linking.openURL(Settings.aboutUrl);
  };

  _openOfflineGuide = () => {
    const url = Platform.OS === 'ios' ? Settings.offlineGuideUrl.ios : Settings.offlineGuideUrl.android;
    Linking.openURL(url);
  };

  _coldView = ({
    isSigning, signingText, cancel, submit,
  }) => {
    const { styles } = this.state;

    const renderButton = () => {
      const buttonText = 'Start setup of cold wallet';
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
          >
            {buttonText}
          </Button>
          <CancelButton show={isSigning} onPress={cancel}>
            Cancel
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
            Welcome
          </Text>
          <Text h2 center margin>
            Setup your Cold Wallet
          </Text>
          <Text p center margin>
            Before you begin to setup your cold wallet you need to setup an offline device.
          </Text>

          <TouchableOpacity onPress={this._openOfflineGuide} style={styles.linkWrapper}>
            <Text style={styles.link}>How to setup an offline device</Text>
            <Image style={styles.linkIcon} source={imageFiles.coinid_icon} />
          </TouchableOpacity>

          <Text p center margin>
            Your cold wallet private keys are never exposed to an online device. Offline storage is
            the safest way to store your funds.
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
        >
          Start setup of hot wallet
        </Button>
        <CancelButton show={isSigning} onPress={cancel}>
          Cancel
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
            Welcome
          </Text>
          <Text h2 center margin>
            Setup your Hot Wallet
          </Text>
          <Text p center margin>
            Similar to a transaction account, funds stored on your hot wallet are available for easy
            and immediate access.
          </Text>

          <TouchableOpacity onPress={this._openAbout} style={styles.linkWrapper}>
            <Text style={styles.link}>Read more about COINiD</Text>
            <Image style={styles.linkIcon} source={imageFiles.coinid_icon} />
          </TouchableOpacity>

          <Text p center margin>
            Private keys are stored securely in the COINiD Vault installed on this device.
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

    const renderTransportContent = (renderArgs) => {
      const { isBLESupported } = renderArgs;

      return (
        <React.Fragment>
          {renderView(renderArgs)}
          <SelectAddressType
            ref={(c) => {
              this.addressTypeModal = c;
            }}
            onSelectAddressType={this._onReturnFromSelectAddressType}
          />
          <SetupWallet
            ref={(c) => {
              this.setupWalletModal = c;
            }}
            onContinue={this._selectAddressType}
            onContinuePublic={this._enterPublicKey}
            isBLESupported={isBLESupported}
          />
          <InputPublicKey
            ref={(c) => {
              this.inputPublicKeyModal = c;
            }}
            onContinue={(data) => {
              const pubKeyData = data.split('://')[1];
              this._handleReturnData(pubKeyData);
            }}
          />
        </React.Fragment>
      );
    };

    return (
      <View style={{ flex: 1 }}>
        <COINiDTransport getData={this._getSetupData} handleReturnData={this._handleReturnData}>
          {renderTransportContent}
        </COINiDTransport>
      </View>
    );
  }
}

Setup.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
  modals: PropTypes.object,
};

export default Setup;
