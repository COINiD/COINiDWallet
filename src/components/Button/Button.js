import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import themeableStyles from './styles';

class Button extends PureComponent {
  constructor (props) {
    super(props);
  }
  
  _getStyle = () => {
    const { theme } = this.context;
    return themeableStyles(theme);
  }

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
  }

  _getExtraTextStyle = () => {
    const { link } = this.props;

    const extraStyles = [];

    if (link) {
      extraStyles.push(this._getStyle().linkText);
    }

    return extraStyles;
  }

  render() {
    const { text, onPress, style, textStyle, children, isLoading, loadingText, disabled, onLayout, } = this.props;
    const styles = this._getStyle();
    const extraStyle = this._getExtraStyle();
    const extraTextStyle = this._getExtraTextStyle();

    const _renderContent = () => {
      if (isLoading) {
        return (
          <View style={{ flexDirection: 'row' }} >
            <Text style={[styles.buttonText, textStyle]}>{ loadingText }</Text>
            <ActivityIndicator style={ styles.loadingIndicator } size="small" color="#ffffff" />
          </View>
        );
      }

      if (React.isValidElement(children)) {
        return (children);
      }

      return (<Text style={[styles.buttonText, extraTextStyle, textStyle]}>{ children }</Text>);
    }

    return (
      <TouchableOpacity
        style={ [styles.button, style, extraStyle, ((disabled && !isLoading) ? styles.disabled : null)] }
        onPress={ onPress }
        disabled={ disabled }
      >
        <View style={ [styles.buttonInner] } onLayout={onLayout}>
          { _renderContent() }
        </View>
      </TouchableOpacity>
    );
  }
};

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
