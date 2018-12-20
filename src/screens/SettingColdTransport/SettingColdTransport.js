import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ScrollView } from 'react-native';
import { List, ListItem } from 'react-native-elements';
import bleCentral from 'react-native-p2p-transfer-ble-central';

import styles from './styles';
import config from '../../config/settings';
import { colors } from '../../config/styling';
import { Loading, Text } from '../../components';

class SettingColdTransport extends PureComponent {
  constructor(props): void {
    super(props);
    this.timer = false;
    this.state = {
      isLoading: true,
      settings: {},
      isBLESupported: false,
    };
  }

  componentDidMount() {
    const { screenProps } = this.props;

    this.parentNavigation = screenProps.parentNavigation;
    this.settingHelper = screenProps.settingHelper;
    this.settingHelper.on('updated', this._onSettingsUpdated);
    this._onSettingsUpdated(this.settingHelper.getAll());

    this.setState({
      isLoading: false,
      settings: this.settingHelper.getAll(),
    });

    bleCentral.isSupported()
      .then((isBLESupported) => {
        this.setState({
          isBLESupported,
        });
      });

    screenProps.handleRouteChange({ title: 'Offline transport' });
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
    const { navigation: { goBack } } = this.props;
    this._onClose();
    goBack();
  };

  _setColdTransportType = (key) => {
    this.settingHelper.update('preferredColdTransport', key);
    this.timer = setTimeout(() => this._return(), 400);
  }

  _onSettingsUpdated = (settings) => {
    this.setState({ settings });
    this.forceUpdate();
  };

  render() {
    const { theme } = this.props.navigation.state.params || {};
    const themeStyle = styles(theme);
    const { settings, isLoading, isBLESupported } = this.state;

    if (isLoading) {
      return <Loading />;
    }

    const active = (key) => {
      const currentKey = settings.preferredColdTransport;
      return currentKey === key;
    };

    const stateProps = (key) => {
      if (active(key)) {
        return { rightIcon: { name: 'check' } };
      }
      return { hideChevron: true };
    };

    const screenSettings = [];

    for (let i = 0; i < config.coldTransportTypes.length; i += 1) {
      const push = (type) => {
        let disabled = false;
        if (type.key === 'ble' && !isBLESupported) {
          disabled = true;
        }

        screenSettings.push({
          title: `${type.title}`,
          disabled,
          onPress: () => {
            this._setColdTransportType(type.key);
          },
          ...stateProps(type.key),
        });
      };

      push(config.coldTransportTypes[i]);
    }

    const buildList = items => (
      <List containerStyle={themeStyle.list}>
        {items.map((item, i) => {
          return (
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
          );
        })}
      </List>
    );

    return (
      <ScrollView style={themeStyle.scrollContainer}>
        <Text style={themeStyle.listHeader}>Select how to transfer data to the offline device.</Text>
        {buildList(screenSettings)}
      </ScrollView>
    );
  };
}

SettingColdTransport.propTypes = {
  navigation: PropTypes.object,
};

export default SettingColdTransport;
