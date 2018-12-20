import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { List, ListItem } from 'react-native-elements';

import styles from './styles';
import config from '../../config/settings';
import { colors } from '../../config/styling';
import { Loading, Text } from '../../components';

class Screen extends PureComponent {
  constructor(props): void {
    super(props);
    this.timer = false;
    this.state = {
      isLoading: true,
      settings: {},
    };
  }

  componentDidMount() {
    this.parentNavigation = this.props.screenProps.parentNavigation;
    this.settingHelper = this.props.screenProps.settingHelper;
    this.settingHelper.on('updated', this._onSettingsUpdated);
    this._onSettingsUpdated(this.settingHelper.getAll());

    this.setState({
      isLoading: false,
      settings: this.settingHelper.getAll(),
    });

    this.props.screenProps.handleRouteChange({ title: 'Require unlocking' });
  }

  componentWillUnmount() {
    this._onClose();

    if (this.settingHelper) {
      this.settingHelper.removeListener('updated', this._onSettingsUpdated);
    }
    clearTimeout(this.timer);
  }

  _onClose = () => {
    const { navigation, screenProps } = this.props;
    const { state } = navigation;
    const { onReady, onClose } = state.params || {};

    if (onClose) onClose();
    if (onReady) onReady();

    screenProps.handleRouteReset();
  }

  _return = () => {
    const { goBack } = this.props.navigation;
    this._onClose();
    goBack();
  };

  _setLockDuration = (milliseconds) => {
    this.settingHelper.update('lockAfterDuration', milliseconds);
    this.timer = setTimeout(() => this._return(), 400);
  }

  _onSettingsUpdated = (settings) => {
    this.setState({ settings });
    this.forceUpdate();
  };

  render() {
    const { navigate } = this.props.navigation;
    const { theme } = this.props.navigation.state.params || {};
    const themeStyle = styles(theme);
    const { settings, isLoading } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    passcodeActive = (milliseconds) => {
      const currentDuration = this.state.settings.lockAfterDuration;
      return currentDuration == milliseconds;
    };

    passcodeStateProps = (milliseconds) => {
      if (passcodeActive(milliseconds)) {
        return { rightIcon: { name: 'check' } };
      }
      return { hideChevron: true };
    };

    const passcodeSettings = [];

    for (let i = 0; i < config.lockDurations.length; i++) {
      const push = (duration) => {
        passcodeSettings.push({
          title: `${duration.title}`,
          onPress: () => {
            this._setLockDuration(duration.milliseconds);
          },
          ...passcodeStateProps(duration.milliseconds),
        });
      };

      push(config.lockDurations[i]);
    }

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

    return (
      <ScrollView style={themeStyle.scrollContainer}>
        <Text style={themeStyle.listHeader}>Shorter times are more secure</Text>
        {buildList(passcodeSettings)}
      </ScrollView>
    );
  };
}

Screen.propTypes = {
  navigation: PropTypes.object,
};

export default Screen;
