import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, Alert } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import RNExitApp from 'react-native-exit-app';

import styles from './styles';
import { colors } from '../../config/styling';
import { Text } from '../../components';


class Screen extends PureComponent {
  constructor(props): void {
    super(props);

    const { screenProps } = props;

    this.parentNavigation = screenProps.parentNavigation;
    this.timer = false;

    this.state = {
      slides: this.parentNavigation.state.params.slides,
    };

    screenProps.handleRouteChange({ title: 'Reset' });
  }

  componentWillUnmount() {
    this._onClose();

    if (this.settingHelper) {
      this.settingHelper.removeListener('updated', this._onSettingsUpdated);
    }
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
    const { navigation } = this.props;
    const { goBack } = navigation;

    this._onClose();

    goBack();
  };

  _reset = (slide) => {
    Alert.alert(
      `Reset the ${slide.title.toLowerCase()} wallet?`,
      'The public key and history will be removed. The app will exit after reset.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            slide.coinid
              .getStorage()
              .reset()
              .then(() => {
                RNExitApp.exitApp();
              });
          },
        },
      ],
      { cancelable: true },
    );
  };

  render() {
    const { navigation } = this.props;
    const { theme } = navigation.state.params || {};
    const themeStyle = styles(theme);
    const { slides } = this.state;

    const resetSettings = slides.reduce((acc, cur) => {
      if (cur.coinid.account === undefined) {
        return acc;
      }

      acc.push({
        title: `Reset ${cur.title} Wallet`,
        titleStyle: [themeStyle.listItemTitle, themeStyle.warningText],
        onPress: () => this._reset(cur),
        hideChevron: true,
      });

      return acc;
    }, []);

    if (resetSettings.length === 0) {
      resetSettings.push({
        title: 'No wallets installed to reset...',
        onPress: () => {},
        hideChevron: true,
      });
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
      <ScrollView>
        {buildList(resetSettings)}
        <Text style={themeStyle.listHint}>
          The public key and history will be removed. The app will exit after reset.
        </Text>
      </ScrollView>
    );
  }
}

Screen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default Screen;
