import React, { PureComponent } from 'react';
import { View, Platform } from 'react-native';
import PropTypes from 'prop-types';
import MeasureText from 'react-native-measure-text';
import { fontStack } from '../../config/styling';

export default class FontScale extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      layoutWidth: 0,
      maxFontSizeWidth: undefined,
    };
  }

  componentDidMount() {
    this._updateFontSize(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { text } = nextProps;
    const { text: oldText } = this.props;

    if (text !== oldText) {
      this._updateFontSize(nextProps);
    }
  }

  _onLayout = (e) => {
    const { widthScale } = this.props;
    const {
      nativeEvent: {
        layout: { width },
      },
    } = e;
    this.setState({ layoutWidth: width * widthScale });
  };

  _updateFontSize = ({ text, fontSizeMax }) => {
    MeasureText.widths({
      texts: [text],
      fontSize: fontSizeMax,
      fontFamily: fontStack.primary,
      height: 100,
      fontWeight: '400',
    }).then((maxFontSizeWidth) => {
      this.setState({ maxFontSizeWidth });
    });
  };

  _calc = () => {
    const { layoutWidth, maxFontSizeWidth } = this.state;

    if (layoutWidth === 0) {
      return null;
    }

    if (maxFontSizeWidth === undefined) {
      return null;
    }

    const { fontSizeMax, fontSizeMin, lineHeightMax } = this.props;

    let fontSize = fontSizeMax;

    if (maxFontSizeWidth) {
      const percentageDiff = layoutWidth / maxFontSizeWidth;
      fontSize *= percentageDiff;

      if (Platform.OS === 'android') {
        fontSize = Math.floor(fontSize);
      }
    }

    fontSize = fontSize > fontSizeMax ? fontSizeMax : fontSize;
    fontSize = fontSize < fontSizeMin ? fontSizeMin : fontSize;

    const lineHeight = (lineHeightMax * fontSize) / fontSizeMax;

    return { fontSize, lineHeight };
  };

  render() {
    const renderChildren = () => {
      const { children, text } = this.props;
      const { fontSize = 0, lineHeight = 0 } = this._calc() || {};

      if (!fontSize) {
        return null;
      }

      return children({ fontSize, lineHeight, text });
    };

    return (
      <View {...this.props} onLayout={this._onLayout}>
        {renderChildren()}
      </View>
    );
  }
}

FontScale.propTypes = {
  children: PropTypes.func,
  text: PropTypes.string,
  fontSizeMax: PropTypes.number,
  fontSizeMin: PropTypes.number,
  lineHeightMax: PropTypes.number,
  widthScale: PropTypes.number,
};

FontScale.defaultProps = {
  children: () => {},
  text: '',
  fontSizeMax: 40,
  fontSizeMin: 12,
  lineHeightMax: 50,
  widthScale: 1,
};
