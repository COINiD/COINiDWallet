import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { Text } from '../../components';
import Settings from '../../config/settings';
import { numFormat } from '../../utils/numFormat';
import styles from './styles';
import { colors } from '../../config/styling';
import Big from 'big.js';

export default class ConnectionStatus extends PureComponent {
  
  constructor(props) {
    super(props);
    
    var {height, width} = Dimensions.get('window');

    this.beginTop = -73;
    this.visibleTop = 0;
    this.exitTop = -73;
    this.beginLeft = -width;
    this.visibleLeft = 0;
    this.exitLeft = width;

    this.state = {
      top: new Animated.Value(this.beginTop),
      left: new Animated.Value(this.beginLeft),
      isVisible: false,
    };
  }

  componentDidMount() {
    //this._handleAnimationChange(this.props.connected);
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.connected !== this.props.connected) {
      this._handleAnimationChange(nextProps.connected);
    }
  }

  _handleAnimationChange = (connected) => {
    if(connected) {
      this._exitAnimation();
    }
    else {
      this._enterAnimation();
    }
  }

  _enterAnimation = () => {
    this.setState({ isVisible: true });

    Animated.spring( this.state.left, {
      toValue: this.visibleLeft,
      duration: 400,
      useNativeDriver: true,
    }).start(() => { }); 
  }

  _exitAnimation = () => {
    Animated.timing( this.state.left, {
      toValue: this.exitLeft,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      this.state.left.setValue(this.beginLeft);
      this.setState({isVisible: false});
    });
  }

  _onPress = () => {

  }
  
  render() {
    const { top, isVisible } = this.state;

    return (
      <Animated.View style={[styles.container, { display: isVisible ? 'flex' : 'none', marginBottom: 8, transform:[{ translateX: this.state.left }] }]}>
        <TouchableOpacity style={styles.touch} onPress={ this._onPress }>
          <View style={styles.content}>
            <Text style={styles.header}>No Connection</Text>
            <Text style={styles.text}>Check your internet connection.</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
};

ConnectionStatus.contextTypes = {
  theme: PropTypes.string,
};

ConnectionStatus.propTypes = {
  connected: PropTypes.bool,
};

ConnectionStatus.defaultProps = {
  connected: undefined,
};