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
} from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import styles from './styles';

const BackButton = BackHandler || BackAndroid;

export default class Modal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      animate: new Animated.Value(0),
      isOpen: false,
    };
  }

  componentDidMount() {
    this.subscriptions = [];

    if (Platform.OS === 'ios') {
      this.subscriptions.push(
        Keyboard.addListener('keyboardWillChangeFrame', this._onKeyboardChange),
      );
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.remove());
  }

  _open = () => {
    const { onClose, onClosed } = this.props;

    if (Platform.OS === 'android') {
      BackButton.addEventListener('hardwareBackPress', this._onBackPress);
    }

    this.setState({ isOpen: true });
    onClose();

    this._animate(1, () => {
      onClosed();
    });
  };

  _close = () => {
    const { onClose, onClosed } = this.props;

    if (Platform.OS === 'android') {
      BackButton.removeEventListener('hardwareBackPress', this._onBackPress);
    }

    onClose();

    this._animate(0, () => {
      this.setState({ isOpen: false });
      onClosed();
    });
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
    this._close();
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

  _renderView = () => {
    const { children, avoidKeyboard, avoidKeyboardOffset } = this.props;
    const { keyboardOffset, animate } = this.state;

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
          <Animated.View style={[styles.dialog, animatedStyle]}>{children}</Animated.View>
        </KeyboardAvoidingView>
      );
    }

    return <Animated.View style={[styles.dialog, animatedStyle]}>{children}</Animated.View>;
  };

  render() {
    const { verticalPosition, onLayout } = this.props;
    const { isOpen, animate } = this.state;

    if (!isOpen) {
      return null;
    }

    const animatedStyle = {
      opacity: animate.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
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
        <TouchableWithoutFeedback onPress={this._close}>
          <Animated.View style={[styles.overlay, animatedStyle]} />
        </TouchableWithoutFeedback>

        {this._renderView()}
      </View>
    );
  }
}

Modal.propTypes = {
  title: PropTypes.string,
  verticalPosition: PropTypes.string,
};

Modal.defaultProps = {
  title: 'Untitled',
  verticalPosition: 'center',
  showMoreOptions: false,
  onMoreOptions: () => {},
  onClosed: () => {},
  onOpened: () => {},
  onLayout: () => {},
  onOpen: () => {},
  onClose: () => {},
  avoidKeyboardOffset: 0,
};
