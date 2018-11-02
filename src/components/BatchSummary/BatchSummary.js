import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { Text } from '../../components';
import Settings from '../../config/settings';
import { numFormat } from '../../utils/numFormat';
import styles from './styles';
import { colors } from '../../config/styling';
import Big from 'big.js';

export default class BatchSummary extends PureComponent {
  
  constructor(props) {
    super(props);
    
    var {height, width} = Dimensions.get('window');

    this.beginTop = -73;
    this.visibleTop = 0;
    this.exitTop = -73;
    this.beginLeft = -width;
    this.visibleLeft = 0;
    this.exitLeft = width;

    this.scaleAnimated = new Animated.Value(1);
    this.prevPaymentCount = 0;

    this.state = {
      total: 0,
      count: 0,
      top: new Animated.Value(this.beginTop),
      left: new Animated.Value(this.beginLeft),
      counterScale: new Animated.Value(1),
      isVisible: false,
    };
  }

  componentDidMount() {
    const { ticker } = this.context.coinid;
    this.setState({ticker});
  }

  componentWillReceiveProps(nextProps) {
    this._parsePayments(nextProps.payments);

    if(nextProps.payments.length !== this.prevPaymentCount) {
      this.prevPaymentCount = nextProps.payments.length;
      this._handleAnimationChange(nextProps.payments);
    }
  }

  _handleAnimationChange = (payments) => {
    let count = payments.length;
    if(!count) {
      setTimeout(this._exitAnimation, 450);
    }
    else {
      this._enterAnimation();
    }
  }

  _parsePayments = (payments) => {
    let total = Number(payments.reduce((a, c) => a.plus(c.amount), Big(0))),
        count = payments.length;

    this.setState({
      total: total,
      count: count
    });
  }

  _enterAnimation = () => {
    this.setState({isVisible: true});
    this.state.counterScale.setValue(0);
    Animated.timing(this.state.counterScale, { 
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.spring( this.state.left, {
      toValue: this.visibleLeft,
      duration: 400,
      useNativeDriver: true,
    }).start(() => { }); 
  }

  _exitAnimation = () => {
    setTimeout(() => {
      Animated.timing( this.state.left, {
        toValue: this.exitLeft,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        this.state.left.setValue(this.beginLeft);
        this.setState({isVisible: false});
      });
    }, 400);

  }
  
  render() {
    const { total, count, top, isVisible, ticker } = this.state;
    const { onPress } = this.props;

    let counterScale = this.state.counterScale.interpolate({
      inputRange:  [0, 1/2, 2/2],
      outputRange: [1, 1.15, 1]
    })

    return (
      <Animated.View style={[styles.container, { display: isVisible ? 'flex' : 'none', transform:[{ translateX: this.state.left }] }]}>
        <TouchableOpacity style={styles.touch} onPress={ onPress }>
          <View style={styles.content}>
            <Animated.View style={[ styles.counterContainer, { transform: [ { scale: counterScale } ]} ]}>
              <Text style={styles.counter}>{ count }</Text>
            </Animated.View>
            <Text style={styles.header}>Transactions to sign</Text>
            <Text style={styles.text}>Total: { numFormat(total, ticker) } {ticker}</Text>
            <Icon color={ colors.white } containerStyle={styles.iconContainer} name="keyboard-arrow-up" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
};

BatchSummary.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
  settingHelper: PropTypes.object,
};

BatchSummary.propTypes = {
  payments: PropTypes.array,
};

BatchSummary.defaultProps = {
  payments: [],
};