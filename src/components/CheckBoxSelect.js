import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, Platform, View, TouchableHighlight,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '.';

const styles = StyleSheet.create({
  container: {
    marginBottom: -16,
  },
  box: {
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 8,
    paddingLeft: 16,
    paddingRight: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  boxSelected: {
    backgroundColor: 'rgba(97, 122, 247, 0.1)',
  },
  title: {
    fontSize: 18,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
});

export default class CheckBoxSelect extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    onIndexChange: PropTypes.func.isRequired,
    selectedIndex: PropTypes.number,
  };

  static defaultProps = {
    selectedIndex: 0,
  };

  state = {};

  tickAnims = [];

  componentDidUpdate(prevProps) {
    const { selectedIndex } = this.props;
    if (prevProps.selectedIndex !== selectedIndex) {
      if (Platform.OS === 'ios') {
        this.tickAnims[prevProps.selectedIndex].setNativeProps({ progress: 25 });
        this.tickAnims[prevProps.selectedIndex].play(25, 0);
      } else {
        this.tickAnims[prevProps.selectedIndex].reset();
      }
      this.tickAnims[this.props.selectedIndex].reset();
      this.tickAnims[this.props.selectedIndex].play(0, 65);
    }
  }

  render() {
    const { data, onIndexChange, selectedIndex } = this.props;

    const renderItem = (item, index) => {
      const isSelected = index === selectedIndex;

      return (
        <TouchableHighlight
          key={index}
          onPress={() => onIndexChange(index)}
          style={[styles.box, isSelected ? styles.boxSelected : null]}
          disabled={isSelected}
          underlayColor="rgba(97, 122, 247, 0.05)"
        >
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.title}>{item.title}</Text>
            <LottieView
              style={styles.checkbox}
              ref={(c) => {
                this.tickAnims[index] = c;
              }}
              onLayout={() => (isSelected ? this.tickAnims[index].play() : null)}
              source={require('../animations/tick.json')}
              autoSize
              loop={false}
            />
          </View>
        </TouchableHighlight>
      );
    };

    return <View style={styles.container}>{data.map(renderItem)}</View>;
  }
}
