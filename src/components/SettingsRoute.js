import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import SettingsSection from './SettingsSection';

const imageCOINiDLogo = require('../assets/images/coinid-logo.png');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: -16,
    marginTop: -24,
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    minHeight: '100%',
  },
  logo: {
    marginTop: 32,
    marginBottom: isIphoneX() ? 23 : 11,
    width: 94.47,
    height: 33,
    alignSelf: 'center',
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

class SettingsRoute extends PureComponent {
  static propTypes = {
    navigation: PropTypes.shape({}).isRequired,
    screenProps: PropTypes.shape({}).isRequired,
  };

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('willFocus', this._onFocus);
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  _getPropsInfo = () => {
    const {
      navigation,
      navigation: {
        state: { routeName },
      },
      screenProps: { onRouteChange, settingsTree },
    } = this.props;

    return {
      navigation,
      routeName,
      onRouteChange,
      settingsTree,
    };
  };

  _onFocus = () => {
    const { navigation, routeName, onRouteChange } = this._getPropsInfo();

    onRouteChange({ routeName, navigation });
  };

  _renderSections = sections => sections.map((section, i) => <SettingsSection key={i} {...section} />);

  render() {
    const { routeName, settingsTree } = this._getPropsInfo();

    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === 'ios'}
        behavior="position"
        keyboardVerticalOffset={60}
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
      >
        <View style={styles.scrollWrapper}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {this._renderSections(settingsTree[routeName])}
            <View style={styles.logoWrapper}>
              <Image style={styles.logo} source={imageCOINiDLogo} resizeMode="contain" />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default SettingsRoute;
