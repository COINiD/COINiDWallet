import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  Linking,
  StatusBar,
  AppState,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';

import LottieView from 'lottie-react-native';
import { BlurView } from 'react-native-blur';
import SplashScreen from 'react-native-splash-screen';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { addressFunctionP2PKH } from 'coinid-address-functions';

import TranslatedText from './TranslatedText';

import { withGlobalSettings } from '../contexts/GlobalContext';

import { colors, fontSize, fontWeight } from '../config/styling';
import Settings from '../config/settings';

const bitcoinMessage = require('bitcoinjs-message');
const randomBytes = require('randombytes');

const lottieFiles = {
  coinidLogo: require('../animations/coinid_logo_white.json'),
  gradient: require('../animations/gradient.json'),
  walletLogo: require('../animations/wallet_logo.json'),
  lock: require('../animations/lock.json'),
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
  },
  logoWrapper: {
    position: 'absolute',
    bottom: 27,
    width: 113,
    height: 37,
    alignSelf: 'center',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  walletLogoWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletLogo: {
    width: 212,
    height: 212,
    marginLeft: 1,
    marginBottom: Settings.isTestnet ? 0 : 32,
  },
  unlockButtonWrapper: {
    position: 'absolute',
    width: '100%',
    bottom: '16.34182909%',
    overflow: 'visible',
    alignItems: 'center',
  },
  unlockButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.getTheme('light').button,
    shadowRadius: 20,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTextWrapper: {
    position: 'absolute',
    top: 16 + getStatusBarHeight(),
    alignItems: 'center',
    width: '100%',
  },
  lockText: {
    color: colors.white,
    fontSize: fontSize.smaller,
    ...fontWeight.medium,
  },
  testnetText: {
    color: colors.white,
    fontSize: fontSize.small,
    ...fontWeight.medium,
    alignSelf: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});

const AnimatedBlurView = Platform.OS === 'ios'
  ? Animated.createAnimatedComponent(BlurView)
  : Animated.createAnimatedComponent(View);

class InactiveOverlay extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: true,
      opacity: new Animated.Value(1),
      gradientOpacity: new Animated.Value(1),
      logoYOffset: new Animated.Value(0),
      unlockButtonOpacity: new Animated.Value(0),
      unlockButtonYOffset: new Animated.Value(-30),
      unlockTextOpacity: new Animated.Value(0),
      unlockTextXOffset: new Animated.Value(-10),
      showUnlockButton: false,
      disableUnlockButton: false,
    };

    this.appState = 'initial';

    this.isViewLocked = true;
    this.activeTime = Date.now();
    this.inActiveTime = Date.now();
    this.hasUpdated = false;
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this.forceUpdate();
  }

  componentDidUpdate() {
    // do not hide splash until all children have been rendered...
    if (this.hasUpdated === false) {
      SplashScreen.hide();
      this.hasUpdated = true;
      this._initAnimation();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _addUrlListener = () => {
    global.disableInactiveOverlay();
    Linking.addEventListener('url', this._handleURLEvent);
  };

  _removeUrlListener = () => {
    global.enableInactiveOverlay();
    Linking.removeEventListener('url', this._handleURLEvent);
  };

  _handleURLEvent = (event) => {
    this._removeUrlListener();
    this._handleOpenURL(event.url);
  };

  _handleOpenURL = (url) => {
    if (!url) return 0;

    this.appState = 'active'; // to not interfere with unlocking..

    const data = url.split('://')[1];
    const splitted = data.split('/');
    const action = splitted[0];

    if (action === 'SAH') {
      this._leaveAnimation();
    }

    if (action === '2FA') {
      const signature = splitted.slice(1).join('/');

      if (signature && bitcoinMessage.verify(this.unlockMessage, this.verifyAddress, signature)) {
        this._leaveAnimation();
      } else {
        alert('Could not authenticate with COINiD Vault');
      }
    }
  };

  _getCOINiD = () => global.unlockCOINiD;

  _unlockWithCOINiD = () => {
    this.setState({ disableUnlockButton: true });
    setTimeout(() => {
      this.setState({ disableUnlockButton: false });
    }, 1000); // disable button for a short time to prevent double tapping..

    this._removeUrlListener();
    this._addUrlListener();

    if (1) {
      // simple login
      this.unlockAddress = this.unlockChain.get();
      this.unlockMessage = `unlock wallet ${randomBytes(16).toString('base64')}`; // should use random string for unlocking.

      const data = this._getCOINiD().buildSimpleAuthCoinIdData(
        this.unlockAddress,
        this.unlockMessage,
      );

      const { appReturnScheme } = Settings;
      const url = `coinid://${appReturnScheme}/${data}`;

      Linking.openURL(url);
    } else {
      // 2FA for viewlock...
      // derive P2PKH address at same position as current address because sign and verify message does not support segwit addresses.
      this.verifyAddress = addressFunctionP2PKH(
        this.unlockChain.__parent.derive(this.unlockChain.k),
      );

      this.unlockAddress = this.unlockChain.get();
      this.unlockMessage = `unlock wallet ${randomBytes(16).toString('base64')}`; // should use random string for unlocking.

      const data = this._getCOINiD().build2FACoinIdData(this.unlockAddress, this.unlockMessage);

      const { appReturnScheme } = Settings;
      const url = `coinid://${appReturnScheme}/${data}`;

      Linking.openURL(url);
    }
  };

  _handleAppStateChange = (newAppState) => {
    if (this.appState !== 'initial' && newAppState === 'active') {
      if (this.gradientAnim) {
        this.gradientAnim.play();
      }
    }

    if (global.isInactiveOverlayDisabled) {
      return;
    }

    if (this.appState !== newAppState) {
      if (newAppState === 'active') {
        this.activeTime = Date.now();
        this._leaveLockAnimation();
      } else {
        this.inActiveTime = Date.now();
        this._enterAnimation();
      }

      this.appState = newAppState;
    }
  };

  // initial animation coming from cold start
  _initAnimation = () => {
    this._leaveLockAnimation();
  };

  _checkIfShouldLock = () => {
    const inactiveDuration = this.activeTime - this.inActiveTime;
    const { settings } = this.props;

    return new Promise((resolve, reject) => {
      if (this._getCOINiD() === undefined) {
        return resolve(false);
      }

      this._getCOINiD()
        .getAccount()
        .then((account) => {
          this.unlockAccount = account;
          this.unlockChain = this.unlockAccount.getChain(1);

          if (
            settings.usePasscode
            && (this.isViewLocked || inactiveDuration > settings.lockAfterDuration)
          ) {
            return resolve(true);
          }
          return resolve(false);
        })
        .catch(() => resolve(false));
    });
  };

  _hideSensitive = () => {
    global._hideSensitive();
  };

  _showSensitive = () => {
    global._showSensitive();
  };

  _leaveLockAnimation = () => {
    if (!this.hasUpdated) {
      this.forceUpdate();
    } else {
      this._checkIfShouldLock().then((shouldLock) => {
        if (shouldLock) {
          this._lockAnimation();
        } else {
          this._leaveAnimation();
        }
      });
    }
  };

  // animation when screen no longer inactive.
  _leaveAnimation = () => {
    const { isVisible, opacity } = this.state;

    this._showSensitive();

    if (isVisible) {
      opacity.setValue(1);

      this._playLottieLockAnim()
        .then(() => this._removeLockAnimation(250, true))
        .then(() => {
          global._onUnlock();
          StatusBar.setHidden(false, 'slide');

          Animated.timing(opacity, {
            toValue: 0,
            easing: Easing.ease,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            this.setState({
              isVisible: false,
            });
          });
        });
    }
  };

  _fadeInGradientOpacity = () => new Promise((resolve, reject) => {
    const { gradientOpacity } = this.state;
    const opacityDuration = 400;

    Animated.timing(gradientOpacity, {
      toValue: 1,
      easing: Easing.ease,
      duration: opacityDuration,
      useNativeDriver: true,
    }).start(() => resolve());
  });

  _lockAnimation = () => {
    const { isVisible, opacity } = this.state;

    this.isViewLocked = true;

    if (isVisible) {
      opacity.setValue(1);
      StatusBar.setHidden(true, 'slide');

      this._fadeInGradientOpacity().then(() => {
        Animated.timing(this.state.logoYOffset, {
          toValue: -52,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          duration: 400,
          useNativeDriver: true,
        }).start();

        if (this.unlockTiming !== undefined) {
          this.unlockTiming.stop();
        }

        this.setState({ showUnlockButton: true });

        this.unlockTiming = Animated.timing(this.state.unlockButtonOpacity, {
          toValue: 1,
          easing: Easing.ease,
          duration: 400,
          useNativeDriver: true,
        });
        this.unlockTiming.start();

        Animated.timing(this.state.unlockButtonYOffset, {
          toValue: 0,
          easing: Easing.bezier(0.42, 0, 0.58, 1),
          duration: 400,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          Animated.timing(this.state.unlockTextOpacity, {
            toValue: 1,
            easing: Easing.ease,
            duration: 400,
            useNativeDriver: true,
          }).start();

          Animated.timing(this.state.unlockTextXOffset, {
            toValue: 0,
            easing: Easing.ease,
            duration: 400,
            useNativeDriver: true,
          }).start();
        }, 400);
      });
    }
  };

  _playLottieLockAnim = () => new Promise((resolve, reject) => {
    if (!this.isViewLocked) {
      return resolve();
    }

    setTimeout(() => {
      if (this.lockAnim) {
        this.lockAnim.play();
      }
      setTimeout(resolve, 100);
    }, 300);
  });

  _removeLockAnimation = (timeout, changeViewLock) => new Promise((resolve, reject) => {
    if (!this.isViewLocked) {
      return resolve();
    }

    if (changeViewLock) {
      this.isViewLocked = false;
    }

    timeout = timeout === undefined ? 250 : timeout;

    Animated.timing(this.state.unlockTextOpacity, {
      toValue: 0,
      easing: Easing.ease,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.timing(this.state.unlockTextXOffset, {
      toValue: -10,
      easing: Easing.ease,
      duration: 400,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(this.state.logoYOffset, {
        toValue: 0,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        duration: 400,
        useNativeDriver: true,
      }).start();

      Animated.timing(this.state.unlockButtonYOffset, {
        toValue: -30,
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        duration: 400,
        useNativeDriver: true,
      }).start();

      if (this.unlockTiming !== undefined) {
        this.unlockTiming.stop();
      }

      this.unlockTiming = Animated.timing(this.state.unlockButtonOpacity, {
        toValue: 0,
        easing: Easing.ease,
        duration: 400,
        useNativeDriver: true,
      });

      this.unlockTiming.start(() => {
        this.setState({ showUnlockButton: false });
        resolve();
      });
    }, timeout);
  });

  // animation when screen is inactive.
  _enterAnimation = () => {
    const { isVisible, opacity, gradientOpacity } = this.state;

    this._hideSensitive();

    if (!isVisible) {
      this.setState({
        isVisible: true,
      });

      Animated.timing(opacity, {
        toValue: 1,
        easing: Easing.ease,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {});
    }

    Animated.timing(gradientOpacity, {
      toValue: Platform.OS === 'ios' ? 0.8 : 1,
      easing: Easing.ease,
      duration: 400,
      useNativeDriver: true,
    }).start();

    if (Platform.OS === 'ios') {
      this._removeLockAnimation(0);
    }
  };

  render() {
    const {
      isVisible,
      opacity,
      gradientOpacity,
      logoYOffset,
      unlockButtonOpacity,
      unlockButtonYOffset,
      unlockTextOpacity,
      unlockTextXOffset,
    } = this.state;

    if (!isVisible) {
      return null;
    }

    const renderTestnet = () => {
      if (Settings.isTestnet) {
        return (
          <TranslatedText style={[styles.testnetText]}>inactiveoverlay.testnet</TranslatedText>
        );
      }

      return null;
    };

    return (
      <AnimatedBlurView style={[styles.container, { opacity }]} blurType="light" blurAmount={6}>
        <Animated.View style={[styles.gradient, { opacity: gradientOpacity }]}>
          <LottieView
            source={lottieFiles.gradient}
            ref={(c) => {
              this.gradientAnim = c;
            }}
            resizeMode="cover"
            onLayout={() => {
              this.gradientAnim.play();
            }}
            loop
          />
        </Animated.View>

        <View style={styles.walletLogoWrapper}>
          <Animated.View
            style={{ transform: [{ translateY: logoYOffset }], marginBottom: 0 - 4 - 1 }}
          >
            <View style={[styles.walletLogo]}>
              <LottieView source={lottieFiles.walletLogo} />
            </View>
            {renderTestnet()}
          </Animated.View>
        </View>

        <Animated.View
          style={[
            styles.lockTextWrapper,
            {
              opacity: unlockTextOpacity,
              transform: [{ translateX: unlockTextXOffset }],
            },
          ]}
        >
          <TranslatedText style={styles.lockText}>inactiveoverlay.signtounlock</TranslatedText>
        </Animated.View>

        <Animated.View
          style={[
            styles.unlockButtonWrapper,
            {
              transform: [{ translateY: unlockButtonYOffset }],
              left: this.state.showUnlockButton ? 0 : -10000,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              this._unlockWithCOINiD();
            }}
            disabled={this.state.disableUnlockButton}
          >
            <Animated.View
              style={[
                styles.unlockButton,
                {
                  opacity: unlockButtonOpacity,
                },
              ]}
            >
              <View style={{ width: 80, height: 80 }}>
                <LottieView
                  source={lottieFiles.lock}
                  ref={(c) => {
                    this.lockAnim = c;
                  }}
                  loop={false}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <View style={[styles.logoWrapper]}>
          <LottieView source={lottieFiles.coinidLogo} />
        </View>
      </AnimatedBlurView>
    );
  }
}

InactiveOverlay.propTypes = {
  settings: PropTypes.shape({
    usePasscode: PropTypes.bool,
    lockAfterDuration: PropTypes.number,
  }).isRequired,
};

export default withGlobalSettings(InactiveOverlay);
