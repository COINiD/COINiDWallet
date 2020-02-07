import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, AppState, Animated } from 'react-native';
import { Button } from '.';

import { colors } from '../config/styling';
import { memoize } from '../utils/generic';

const themedStyleGenerator = memoize(theme => StyleSheet.create({
  altButton: {
    backgroundColor: colors.getTheme(theme).altCancelButton,
  },
  altButtonText: {
    color: colors.getTheme(theme).altCancelButtonText,
  },
  button: {
    backgroundColor: colors.getTheme(theme).cancelButton,
  },
  buttonText: {
    color: colors.getTheme(theme).cancelButtonText,
  },
}));

class CancelButton extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      height: new Animated.Value(0),
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    const { show } = this.props;
    this._handleShow(show);
  }

  componentWillReceiveProps(nextProps) {
    const { show: oldShow } = this.props;

    if (oldShow !== nextProps.show) {
      this._handleShow(nextProps.show);
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (newAppState) => {
    if (this.appState !== newAppState) {
      if (newAppState === 'active') {
        const { show } = this.props;
        this._handleShow(show);
      } else if (this.enterTimeout) {
        clearTimeout(this.enterTimeout);
      }

      this.appState = newAppState;
    }
  };

  _handleShow = (show) => {
    if (show) {
      this._enterAnimation();
    } else {
      this._exitAnimation();
    }
  };

  _enterAnimation = () => {
    const { height } = this.state;
    const { showTimeout, marginTop } = this.props;

    this.enterTimeout = setTimeout(() => {
      Animated.timing(height, {
        toValue: this.buttonHeight + marginTop,
        duration: 250,
      }).start(() => {});
    }, showTimeout);
  };

  _exitAnimation = () => {
    const { height } = this.state;

    if (this.enterTimeout) {
      clearTimeout(this.enterTimeout);
    }

    Animated.timing(height, {
      toValue: 0,
      duration: 250,
    }).start(() => {});
  };

  _getStyle = () => {
    const { theme } = this.context;
    return themedStyleGenerator(theme);
  };

  render() {
    const {
      onPress, children, style, marginTop, show,
    } = this.props;
    const { height } = this.state;
    const styles = this._getStyle();

    return (
      <Animated.View style={[{ height, overflow: 'hidden', backgroundColor: 'transparent' }]}>
        <Button
          onLayout={(c) => {
            this.buttonHeight = c.nativeEvent.layout.height;
          }}
          style={[styles.button, style, { marginTop }]}
          textStyle={styles.buttonText}
          onPress={onPress}
          {...this.props}
        >
          {children}
        </Button>
      </Animated.View>
    );
  }
}

CancelButton.contextTypes = {
  theme: PropTypes.string,
};

CancelButton.propTypes = {
  show: PropTypes.bool,
  onPress: PropTypes.func,
  showTimeout: PropTypes.number,
  marginTop: PropTypes.number,
};

CancelButton.defaultProps = {
  show: false,
  onPress: () => {},
  showTimeout: 5000,
  marginTop: 16,
};

export default CancelButton;
