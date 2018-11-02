'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { DirectionIcon, Text } from '../../components';
import styles from './styles';
import Settings from '../../config/settings';
import { numFormat } from '../../utils/numFormat';
import { trimStrLength } from '../../utils/generic';

class BatchListItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    const { ticker } = this.context.coinid;
    this.setState({ticker});
  }

  _onPress = () => {
    this.props.onPressItem(this.props.item);
  };

  render() {
    const { ticker } = this.state;
    const { item, index } = this.props;

    const itemStyle = [styles.itemContainer];
    if(index === 0) {
      itemStyle.push(styles.firstItem);
    }

    return (
      <TouchableOpacity style={ itemStyle } onPress={ this._onPress }>
      
        <View style={ styles.infoContainer }>
          <Text style={ [styles.line, styles.amountText] }>{ numFormat(item.amount, ticker) } { ticker }</Text>
          <Text
            style={ [styles.line, styles.addressText] }
            ellipsizeMode={'middle'}
            numberOfLines={1}
          >
            { item.address }
          </Text>
          <Text style={ [styles.line, styles.noteText] }>{ item.note ? item.note : 'no note' }</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

BatchListItem.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

export default class BatchList extends React.PureComponent {
  _onPressItem = (item) => {
    this.props.onPress(item);
  };

  _keyExtractor = (item, index) => {
    return item.address;
  }

  _renderItem = ({ item, index }) => {
    return (
      <BatchListItem
        item={ item }
        index={ index }
        totalItems={ this.props.batchedTxs.length }
        onPressItem={ this._onPressItem }
      />
    );
  };

  render() {
    const { batchedTxs, disabled } = this.props;

    return (
    <FlatList
      style={ styles.container }
      data={ batchedTxs }
      keyExtractor={this._keyExtractor}
      renderItem={ this._renderItem }
      pointerEvents={disabled ? "none" : null}
      />
  )}
};

BatchList.propTypes = {
  batchedTxs: PropTypes.array,
  disabled: PropTypes.bool,
};

BatchList.defaultProps = {
  batchedTxs: [],
  disabled: false,
};
