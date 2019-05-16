import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Animated, StyleSheet, View, Platform, StatusBar,
} from 'react-native';
import { SettingsHeader } from '../components';
import { colors } from '../config/styling';
import { settingRoutes, getSettingsNavigator } from '../routes/settings';
import SettingsTree from '../settingstree';
import StatusBoxContext from '../contexts/StatusBoxContext';

import GlobalContext from '../contexts/GlobalContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  cardPadding: {
    padding: 16,
  },
});

const SettingsNavigator = getSettingsNavigator([styles.content, styles.cardPadding]);

class Settings extends PureComponent {
  static router = SettingsNavigator.router;

  static propTypes = {
    navigation: PropTypes.shape({
      state: PropTypes.shape({
        params: PropTypes.shape({
          screenAnimator: PropTypes.shape({}).isRequired,
        }),
      }),
      goBack: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);

    const { navigation } = props;

    const { goBack } = navigation;
    const { slides, screenAnimator, screenLayout } = navigation.state.params;

    const activeWallets = slides.filter(e => e.coinid.account !== undefined);
    const hasAnyWallets = activeWallets.length > 0;
    const hasHotWallet = slides[0].coinid.account !== undefined;

    this.state = {
      screenAnimator,
      screenLayout,
      currentRoute: 'Settings',
      isHome: true,
      hasAnyWallets,
      hasHotWallet,
      activeWallets,
      slides,
      gotoRoute: this._gotoRoute,
      goBack,
      childGoBack: () => {},
    };
  }

  _close = () => {
    const { navigation } = this.props;
    const { goBack } = navigation;
    goBack();
  };

  _back = () => {
    const { childGoBack } = this.state;
    childGoBack();
  };

  _gotoRoute = (route, params) => {
    const { navigation } = this.props;
    const { navigate } = navigation;

    navigate(route, params);
  };

  _handleRouteChange = ({ routeName, navigation }) => {
    if (!settingRoutes[routeName]) {
      return false;
    }
    const { title, isHome } = settingRoutes[routeName];
    const { goBack: childGoBack } = navigation;
    const { params } = navigation.state;

    this.setState({
      currentRoute: title,
      isHome,
      childGoBack,
      params,
    });
    return true;
  };

  _renderGlobalContextConsumer = (globalContext, statusBoxContext) => {
    const { navigation } = this.props;
    const {
      isHome, currentRoute, screenAnimator, screenLayout,
    } = this.state;
    const {
      hasCOINiD, isBLESupported, settings, settingHelper,
    } = globalContext;

    const settingsTree = SettingsTree({
      ...this.state,
      hasCOINiD,
      isBLESupported,
      settings,
      settingHelper,
      showStatus: statusBoxContext.showStatus,
      navigation,
    });

    const headerAnimStyle = {
      transform: [
        {
          translateY: screenAnimator.interpolate({
            inputRange: [0, 1],
            outputRange: [-screenLayout.initHeight, 0],
          }),
        },
        {
          scale: screenAnimator.interpolate({
            inputRange: [0.7, 1],
            outputRange: [0.98, 1],
          }),
        },
      ],
      opacity: screenAnimator.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [0, 0, 1],
      }),
    };

    return (
      <View style={styles.container}>
        <Animated.View style={headerAnimStyle}>
          <SettingsHeader
            title={currentRoute}
            isHome={isHome}
            onClose={this._close}
            onBack={this._back}
          />
        </Animated.View>
        <View style={styles.content}>
          <SettingsNavigator
            screenProps={{
              settingsTree,
              onRouteChange: this._handleRouteChange,
            }}
            navigation={navigation}
          />
        </View>
      </View>
    );
  };

  _renderStatusBoxConsumer = statusBoxContext => (
    <GlobalContext.Consumer>
      {globalContext => this._renderGlobalContextConsumer(globalContext, statusBoxContext)}
    </GlobalContext.Consumer>
  );

  render() {
    return <StatusBoxContext.Consumer>{this._renderStatusBoxConsumer}</StatusBoxContext.Consumer>;
  }
}

export default Settings;
