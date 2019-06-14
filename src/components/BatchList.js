import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, FlatList, TouchableOpacity, View,
} from 'react-native';
import { Text, FontScale } from '.';
import { numFormat } from '../utils/numFormat';
import { colors, fontWeight, fontSize } from '../config/styling';

import WalletContext from '../contexts/WalletContext';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -16,
    overflow: 'visible',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemContainer: {
    padding: 6,
    paddingHorizontal: 16,
  },
  firstItem: {
    paddingTop: 0,
  },
  line: {
    marginTop: 7,
  },
  infoContainer: {},
  amountText: {
    ...fontWeight.medium,
  },
  addressText: {
    fontSize: fontSize.small,
  },
  noteText: {
    fontSize: fontSize.small,
    color: colors.getTheme('light').fadedText,
    marginBottom: 6,
  },
});

class BatchListItem extends PureComponent {
  static contextType = WalletContext;

  constructor(props, context) {
    super();
    const { coinid } = context;
    const { ticker } = coinid;

    this.state = {
      ticker,
    };
  }

  _onPress = () => {
    const { onPressItem, item } = this.props;
    onPressItem(item);
  };

  render() {
    const { ticker } = this.state;
    const { item, index } = this.props;

    const itemStyle = [styles.itemContainer];
    if (index === 0) {
      itemStyle.push(styles.firstItem);
    }

    return (
      <TouchableOpacity style={itemStyle} onPress={this._onPress} testID={`batch-item-${index}`}>
        <View style={styles.infoContainer}>
          <Text style={[styles.line, styles.amountText]}>
            {numFormat(item.amount, ticker)} {ticker}
          </Text>
          <FontScale
            fontSizeMax={fontSize.small}
            fontSizeMin={6}
            text={item.address}
            widthScale={1.0}
          >
            {({ fontSize }) => (
              <Text style={[styles.line, styles.addressText, { fontSize }]}>{item.address}</Text>
            )}
          </FontScale>
          <Text style={[styles.line, styles.noteText]}>{item.note ? item.note : 'no note'}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

export default class BatchList extends React.PureComponent {
  _onPressItem = (item) => {
    this.props.onPress(item);
  };

  _keyExtractor = (item, index) => `${index}`;

  _renderItem = ({ item, index }) => (
    <BatchListItem
      item={item}
      index={index}
      totalItems={this.props.batchedTxs.length}
      onPressItem={this._onPressItem}
    />
  );

  render() {
    const { batchedTxs, disabled } = this.props;

    return (
      <FlatList
        style={styles.container}
        data={batchedTxs}
        keyExtractor={this._keyExtractor}
        renderItem={this._renderItem}
        pointerEvents={disabled ? 'none' : null}
      />
    );
  }
}

BatchList.propTypes = {
  batchedTxs: PropTypes.array,
  disabled: PropTypes.bool,
};

BatchList.defaultProps = {
  batchedTxs: [],
  disabled: false,
};
