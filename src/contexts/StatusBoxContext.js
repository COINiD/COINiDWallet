import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Animated, Easing, StyleSheet, View,
} from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import Text from '../components/Text';
import { colors, fontWeight, fontSize } from '../config/styling';

const StatusContext = React.createContext({});

const BOX_HEIGHT = 48;
const OUTER_PADDING = 8;
const BOTTOM = +BOX_HEIGHT + OUTER_PADDING * 2;
const TRANSLATE_UP = BOTTOM + getBottomSpace();

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    padding: OUTER_PADDING,
    bottom: -BOTTOM,
    width: '100%',
    overflow: 'visible',
  },
  box: {
    backgroundColor: colors.otherGray,
    flex: 1,
    height: BOX_HEIGHT,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { height: 2, width: 0 },
    flexDirection: 'row',
  },
  text: {
    ...fontWeight.medium,
    fontSize: fontSize.small,
    color: colors.white,
  },
});

class StatusBox extends PureComponent {
  static propTypes = {
    style: PropTypes.shape({}).isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

  static defaultProps = {
    children: null,
  };

  _renderChildren = () => {
    const { children } = this.props;

    if (typeof children === 'string') {
      return <Text style={styles.text}>{children}</Text>;
    }

    return children;
  };

  render() {
    const { style } = this.props;
    return (
      <Animated.View style={[styles.container, style]}>
        <View style={styles.box}>{this._renderChildren()}</View>
      </Animated.View>
    );
  }
}

class StatusBoxProvider extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

  static defaultProps = {
    children: null,
  };

  constructor() {
    super();

    const animation = new Animated.Value(0);

    const statusStyle = {
      opacity: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -TRANSLATE_UP],
          }),
        },
      ],
    };

    this.state = {
      statusContent: null,
      animation,
      statusStyle,
    };
  }

  _showStatus = (statusContent) => {
    clearTimeout(this.timeout);

    this._animate(1, () => {
      this.timeout = setTimeout(this._hideStatus, 1000);
    });

    this.setState({
      statusContent,
    });
  };

  _hideStatus = () => {
    this._animate(0);
  };

  _animate = (toValue, cb) => {
    const { animation } = this.state;

    Animated.timing(animation, {
      toValue,
      duration: 200,
      easing: toValue === 1 ? Easing.elastic(1) : Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(cb);
  };

  render() {
    const { children } = this.props;
    const { statusContent, statusStyle } = this.state;

    return (
      <StatusContext.Provider value={{ showStatus: this._showStatus, textStyle: styles.text }}>
        {children}
        <StatusBox style={statusStyle}>{statusContent}</StatusBox>
      </StatusContext.Provider>
    );
  }
}

export default {
  ...StatusContext,
  Provider: StatusBoxProvider,
};
