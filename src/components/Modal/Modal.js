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
import styles from './styles';
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper';

const BackButton = BackHandler || BackAndroid;

export default class Modal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      overlayOpacity: new Animated.Value(0),
      scale: new Animated.Value(1),
      top: new Animated.Value(Dimensions.get('window').height),
      isOpen: false,
    };
  }

  componentDidMount() {
    this.subscriptions = [];

    if (Platform.OS === 'ios') {
      this.subscriptions.push(Keyboard.addListener('keyboardWillChangeFrame', this._onKeyboardChange));
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.remove());
  }

  _open = () => {
    if (Platform.OS === 'android') {
      BackButton.addEventListener('hardwareBackPress', this._onBackPress);
    }

    this.setState({ isOpen: true });
    this.props.onOpen();

    Animated.parallel([
      Animated.timing(this.state.overlayOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.top, {
        toValue: 0,
        duration: 300,
        easing: Easing.elastic(0.8),
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.props.onOpened();
    });
  }

  _close = () => {
    if (Platform.OS === 'android') {
      BackButton.removeEventListener('hardwareBackPress', this._onBackPress);
    }

    this.props.onClose();

    Animated.parallel([
      Animated.timing(this.state.overlayOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.top, {
        toValue: Dimensions.get('window').height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      this.setState({ isOpen: false });
      this.props.onClosed();
    });
  }

  _onBackPress = () => {
    this._close();
    return true;
  }

  _onKeyboardChange = (e) => {
    this.keyBoardEvent = e;
  }

  _setKeyboardOffset = (offset) => {
    if (Platform.OS === 'ios') {
      this.setState({ keyboardOffset: offset }, () => {
        this.keyboardAvoid._onKeyboardChange(this.keyBoardEvent);
      });
    }
  }

  render() {
    const {
      verticalPosition, children, avoidKeyboard, avoidKeyboardOffset, onLayout
    } = this.props;
    const {
      isOpen, overlayOpacity, scale, top, keyboardOffset,
    } = this.state;

    if (!isOpen) {
      return null;
    }

    const renderView = () => {
      if( Platform.OS === 'ios' ) {
        return (
          <KeyboardAvoidingView
            ref={(c) => { this.keyboardAvoid = c; }}
            behavior="position"
            enabled={avoidKeyboard}
            keyboardVerticalOffset={avoidKeyboardOffset + keyboardOffset + getStatusBarHeight(true)}
            style={{ width: '100%' }}
          >
            <Animated.View style={[styles.dialog, { transform: [{ scale }, { translateY: top }] }]}>
              { children}
            </Animated.View>
          </KeyboardAvoidingView>
        );
      }

      return (
        <Animated.View style={[styles.dialog, { transform: [{ scale }, { translateY: top }] }]}>
          { children}
        </Animated.View>
      );
    };

    return (
      <View
        style={[
          styles.container,
          isOpen ? styles.visible : styles.hidden,
          { justifyContent: verticalPosition }]}
        onLayout={onLayout}
      >
        <TouchableWithoutFeedback onPress={this._close}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>

        { renderView() }
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
