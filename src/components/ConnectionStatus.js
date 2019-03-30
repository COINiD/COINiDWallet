import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { Text } from '.';

import { fontWeight } from '../config/styling';

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: '#000000',
    ...fontWeight.normal,
  },
  header: {
    fontSize: 16,
    color: '#000000',
  },
  content: {
    height: 56,
    justifyContent: 'center',
  },
  touch: {
    paddingHorizontal: 16,
  },
  container: {
    marginHorizontal: -8,
    backgroundColor: '#FA503C',
    borderRadius: 10,
    shadowRadius: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.18,
  },
});

export default class ConnectionStatus extends PureComponent {
  constructor(props) {
    super(props);

    const { width } = Dimensions.get('window');

    this.beginTop = -73;
    this.visibleTop = 0;
    this.exitTop = -73;
    this.beginLeft = -width;
    this.visibleLeft = 0;
    this.exitLeft = width;

    this.state = {
      left: new Animated.Value(this.beginLeft),
      isVisible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.connected !== this.props.connected) {
      this._handleAnimationChange(nextProps.connected);
    }
  }

  _handleAnimationChange = (connected) => {
    if (connected) {
      this._exitAnimation();
    } else {
      this._enterAnimation();
    }
  };

  _enterAnimation = () => {
    const { left } = this.state;

    this.setState({ isVisible: true });

    Animated.spring(left, {
      toValue: this.visibleLeft,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {});
  };

  _exitAnimation = () => {
    const { left } = this.state;

    Animated.timing(left, {
      toValue: this.exitLeft,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      left.setValue(this.beginLeft);
      this.setState({ isVisible: false });
    });
  };

  _onPress = () => {};

  render() {
    const { isVisible, left } = this.state;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            display: isVisible ? 'flex' : 'none',
            marginBottom: 8,
            transform: [{ translateX: left }],
          },
        ]}
      >
        <TouchableOpacity style={styles.touch} onPress={this._onPress}>
          <View style={styles.content}>
            <Text style={styles.header}>No Connection</Text>
            <Text style={styles.text}>Check your internet connection.</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

ConnectionStatus.contextTypes = {
  theme: PropTypes.string,
};

ConnectionStatus.propTypes = {
  connected: PropTypes.bool,
};

ConnectionStatus.defaultProps = {
  connected: undefined,
};
