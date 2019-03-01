

import React, { PureComponent } from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';
import themeableStyles from './styles';

class AppText extends PureComponent {
  constructor(props) {
    super(props);
  }

  refresh = () => {
    this.forceUpdate();
  };

  _updateStyle = () => {
    const props = this.props;


    const {
      h1, h2, h3, h4, small, smaller, faded, center, margin, p,
    } = props;


    const { theme } = this.context;


    const styles = themeableStyles(theme);

    this.style = [styles.text];

    if (h1) {
      this.style.push(styles.h1);
    }
    if (h2) {
      this.style.push(styles.h2);
    }
    if (h3) {
      this.style.push(styles.h3);
    }
    if (h4) {
      this.style.push(styles.h4);
    }
    if (small) {
      this.style.push(styles.small);
    }
    if (smaller) {
      this.style.push(styles.smaller);
    }
    if (faded) {
      this.style.push(styles.faded);
    }
    if (center) {
      this.style.push(styles.center);
    }
    if (margin) {
      this.style.push(styles.margin);
    }
    if (p) {
      this.style.push(styles.p);
    }

    if (props.style) {
      this.style.push(props.style);
    }
  };

  render() {
    this._updateStyle();

    return (
      <Text {...this.props} style={this.style} allowFontScaling={false}>
        {this.props.children}
      </Text>
    );
  }
}

AppText.contextTypes = {
  theme: PropTypes.string,
};

export default AppText;
