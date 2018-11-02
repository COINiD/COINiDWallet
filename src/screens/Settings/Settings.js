import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Animated, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { NavigationActions, createStackNavigator } from 'react-navigation';
import { Text } from '../../components';
import SettingHome from '../../screens/SettingHome';
import SettingPasscode from '../../screens/SettingPasscode';
import SettingReset from '../../screens/SettingReset';
import SettingColdTransport from '../../screens/SettingColdTransport';
import styles from './styles';

const settingScreens = {
  Home: {
    screen: SettingHome,
    swipeEnabled: false,
    navigationOptions: { title: 'Settings' },
  },
  Passcode: {
    screen: SettingPasscode,
    navigationOptions: { title: 'Require unlocking' },
  },
  ColdTransport: {
    screen: SettingColdTransport,
    navigationOptions: { title: 'Offline transport' },
  },
  Reset: {
    screen: SettingReset,
    navigationOptions: { title: 'Reset' },
  },
};

const SettingsNavigator = createStackNavigator(settingScreens, {
  animationEnabled: true,
  headerMode: 'none',
  cardStyle: {
    backgroundColor: 'white',
    padding: 16,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  navigationOptions: {
    tabBarVisible: false,
  },
});

export default class Screen extends PureComponent {
  static router = SettingsNavigator.router;

  static navigationOptions = {
    header: null,
  };

  static propTypes = {
    navigation: PropTypes.shape({
      addListener: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
      state: PropTypes.shape({
        params: PropTypes.shape({
          onClose: PropTypes.func.isRequired,
        }).isRequired,
      }).isRequired,
    }).isRequired,
  };

  state = {
    animValueHeader: new Animated.Value(0),
    animValueClose: new Animated.Value(1),
    animValueBack: new Animated.Value(0),
    currentRoute: 'Settings',
    isHome: true,
  };

  componentDidMount() {
    const { navigation } = this.props;
    this.hasClosed = false;
    this.blurListener = navigation.addListener('willBlur', this._onClose);
    this.animateHeader(1, 200, 400);
  }

  componentWillUnmount() {
    this.blurListener.remove();
    this.animateHeader(0, 100, 0);
    this._onClose();
  }

  _onClose = () => {
    const { onClose } = this.props.navigation.state.params || {};
    if (onClose) {
      if(!this.hasClosed) {
        onClose();
        this.hasClosed = true;
      }
    }
  }

  animateHeader = (to, duration, delay) => {
    this.animateValue(this.state.animValueHeader, to, duration, delay);
  };

  animateValue = (value, to, duration, delay) => {
    Animated.timing(value, {
      useNativeDriver: true,
      toValue: to,
      duration,
      delay,
    }).start();
  };

  close = () => {
    const { navigation } = this.props;
    const { state, goBack } = navigation;
    const { onReady } = state.params || {};

    if (onReady) onReady();
    goBack();
  };

  back = () => {
    this.internalNavigator.dispatch(NavigationActions.navigate({ routeName: 'Home' }));
    this.handleRouteReset();
  };

  handleRouteChange = ({ title }) => {
    const { animValueBack, animValueClose } = this.state;

    this.setState({
      currentRoute: title,
      isHome: false,
    });

    this.animateValue(animValueBack, 1, 150, 0);
    this.animateValue(animValueClose, 0, 150, 0);
  };

  handleRouteReset = () => {
    const { animValueBack, animValueClose } = this.state;

    this.setState({
      currentRoute: 'Settings',
      isHome: true,
    });

    this.animateValue(animValueBack, 0, 150, 0);
    this.animateValue(animValueClose, 1, 150, 0);
  };

  render() {
    const { navigation } = this.props;
    const { currentRoute, isHome } = this.state;
    const { theme } = navigation.state.params || {};
    const themeStyle = styles(theme);

    return (
      <View style={themeStyle.container}>
        <Animated.View style={[themeStyle.header, { opacity: this.state.animValueHeader }]}>
          <Animated.View
            pointerEvents={isHome ? 'none' : 'auto'}
            style={[themeStyle.headerIconContainer, { opacity: this.state.animValueBack }]}
          >
            <Icon
              containerStyle={themeStyle.headerIconContainer}
              iconStyle={themeStyle.headerIcon}
              underlayColor="transparent"
              onPress={() => {
                this.back();
              }}
              color="white"
              name="chevron-left"
            />
          </Animated.View>
          <Text
            style={themeStyle.title}
          >
            {currentRoute}
          </Text>

          <Animated.View
            pointerEvents={isHome ? 'auto' : 'none'}
            style={[themeStyle.headerIconContainer, { opacity: this.state.animValueClose }]}
          >
            <Icon
              containerStyle={themeStyle.headerIconContainer}
              iconStyle={themeStyle.headerIcon}
              underlayColor="transparent"
              onPress={() => {
                this.close();
              }}
              color="white"
              name="close"
            />
          </Animated.View>
        </Animated.View>
        <View
          style={[
            themeStyle.content,
            {
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              overflow: 'hidden',
            },
          ]}
        >
          <SettingsNavigator
            ref={(nav) => {
              this.internalNavigator = nav;
            }}
            screenProps={{
              handleRouteChange: this.handleRouteChange,
              handleRouteReset: this.handleRouteReset,
              parentNavigation: this.props.navigation,
              settingHelper: this.props.navigation.state.params.settingHelper,
            }}
            navigation={this.props.navigation}
          />
        </View>
      </View>
    );
  };
}
