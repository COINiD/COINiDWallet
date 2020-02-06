import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Big from 'big.js';

import Text from './Text';
import TranslatedText from './TranslatedText';

import { numFormat } from '../utils/numFormat';
import { colors, fontWeight, fontSize } from '../config/styling';

const styles = StyleSheet.create({
  text: {
    fontSize: fontSize.smaller,
    color: colors.white,
    opacity: 0.6,
    ...fontWeight.normal,
  },
  header: {
    color: colors.white,
    ...fontWeight.medium,
  },
  content: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touch: {
    paddingHorizontal: 16,
  },
  container: {
    marginBottom: 8,
    marginHorizontal: -8,
    backgroundColor: colors.getTheme('light').button,
    borderRadius: 10,
    shadowRadius: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
  },
  counter: {
    color: colors.getTheme('light').button,
    backgroundColor: 'transparent',
    ...fontWeight.medium,
  },
  counterContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    backgroundColor: colors.getTheme('light').buttonText,
    height: 24,
    minWidth: 24,
    alignSelf: 'center',
    borderRadius: 12,
  },
});

export default class BatchSummary extends PureComponent {
  constructor(props) {
    super(props);

    const { width } = Dimensions.get('window');

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
    this.setState({ ticker });
  }

  componentWillReceiveProps(nextProps) {
    this._parsePayments(nextProps.payments);

    if (nextProps.payments.length !== this.prevPaymentCount) {
      this.prevPaymentCount = nextProps.payments.length;
      this._handleAnimationChange(nextProps.payments);
    }
  }

  _handleAnimationChange = (payments) => {
    const count = payments.length;
    if (!count) {
      setTimeout(this._exitAnimation, 450);
    } else {
      this._enterAnimation();
    }
  };

  _parsePayments = (payments) => {
    const total = Number(payments.reduce((a, c) => a.plus(c.amount), Big(0)));
    const count = payments.length;

    this.setState({
      total,
      count,
    });
  };

  _enterAnimation = () => {
    this.setState({ isVisible: true });
    this.state.counterScale.setValue(0);
    Animated.timing(this.state.counterScale, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.spring(this.state.left, {
      toValue: this.visibleLeft,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {});
  };

  _exitAnimation = () => {
    setTimeout(() => {
      Animated.timing(this.state.left, {
        toValue: this.exitLeft,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        this.state.left.setValue(this.beginLeft);
        this.setState({ isVisible: false });
      });
    }, 400);
  };

  render() {
    const {
      total, count, top, isVisible, ticker,
    } = this.state;
    const { onPress } = this.props;

    const counterScale = this.state.counterScale.interpolate({
      inputRange: [0, 1 / 2, 2 / 2],
      outputRange: [1, 1.15, 1],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          { display: isVisible ? 'flex' : 'none', transform: [{ translateX: this.state.left }] },
        ]}
      >
        <TouchableOpacity style={styles.touch} onPress={onPress} testID="button-batch-summary">
          <View style={styles.content}>
            <Animated.View
              style={[styles.counterContainer, { transform: [{ scale: counterScale }] }]}
            >
              <Text style={styles.counter}>{count}</Text>
            </Animated.View>
            <TranslatedText style={styles.header}>batchsummary.transactionstosign</TranslatedText>
            <TranslatedText
              style={styles.text}
              options={{ total: numFormat(total, ticker), ticker }}
            >
              batchsummary.total
            </TranslatedText>
            <Icon
              color={colors.white}
              containerStyle={styles.iconContainer}
              name="keyboard-arrow-up"
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

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
