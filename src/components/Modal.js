import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Dimensions,
  BackAndroid,
  BackHandler,
  Platform,
  Keyboard,
  StyleSheet,
} from 'react-native';

import { getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper';
import { colors } from '../config/styling';

const BackButton = BackHandler || BackAndroid;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    padding: 8,
    paddingBottom: getBottomSpace() + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visible: {},
  hidden: {
    transform: [{ translateX: -9999 }],
  },
  overlay: {
    backgroundColor: colors.black,
    ...StyleSheet.absoluteFill,
  },
  dialog: {
    width: '100%',
    overflow: 'hidden',
    maxHeight: Dimensions.get('window').height - getBottomSpace() - 56 - getStatusBarHeight(true),
  },
});

class Modal extends PureComponent {
  static propTypes = {
    verticalPosition: PropTypes.string,
    onClosed: PropTypes.func,
    onOpened: PropTypes.func,
    onLayout: PropTypes.func,
    onOpen: PropTypes.func,
    onClose: PropTypes.func,
    avoidKeyboardOffset: PropTypes.number,
    avoidKeyboard: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    removeWhenClosed: PropTypes.bool,
    closeAndClear: PropTypes.func.isRequired,
  };

  static defaultProps = {
    verticalPosition: 'center',
    onClosed: () => {},
    onOpened: () => {},
    onLayout: () => {},
    onOpen: () => {},
    onClose: () => {},
    avoidKeyboardOffset: 0,
    avoidKeyboard: false,
    children: null,
    removeWhenClosed: true,
  };

  constructor(props) {
    super(props);

    this.keyboardActive = false;

    this.state = {
      animate: new Animated.Value(0),
      isOpen: false,
      keyboardOffset: 0,
    };
  }

  componentDidMount() {
    this.subscriptions = [];

    if (Platform.OS === 'ios') {
      this.subscriptions.push(
        Keyboard.addListener('keyboardWillChangeFrame', this._onKeyboardChange),
        Keyboard.addListener('keyboardDidShow', this._keyboardDidShow),
        Keyboard.addListener('keyboardDidHide', this._keyboardDidHide),
      );
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.remove());
  }

  _open = (cb) => {
    const { onOpen, onOpened } = this.props;
    const { isOpen } = this.state;

    if (isOpen) {
      if (typeof cb === 'function') {
        cb();
      }
      return;
    }

    if (Platform.OS === 'android') {
      BackButton.addEventListener('hardwareBackPress', this._onBackPress);
    }

    this.setState({ isOpen: true });
    onOpen();

    this._animate(1, () => {
      if (typeof cb === 'function') {
        cb();
      }
      onOpened();
    });
  };

  _close = (cb) => {
    const { onClose, onClosed } = this.props;
    const { isOpen } = this.state;

    if (this.keyboardActive) {
      this._dismissKeyboard();
      return;
    }

    if (!isOpen) {
      if (typeof cb === 'function') {
        cb();
      }
      return;
    }

    if (Platform.OS === 'android') {
      BackButton.removeEventListener('hardwareBackPress', this._onBackPress);
    }

    onClose();

    this._animate(0, () => {
      this.setState({ isOpen: false }, () => {
        if (typeof cb === 'function') {
          cb();
        }
        onClosed();
      });
    });
  };

  _keyboardDidShow = () => {
    this.keyboardActive = true;
  };

  _keyboardDidHide = () => {
    this.keyboardActive = false;
  };

  _animate = (toValue, cb) => {
    const { animate } = this.state;

    Animated.timing(animate, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(cb);
  };

  _onBackPress = () => {
    const { closeAndClear } = this.props;
    closeAndClear();
    return true;
  };

  _onKeyboardChange = (e) => {
    this.keyBoardEvent = e;
  };

  _setKeyboardOffset = (offset) => {
    if (Platform.OS === 'ios') {
      this.setState({ keyboardOffset: offset }, () => {
        this.keyboardAvoid._onKeyboardChange(this.keyBoardEvent);
      });
    }
  };

  _dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  _renderView = () => {
    const { avoidKeyboard, avoidKeyboardOffset } = this.props;
    const { keyboardOffset } = this.state;

    if (Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView
          ref={(c) => {
            this.keyboardAvoid = c;
          }}
          behavior="position"
          enabled={avoidKeyboard}
          keyboardVerticalOffset={avoidKeyboardOffset + keyboardOffset + getStatusBarHeight(true)}
          style={{ width: '100%' }}
        >
          {this._renderDialog()}
        </KeyboardAvoidingView>
      );
    }

    return this._renderDialog();
  };

  _renderDialog = () => {
    const { children } = this.props;
    const { animate } = this.state;

    const animatedStyle = {
      transform: [
        {
          translateY: animate.interpolate({
            inputRange: [0, 1],
            outputRange: [Dimensions.get('window').height, 0],
          }),
        },
      ],
    };

    return (
      <TouchableWithoutFeedback onPress={this._dismissKeyboard}>
        <Animated.View style={[styles.dialog, animatedStyle]}>{children}</Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  render() {
    const {
      verticalPosition, onLayout, removeWhenClosed, closeAndClear,
    } = this.props;
    const { isOpen, animate } = this.state;

    if (!isOpen && removeWhenClosed) {
      return null;
    }

    const animatedStyle = {
      opacity: animate.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.4],
      }),
    };

    return (
      <View
        style={[
          styles.container,
          isOpen ? styles.visible : styles.hidden,
          { justifyContent: verticalPosition },
        ]}
        onLayout={onLayout}
      >
        <TouchableWithoutFeedback onPress={closeAndClear}>
          <Animated.View style={[styles.overlay, animatedStyle]} />
        </TouchableWithoutFeedback>

        {this._renderView()}
      </View>
    );
  }
}

export default Modal;
