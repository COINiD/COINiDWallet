import React, { PureComponent } from 'react';
import { StyleSheet, Text as ReactText } from 'react-native';
import PropTypes from 'prop-types';
import {
  colors, fontStack, fontWeight, fontSize,
} from '../config/styling';
import { memoize } from '../utils/generic';

const themedStyleGenerator = memoize(theme => StyleSheet.create({
  text: {
    color: colors.getTheme(theme).text,
    fontFamily: fontStack.primary,
    fontSize: fontSize.base,
    backgroundColor: 'transparent',
    ...fontWeight.normal,
  },
  p: {
    lineHeight: 22,
  },
  h1: {
    fontSize: fontSize.h1,
    lineHeight: 48,
    ...fontWeight.black,
  },
  h2: {
    fontSize: fontSize.h2,
    lineHeight: 26,
  },
  h3: {
    fontSize: fontSize.h3,
  },
  h4: {
    fontSize: fontSize.h4,
  },
  small: {
    fontSize: fontSize.small,
  },
  smaller: {
    fontSize: fontSize.smaller,
  },
  margin: {
    marginBottom: 16,
  },
  center: {
    textAlign: 'center',
  },
}));

class Text extends PureComponent {
  _updateStyle = () => {
    const { props } = this;

    const {
      h1, h2, h3, h4, small, smaller, faded, center, margin, p,
    } = props;

    const { theme } = this.context;

    const styles = themedStyleGenerator(theme);

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
    const { children } = this.props;

    return (
      <ReactText {...this.props} style={this.style} allowFontScaling={false}>
        {children}
      </ReactText>
    );
  }
}

Text.contextTypes = {
  theme: PropTypes.string,
};

export default Text;
