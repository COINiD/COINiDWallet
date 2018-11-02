import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Image, Linking, ScrollView, KeyboardAvoidingView, Platform, View,
} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { NavigationActions } from 'react-navigation';
import styles from './styles';
import config from '../../config/settings';
import { colors } from '../../config/styling';
import { getDebugMenu } from '../../config/secrets';
import { Text } from '../../components';

const svgFiles = {
  coinidLogo: require('../../assets/images/coinid-logo.png'),
};

class Screen extends PureComponent {
  constructor(props): void {
    super(props);

    const { screenProps } = props;

    this.parentNavigation = screenProps.parentNavigation;
    this.settingHelper = screenProps.settingHelper;
    this.settingHelper.on('updated', this._onSettingsUpdated);

    this.state = {
      slides: this.parentNavigation.state.params.slides,
      settings: this.settingHelper.getAll(),
      hasCOINiD: false,
    };
  }

  componentDidMount() {
    Linking.canOpenURL('coinid://').then((hasCOINiD) => {
      this.setState({ hasCOINiD });
    });
  }

  componentWillUnmount() {
    if (this.settingHelper) {
      this.settingHelper.removeListener('updated', this._onSettingsUpdated);
    }
  }

  _return = () => {
    const { state, goBack } = this.parentNavigation;
    const { onReady, onClose } = state.params || {};

    if (onClose) onClose();
    if (onReady) onReady();
    goBack();
  };

  _save = () => this.settingHelper.save();

  _close = () => this._save().then(this._return);

  _goto = (route) => {
    const { navigation } = this.props;

    if (navigation) {
      navigation.dispatch(
        NavigationActions.navigate({
          routeName: route,
        }),
      );
    }
  };

  _openAbout = () => Linking.openURL(config.aboutUrl);

  _openFeedback = () => Linking.openURL(config.feedbackUrl);

  _openGuides = () => Linking.openURL(config.guidesUrl);

  _onSettingsUpdated = (settings) => {
    this.setState({ settings });
    this.forceUpdate();
  };

  _switchPasscode = () => {
    const { settings } = this.state;
    this.settingHelper.update('usePasscode', !settings.usePasscode);
  };

  _hasInstalledWallets = () => {
    const { slides } = this.state;
    const installedWallets = slides.filter(e => e.coinid.account !== undefined);
    return installedWallets.length > 0;
  };

  _hasInstalledHotWallet = () => {
    const { slides } = this.state;
    const hasInstalled = slides[0].coinid.account !== undefined;
    return hasInstalled;
  };

  _hasInstalledColdWallet = () => {
    const { slides } = this.state;
    const hasInstalled = slides[1].coinid.account !== undefined;
    return hasInstalled;
  };

  render() {
    const { navigation } = this.props;
    const { theme } = navigation.state.params || {};
    const themeStyle = styles(theme);
    const { settings, slides, hasCOINiD } = this.state;

    const passcodeTimingTitle = () => {
      const currentDuration = settings.lockAfterDuration;
      const titles = config.lockDurations
        .filter(item => item.milliseconds === currentDuration)
        .map(item => item.title);
      if (titles.length === 0) {
        titles.push(config.lockDurations[0].title);
      }

      return titles[0];
    };

    const coldTransportTitle = () => {
      const currentKey = settings.preferredColdTransport;
      const titles = config.coldTransportTypes
        .filter(item => item.key === currentKey)
        .map(item => item.title);
      if (titles.length === 0) {
        titles.push(config.coldTransportTypes[0].title);
      }

      return titles[0];
    };

    const primarySettings = [
      {
        title: 'View lock',
        hideChevron: true,
        switchButton: true,
        disabled: !this._hasInstalledHotWallet() || (!hasCOINiD && !settings.usePasscode),
        switched: this._hasInstalledHotWallet() ? settings.usePasscode : false,
        onSwitch: this._switchPasscode.bind(this),
        switchOnTintColor: colors.green,
        switchTintColor: colors.lightGray,
      },
      {
        title: 'Require unlocking',
        onPress: () => this._goto('Passcode'),
        disabled: this._hasInstalledHotWallet() ? !settings.usePasscode : true,
        rightTitle: `${passcodeTimingTitle()}`,
        rightTitleStyle: [themeStyle.listItemTitle, themeStyle.listItemRightTitle],
      },
    ];

    const coldTransportSettings = [
      {
        title: 'Offline transport',
        onPress: () => this._goto('ColdTransport'),
        disabled: false,
        rightTitle: `${coldTransportTitle()}`,
        rightTitleStyle: [themeStyle.listItemTitle, themeStyle.listItemRightTitle],
      },
    ];

    const resetSettings = [
      {
        title: 'Reset',
        onPress: () => this._goto('Reset'),
        disabled: !this._hasInstalledWallets(),
      },
    ];

    const secondarySettings = [
      {
        title: 'About',
        titleStyle: [themeStyle.listItemTitle, themeStyle.highlightText],
        onPress: this._openAbout,
        hideChevron: true,
      },
      {
        title: 'Feedback',
        titleStyle: [themeStyle.listItemTitle, themeStyle.highlightText],
        onPress: this._openFeedback,
        hideChevron: true,
      },
      {
        title: 'Guides',
        titleStyle: [themeStyle.listItemTitle, themeStyle.highlightText],
        onPress: this._openGuides,
        hideChevron: true,
      },
    ];

    const debugSettings = getDebugMenu ? getDebugMenu(slides) : [];

    const buildList = items => (
      <List containerStyle={themeStyle.list}>
        {items.map((item, i) => (
          <ListItem
            containerStyle={themeStyle.listItemContainer}
            wrapperStyle={themeStyle.listItemWrapper}
            titleStyle={themeStyle.listItemTitle}
            titleContainerStyle={themeStyle.listItemTitleContainer}
            rightTitleStyle={themeStyle.listItemTitle}
            rightTitleContainerStyle={themeStyle.listItemRightTitleContainer}
            disabledStyle={themeStyle.listItemDisabled}
            chevronColor={colors.black}
            key={i}
            {...item}
          />
        ))}
      </List>
    );

    const getViewLockExplanation = () => {
      if (!this._hasInstalledHotWallet()) {
        return 'View lock requires an installed hot wallet.';
      }

      console.log({ hasCOINiD, passCode: settings.usePasscode });

      if (!hasCOINiD && !settings.usePasscode) {
        return 'View lock requires COINiD Vault.';
      }

      return 'View lock is unlocked with COINiD Vault.';
    };

    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === 'ios'}
        behavior="position"
        keyboardVerticalOffset={60}
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          <ScrollView>
            {buildList(primarySettings)}
            <Text style={themeStyle.listHint}>{getViewLockExplanation()}</Text>
            {buildList(coldTransportSettings)}
            {buildList(resetSettings)}
            {buildList(secondarySettings)}
            {buildList(debugSettings)}
          </ScrollView>
          <Image style={themeStyle.logoWrapper} source={svgFiles.coinidLogo} resizeMode="contain" />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

Screen.propTypes = {
  navigation: PropTypes.shape({}),
};

export default Screen;
