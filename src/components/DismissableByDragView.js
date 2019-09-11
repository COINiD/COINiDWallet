import React, { PureComponent } from 'react';
import {
  StyleSheet, Animated, Dimensions, PanResponder, Easing, Platform,
} from 'react-native';
import PropTypes from 'prop-types';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
  },
  slideTop: {
    bottom: Dimensions.get('window').height,
  },
  slideBottom: {
    top: Platform.OS === 'android' ? Dimensions.get('window').height : 0,
  },
});

export default class DismissableByDragView extends PureComponent {
  static propTypes = {
    slide: PropTypes.oneOf(['slideTop', 'slideBottom']), // we can expand this to make the view come in from any direction
    showTime: PropTypes.number,
    initTime: PropTypes.number,
    onHide: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

  static defaultProps = {
    slide: 'slideTop',
    showTime: 3500,
    initTime: 100,
    onHide: () => {},
    children: null,
  };

  constructor(props) {
    super(props);

    this.pan = new Animated.ValueXY({ x: 0, y: 0 });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { slide } = this.props;

        if (slide === 'slideTop' || slide === 'slideBottom') {
          return Math.abs(gestureState.dy) > 5;
        }

        return false;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => {
        if (this.showTimer) {
          clearTimeout(this.showTimer.timeout);
        }
      },
      onPanResponderMove: Animated.event([null, { dx: this.pan.x, dy: this.pan.y }]),
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { slide } = this.props;

        const shouldDismiss = () => {
          if (slide === 'slideTop') {
            return gestureState.dy < -5;
          }

          if (slide === 'slideBottom') {
            return gestureState.dy > 5;
          }

          return false;
        };

        if (shouldDismiss()) {
          this.dismiss();
        } else {
          Animated.timing(this.pan.x, {
            duration: 200,
            toValue: 0,
            easing: Easing.out(Easing.poly(4)),
            useNativeDriver: true,
          }).start();

          Animated.timing(this.pan.y, {
            duration: 200,
            toValue: 0,
            easing: Easing.out(Easing.poly(4)),
            useNativeDriver: true,
          }).start();

          this.refreshShowTimer();
        }
      },
      onPanResponderTerminate: () => {
        this.pan.x.setValue(0);
        this.pan.y.setValue(0);
      },
    });

    this.state = {
      anim: new Animated.Value(0),
      animStyle: {},
    };
  }

  componentDidMount() {
    this.init();
  }

  refreshShowTimer = () => {
    const { showTime } = this.props;

    if (this.showTimer && showTime) {
      this.showTimer.timeout = setTimeout(() => {
        if (this.showTimer) {
          this.showTimer.callback();
        }
      }, showTime);
    }
  };

  init = async () => {
    const { initTime, showTime } = this.props;

    await new Promise(r => setTimeout(r, initTime));
    await this.show();

    await new Promise((r) => {
      const timeout = showTime ? setTimeout(r, showTime) : null;
      this.showTimer = { timeout, callback: r };
    });
    this.showTimer = null;
    await this.hide();
  };

  animate = (toValue, callback) => {
    const { anim } = this.state;

    Animated.timing(anim, {
      duration: 160,
      toValue,
      useNativeDriver: true,
    }).start(callback);
  };

  show = () => new Promise((resolve) => {
    const { anim } = this.state;
    anim.setValue(0);
    this.animate(1);
    resolve();
  });

  hide = () => new Promise((resolve) => {
    const { onHide } = this.props;

    const onAnimDone = () => {
      resolve();
      onHide();
    };

    this.animate(0, onAnimDone);
  });

  dismiss = () => new Promise((resolve) => {
    if (this.showTimer) {
      clearTimeout(this.showTimer.timeout);
      this.showTimer.callback();
      setTimeout(resolve, 300);
    } else {
      resolve();
    }
  });

  onLayout = ({ nativeEvent: { layout } }) => {
    const { slide } = this.props;
    const { height } = layout;
    const { anim } = this.state;

    let slideY = 0;
    let upPan = 0;
    let downPan = 0;

    if (slide === 'slideTop') {
      slideY = height;
      upPan = -1;
      downPan = 0.4;
    }

    if (slide === 'slideBottom') {
      slideY = -height;
      upPan = -0.4;
      downPan = 1;
    }

    const animStyle = {
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, slideY],
          }),
        },
        {
          translateY: this.pan.y.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [upPan, 0, downPan], // makes it more sluggish to drag down
          }),
        },
      ],
    };

    this.setState({ animStyle });
  };

  render() {
    const { children, slide } = this.props;
    const { animStyle } = this.state;

    return (
      <Animated.View
        style={[styles.container, styles[slide], animStyle]}
        onLayout={this.onLayout}
        {...this.panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    );
  }
}
