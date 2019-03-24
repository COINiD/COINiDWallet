import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, Text as ReactText, ViewPropTypes,
} from 'react-native';
import { Text } from '.';

import { colors, fontWeight } from '../config/styling';

const styles = StyleSheet.create({
  row: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  multiRow: {
    marginVertical: 8,
  },
  multiTitle: {
    marginBottom: 8,
  },
  rowTitle: {
    color: colors.getTheme('light').fadedText,
    flexShrink: 1,
  },
  rowText: {
    ...fontWeight.medium,
  },
  childStyle: { flexGrow: 1 },
  childTextStyle: {
    textAlign: 'right',
  },
  childMultiLineTextStyle: {},
});

export default class RowInfo extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    childStyle: PropTypes.oneOfType([ViewPropTypes.style, ReactText.propTypes.style]),
    titleStyle: ReactText.propTypes.style,
    multiLine: PropTypes.bool,
    ellipsizeMode: PropTypes.string,
    numberOfLines: PropTypes.number,
    selectable: PropTypes.bool,
    style: ViewPropTypes.style,
    onLayout: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

  static defaultProps = {
    title: '',
    style: {},
    childStyle: {},
    titleStyle: {},
    ellipsizeMode: 'middle',
    numberOfLines: 0,
    selectable: false,
    multiLine: false,
    children: null,
    onLayout: () => {},
  };

  render() {
    const {
      children,
      title,
      style,
      childStyle,
      titleStyle,
      multiLine,
      ellipsizeMode,
      numberOfLines,
      selectable,
      onLayout,
    } = this.props;
    const textProps = { ellipsizeMode, numberOfLines, selectable };

    const renderContent = () => {
      if (React.isValidElement(children)) {
        return <View style={[styles.childStyle, childStyle]}>{children}</View>;
      }

      let { childTextStyle } = styles;
      if (multiLine) {
        childTextStyle = styles.childMultiLineTextStyle;
      }

      return (
        <Text
          style={[styles.childStyle, styles.rowText, childTextStyle, childStyle]}
          {...textProps}
        >
          {children}
        </Text>
      );
    };

    let rowStyle = styles.row;
    let rowTitleStyle = {};
    if (multiLine) {
      rowStyle = styles.multiRow;
      rowTitleStyle = styles.multiTitle;
    }

    return (
      <View style={[rowStyle, style]} onLayout={onLayout}>
        <Text style={[styles.rowText, styles.rowTitle, rowTitleStyle, titleStyle]}>{title}</Text>
        {renderContent()}
      </View>
    );
  }
}
