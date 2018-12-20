import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Animated, Dimensions, View, Platform,
} from 'react-native';
import { Header, Icon } from 'react-native-elements';

import Carousel, { Pagination } from 'react-native-snap-carousel';
import LottieView from 'lottie-react-native';
import styles from './styles';
import { colors } from '../../config/styling';
import settings from '../../config/settings';

import { Text } from '../../components';
import { Wallet } from '..';

import COINiDPublic from '../../libs/coinid-public';
import storageHelper from '../../utils/storageHelper';

import settingHelper from '../../utils/settingHelper';

const sliderWidth = Dimensions.get('window').width;

const lottieFiles = {
  walletLogo: require('../../animations/wallet_logo.json'),
};

class Home extends PureComponent {
  constructor(props) {
    super(props);

    this.walletComponents = [];
    this.settingHelper = settingHelper(settings.coin);

    this.hotCOINiD = COINiDPublic(
      settings.coin,
      storageHelper(`${settings.coin}-hot`),
      `${settings.coin}-hot`,
    );

    this.coldCOINiD = COINiDPublic(
      settings.coin,
      storageHelper(`${settings.coin}-cold`),
      `${settings.coin}-cold`,
    );

    global.unlockCOINiD = this.hotCOINiD;
    global._hideSensitive = this._hideSensitive;
    global._showSensitive = this._showSensitive;

    this.state = {
      animValue: new Animated.Value(1),
      coldWalletMode: true,
      activeSlide: 0,
      slides: [
        {
          coinid: this.hotCOINiD,
          type: 'hot',
          title: 'Hot',
          theme: 'light',
          dotColor: colors.getHot(),
          settingHelper: this.settingHelper,
        },
        {
          coinid: this.coldCOINiD,
          type: 'cold',
          title: 'Cold',
          theme: 'dark',
          dotColor: colors.getCold(),
          settingHelper: this.settingHelper,
        },
      ],
      hideSensitive: false,
    };
  }

  componentDidMount() {
    this.settingHelper.on('updated', this._onSettingsUpdated);
    this.settingHelper.load();
    this._updateActiveTitle(0);

    this.didBlurSubscription = this.props.navigation.addListener(
      'didBlur',
      (payload) => {
        console.debug('didBlur', payload);
      },
    );
  }

  componentWillUnmount() {
    this.settingHelper.removeListener('updated', this._onSettingsUpdated);
  }

  get _carousel() {
    return (
      <Carousel
        ref="carousel"
        layout="default"
        data={this._getActiveSlides(this.state.coldWalletMode)}
        renderItem={this._renderItem}
        sliderWidth={sliderWidth}
        itemWidth={sliderWidth}
        onSnapToItem={this._onSnapToItem}
        inactiveSlideOpacity={Platform.OS === 'ios' ? 0.7 : 1}
        firstItem={this.state.activeSlide}
        containerCustomStyle={{ overflow: 'visible' }}
      />
    );
  }

  get _pagination() {
    const { coldWalletMode, activeSlide } = this.state;
    const slides = this._getActiveSlides(coldWalletMode);
    const dotColorByIndex = slides.map(a => a.dotColor);
    return (
      <View style={{ height: '100%', justifyContent: 'center' }}>
        <Text style={styles.title} ref="walletTitle">
          {this.state.walletTitle}
        </Text>
        <View style={styles.paginator}>
          <Pagination
            ref="pagination"
            dotsLength={slides.length}
            activeDotIndex={activeSlide}
            containerStyle={styles.paginationContainerStyle}
            dotContainerStyle={styles.dotContainerStyle}
            dotStyle={styles.dotStyle}
            inactiveDotStyle={styles.inactiveDotStyle}
            inactiveDotScale={1}
            inactiveDotOpacity={1}
            dotColor={colors.lightGray}
            inactiveDotColor={colors.gray}
            dotColorByIndex={dotColorByIndex}
          />
        </View>

      </View>
    );
  }

  _updateActiveTitle = (index) => {
    const { slides } = this.state;
    this.setState({ walletTitle: `${slides[index].title} Wallet` });
  };

  _getActiveSlides = (coldWalletMode) => {
    const slides = [this.state.slides[0]];

    if (coldWalletMode) {
      slides.push(this.state.slides[1]);
    }

    return slides;
  };

  _renderItem = ({ item, index }) => {
    const { hideSensitive } = this.state;

    return (
      <View style={{ flex: 1, width: sliderWidth }}>
        <Wallet
          ref={c => (this.walletComponents[index] = c)}
          {...item}
          navigation={this.props.navigation}
          onBuild={() => this._onWalletBuild(index)}
          onBuildReady={() => this._onWalletBuildReady(index)}
          hideSensitive={hideSensitive}
        />
      </View>
    );
  };

  _hideSensitive = () => {
    this.setState({
      hideSensitive: true,
    });
  };

  _showSensitive = () => {
    this.setState({
      hideSensitive: false,
    });
  };

  _onSnapToItem = (index) => {
    this.refs.pagination.setActiveDotIndex(index);
    this._updateActiveTitle(index);

    if (index !== this.prevIndex) {
      this.walletComponents[index]._onSnapTo();

      if (this.prevIndex !== undefined) {
        this.walletComponents[this.prevIndex]._onSnapFrom();
      }
      this.prevIndex = index;
    }
  };

  _onWalletReset = (index) => {
    this.walletComponents[index]._checkAccount();
    this.refs.carousel.snapToItem(index);
  };

  _onWalletBuild = (index) => {
    global.disableInactiveOverlay();
    this.refs.carousel._setScrollEnabled(false);
    this.refs.carousel.snapToItem(index);
  };

  _onWalletBuildReady = (index) => {
    global.enableInactiveOverlay();
    this.refs.carousel._setScrollEnabled(true);
    this.refs.carousel.snapToItem(index);
  };

  _onSettingsUpdated = (settings) => {
    let activeSlide = this.state.activeSlide;

    if (
      activeSlide - 1
      > this._getActiveSlides(settings.coldWalletMode).length
    ) {
      activeSlide = 0;
    }

    this.setState({
      coldWalletMode: settings.coldWalletMode,
      activeSlide,
    });
  };

  _onSettingsClose = () => {
    if(!this.settingsOpen) {
      return;
    }
    this.settingsOpen = false;

    const { animValue } = this.state;

    Animated.timing(animValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  _openSettings = () => {
    if(this.settingsOpen) {
      return;
    }
    this.settingsOpen = true;

    const { navigate } = this.props.navigation;
    const { animValue, slides } = this.state;

    navigate('Settings', {
      slides,
      onClose: this._onSettingsClose.bind(this),
      onWalletReset: this._onWalletReset.bind(this),
      settingHelper: this.settingHelper,
    });

    Animated.timing(animValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  _renderHeaderLeft = () => {
    const renderTestnet = () => {
      if (settings.isTestnet) {
        return (<Text style={styles.testnetText}>Testnet</Text>);
      }

      return null;
    };

    return (
      <View
        style={{
          marginTop: 8,
          marginLeft: 6,
          position: 'absolute',
          left: 0,
          top: 0,
          flexDirection: 'row',
        }}
      >
        <LottieView
          style={{ width: 24, height: 24 }}
          source={lottieFiles.walletLogo}
        />
        {renderTestnet()}
      </View>
    );
  }

  _renderHeaderRight = () => (
    <Icon
      name="settings"
      containerStyle={styles.settingsBtnContainer}
      iconStyle={styles.settingsBtn}
      underlayColor="transparent"
      onPress={this._openSettings}
    />
  );

  render() {
    const { animValue } = this.state;

    const animationStyle = {
      flex: 1,
      transform: [
        {
          scale: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.91, 1],
          }),
        },
        {
          translateY: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [-28, 0],
          }),
        },
      ],
    };

    return (
      <Animated.View style={animationStyle}>
        <View style={styles.container}>
          <Animated.View style={{ height: 40, opacity: animValue }}>
            <Header
              outerContainerStyles={styles.headerOuter}
              innerContainerStyles={styles.headerInner}
              leftComponent={this._renderHeaderLeft()}
              centerComponent={this._pagination}
              rightComponent={this._renderHeaderRight()}
            />
          </Animated.View>
          { this._carousel }
        </View>
      </Animated.View>
    );
  }
}

Home.propTypes = {
  navigation: PropTypes.object,
};

export default Home;
