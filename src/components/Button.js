import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Text } from '.';

import {
  colors, fontSize, fontWeight, fontStack, gridMultiplier,
} from '../config/styling';

const themedStyleGenerator = theme => StyleSheet.create({
  slimButton: {
    height: 22 + gridMultiplier * 2,
  },
  button: {
    backgroundColor: colors.getTheme(theme).button,
    borderRadius: 8,
    flexDirection: 'row',
    flexGrow: 1,
    height: 32 + gridMultiplier * 2,
  },
  disabled: {
    backgroundColor: colors.getTheme(theme).disabledButton,
  },
  linkButton: {
    backgroundColor: colors.getTheme(theme).linkButton,
  },
  linkText: {
    color: colors.getTheme(theme).linkButtonText,
  },
  bigButton: {
    height: 40 + gridMultiplier * 2,
  },
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.getTheme(theme).buttonText,
    fontFamily: fontStack.primary,
    fontSize: fontSize.h3,
    alignSelf: 'center',
    ...fontWeight.medium,
  },
  loadingIndicator: {
    marginLeft: 5,
  },
});

class Button extends PureComponent {
  _getStyle = () => {
    const { theme } = this.context;
    return themedStyleGenerator(theme);
  };

  _getExtraStyle = () => {
    const { big, link, slim } = this.props;

    const extraStyles = [];

    if (big) {
      extraStyles.push(this._getStyle().bigButton);
    }

    if (slim) {
      extraStyles.push(this._getStyle().slimButton);
    }

    if (link) {
      extraStyles.push(this._getStyle().linkButton);
    }

    return extraStyles;
  };

  _getExtraTextStyle = () => {
    const { link } = this.props;

    const extraStyles = [];

    if (link) {
      extraStyles.push(this._getStyle().linkText);
    }

    return extraStyles;
  };

  render() {
    const {
      text,
      onPress,
      style,
      textStyle,
      children,
      isLoading,
      loadingText,
      disabled,
      onLayout,
      testID,
    } = this.props;
    const styles = this._getStyle();
    const extraStyle = this._getExtraStyle();
    const extraTextStyle = this._getExtraTextStyle();

    const _renderContent = () => {
      if (isLoading) {
        return (
          <View style={{ flexDirection: 'row' }}>
            <Text style={[styles.buttonText, textStyle]}>{loadingText}</Text>
            <ActivityIndicator style={styles.loadingIndicator} size="small" color="#ffffff" />
          </View>
        );
      }

      if (React.isValidElement(children)) {
        return children;
      }

      return <Text style={[styles.buttonText, extraTextStyle, textStyle]}>{children}</Text>;
    };

    return (
      <TouchableOpacity
        style={[styles.button, style, extraStyle, disabled && !isLoading ? styles.disabled : null]}
        onPress={onPress}
        disabled={disabled}
        testID={testID}
      >
        <View style={[styles.buttonInner]} onLayout={onLayout}>
          {_renderContent()}
        </View>
      </TouchableOpacity>
    );
  }
}

Button.propTypes = {
  text: PropTypes.string,
  loadingText: PropTypes.string,
  onPress: PropTypes.func,
};

Button.defaultProps = {
  text: 'Button Text',
  loadingText: 'Loading',
  onPress: () => console.log('Button Pressed'),
};

Button.contextTypes = {
  theme: PropTypes.string,
};

export default Button;
