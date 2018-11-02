import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Platform, View, TouchableHighlight } from 'react-native';
import LottieView from 'lottie-react-native';
import { Text } from '../../components';
import styles from './styles';

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

  tickAnims = [];

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
              source={require('../../animations/tick.json')}
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
