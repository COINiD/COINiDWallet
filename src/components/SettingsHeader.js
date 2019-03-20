import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Animated } from 'react-native';
import { Icon } from 'react-native-elements';
import { colors } from '../config/styling';

const styles = StyleSheet.create({
  header: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  title: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 20,
    marginBottom: 2,
    flex: 1,
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
  },
  headerIconContainer: {
    zIndex: 10,
    padding: 10,
  },
  headerIcon: {
    color: colors.white,
    fontSize: 20,
    height: 20,
  },
});

class SettingsHeader extends PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    onBack: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    isHome: PropTypes.bool,
  };

  static defaultProps = {
    isHome: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.title !== state.title) {
      const { title, isHome } = props;
      const {
        animateValue, animCloseBackToggle, animTitle, title: prevTitle,
      } = state;

      animTitle.setValue(0);
      animateValue(animTitle, 1, 150, 0);
      animateValue(animCloseBackToggle, isHome ? 1 : 0, 150, 0);

      return {
        title,
        prevTitle,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      title: props.title,
      prevTitle: '',
      animCloseBackToggle: new Animated.Value(1),
      animTitle: new Animated.Value(1),
      animateValue: this._animateValue,
    };
  }

  _animateValue = (value, to, duration, delay) => {
    Animated.timing(value, {
      useNativeDriver: true,
      toValue: to,
      duration,
      delay,
    }).start();
  };

  _getAnimStyles = () => {
    const { animTitle, animCloseBackToggle } = this.state;

    const titleAnimStyle = {
      opacity: animTitle.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          scale: animTitle.interpolate({
            inputRange: [0, 1],
            outputRange: [0.75, 1],
          }),
        },
      ],
    };

    const prevTitleAnimStyle = {
      opacity: animTitle.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
      transform: [
        {
          scale: animTitle.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.75],
          }),
        },
      ],
    };

    const backAnimStyle = {
      opacity: animCloseBackToggle.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
    };

    const closeAnimStyle = {
      opacity: animCloseBackToggle.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    };

    return {
      titleAnimStyle,
      prevTitleAnimStyle,
      backAnimStyle,
      closeAnimStyle,
    };
  };

  render() {
    const { isHome, onBack, onClose } = this.props;
    const { title, prevTitle } = this.state;
    const {
      titleAnimStyle,
      prevTitleAnimStyle,
      backAnimStyle,
      closeAnimStyle,
    } = this._getAnimStyles();

    return (
      <Animated.View style={[styles.header]}>
        <Animated.View
          pointerEvents={isHome ? 'none' : 'auto'}
          style={[styles.headerIconContainer, backAnimStyle]}
        >
          <Icon
            containerStyle={styles.headerIconContainer}
            iconStyle={styles.headerIcon}
            underlayColor="transparent"
            onPress={onBack}
            color="white"
            name="chevron-left"
          />
        </Animated.View>

        <Animated.Text style={[styles.title, titleAnimStyle]}>{title}</Animated.Text>
        <Animated.Text style={[styles.title, prevTitleAnimStyle]}>{prevTitle}</Animated.Text>

        <Animated.View
          pointerEvents={isHome ? 'auto' : 'none'}
          style={[styles.headerIconContainer, closeAnimStyle]}
        >
          <Icon
            containerStyle={styles.headerIconContainer}
            iconStyle={styles.headerIcon}
            underlayColor="transparent"
            onPress={onClose}
            color="white"
            name="close"
          />
        </Animated.View>
      </Animated.View>
    );
  }
}

export default SettingsHeader;
