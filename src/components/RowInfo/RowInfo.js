'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Text } from '../../components';

import styles from './styles';

export default class RowInfo extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { children, title, style, childStyle, titleStyle, multiLine, ellipsizeMode, numberOfLines, selectable, onLayout } = this.props;
    const textProps = { ellipsizeMode, numberOfLines, selectable};

    const renderContent = () => {
      if(React.isValidElement(children)) {
        return (<View style={childStyle}>{children}</View>);
      }

      let childTextStyle = styles.childTextStyle;
      if(multiLine) {
        childTextStyle = styles.childMultiLineTextStyle
      }

      return (
        <Text style={ [ styles.rowText, childTextStyle, childStyle ] } {...textProps}>
          { children }
        </Text>
      );
    }

    let rowStyle = styles.row;
    let rowTitleStyle = {};
    if(multiLine) {
      rowStyle = styles.multiRow;
      rowTitleStyle = styles.multiTitle
    }

    return (
      <View style={ [ rowStyle, style] } onLayout={onLayout}>
        <Text style={ [ styles.rowText, styles.rowTitle, rowTitleStyle, titleStyle] }>{ title }</Text>
        { renderContent() }
      </View>
    )
  }
};

RowInfo.propTypes = {
  title: PropTypes.string,
  childStyle: PropTypes.object,
  titleStyle: PropTypes.object,
  multiLine: PropTypes.bool,
  ellipsizeMode: PropTypes.string,
  numberOfLines: PropTypes.number,
  selectable: PropTypes.bool
};

RowInfo.defaultProps = {
  title: '',
  childStyle: {},
  titleStyle: {},
  ellipsizeMode: 'middle',
  numberOfLines: 0,
  selectable: false
};
