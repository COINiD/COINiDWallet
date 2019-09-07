import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { Icon } from 'react-native-elements';
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
    paddingHorizontal: 16,
  },
  boxSpacedItems: {
    justifyContent: 'space-between',
  },
  text: {
    ...fontWeight.medium,
    fontSize: fontSize.small,
    color: colors.white,
  },
  link: {
    color: colors.getTheme('light').highlight,
    marginRight: 1,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

class StatusBox extends PureComponent {
  static propTypes = {
    style: PropTypes.shape({}).isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    linkText: PropTypes.string,
    linkIcon: PropTypes.string,
    linkIconType: PropTypes.string,
    onLinkPress: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    linkText: '',
    linkIcon: '',
    linkIconType: '',
    onLinkPress: () => {},
  };

  _renderChildren = () => {
    const { children } = this.props;

    if (typeof children === 'string') {
      return <Text style={styles.text}>{children}</Text>;
    }

    return children;
  };

  _shouldRenderLink = () => {
    const { linkText, linkIcon } = this.props;

    return linkText || linkIcon;
  };

  _renderLink = () => {
    const {
      linkText, linkIcon, linkIconType, onLinkPress,
    } = this.props;

    const renderLinkText = () => {
      if (!linkText) {
        return null;
      }

      return <Text style={[styles.text, styles.link]}>{linkText}</Text>;
    };

    const renderLinkIcon = () => {
      if (!linkIcon) {
        return null;
      }

      return (
        <Icon
          name={linkIcon}
          color={colors.getTheme('light').highlight}
          size={26}
          type={linkIconType}
        />
      );
    };

    return (
      <TouchableOpacity style={styles.linkContainer} onPress={onLinkPress}>
        {renderLinkText()}
        {renderLinkIcon()}
      </TouchableOpacity>
    );
  };

  _renderBox = () => {
    if (!this._shouldRenderLink()) {
      return <View style={[styles.box]}>{this._renderChildren()}</View>;
    }

    return (
      <View style={[styles.box, styles.boxSpacedItems]}>
        {this._renderChildren()}
        {this._renderLink()}
      </View>
    );
  };

  render() {
    const { style } = this.props;

    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView
          behavior="position"
          style={{ zIndex: 1000 }}
          keyboardVerticalOffset={16}
        >
          <Animated.View style={[styles.container, style]}>{this._renderBox()}</Animated.View>
        </KeyboardAvoidingView>
      );
    }

    return <Animated.View style={[styles.container, style]}>{this._renderBox()}</Animated.View>;
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
      value: { showStatus: this._showStatus },
    };
  }

  _showStatus = (statusContent, statusProps) => {
    clearTimeout(this.timeout);

    const { hideAfter = 1600 } = statusProps;

    this.setState(
      {
        statusContent,
        statusProps,
      },
      () => {
        this._animate(1, () => {
          this.timeout = setTimeout(this._hideStatus, hideAfter);
        });
      },
    );
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
    const {
      statusContent, statusStyle, statusProps, value,
    } = this.state;

    return (
      <StatusContext.Provider value={value}>
        {children}
        <StatusBox style={statusStyle} {...statusProps}>
          {statusContent}
        </StatusBox>
      </StatusContext.Provider>
    );
  }
}

export const withStatusBox = (WrappedComponent) => {
  const Enhance = props => (
    <StatusContext.Consumer>
      {statusBoxContext => <WrappedComponent {...props} statusBoxContext={statusBoxContext} />}
    </StatusContext.Consumer>
  );
  return Enhance;
};

export default {
  ...StatusContext,
  Provider: StatusBoxProvider,
};
