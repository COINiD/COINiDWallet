import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View, Animated, Easing,
} from 'react-native';
import Big from 'big.js';
import { Slider } from 'react-native-elements';
import { Text, RowInfo } from '..';
import { numFormat } from '../../utils/numFormat';
import FeeHelper from '../../utils/feeHelper';
import styles from './styles';
import { colors } from '../../config/styling';

export default class FeeSlider extends PureComponent {
  constructor(props, context) {
    super(props);

    const { ticker, coin } = context.coinid;

    this.txSize = 1000;
    this.fee = 1000;
    this.satByteTopActive = 0;
    this.satByteTopInactive = 30;
    this.width = 0;
    this.satByteWidth = 0;
    this.feeHelper = FeeHelper(coin);

    this.state = {
      fee: 1000,
      satoshiByte: 0,
      txSize: this.txSize,
      blocks: 0,
      timeMinutes: 10,
      satByteTop: new Animated.Value(this.satByteTopInactive),
      satByteLeft: 0,
      ticker,
    };

    this._updateCurrentFeeInfo();
    this.sliderVal = this.startValue;
  }

  componentDidMount() {
    this._updateProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.amount !== this.props.amount) {
      this._updateProps(nextProps);
    }
  }

  _updateProps = (props) => {
    this.batchedTransactions = props.batchedTransactions;
    this.amount = props.amount;
    this._updateTxSize();
    this._updateFee();
  }

  _updateTxSize = () => {
    const { coinid } = this.context;
    const fee = Big(this.fee);

    let amount = Big(this.amount);

    amount = amount.plus(fee);
    const amountSat = amount.times(1e8);

    try {
      this.txSize = coinid.estimateSize(amountSat, this.batchedTransactions);
    } catch (err) { console.log(err); }
  }

  _updateCurrentFeeInfo = () => {
    const fetchedFees = this.feeHelper.getFees();

    if (fetchedFees === undefined || fetchedFees.fees === undefined) {
      return false;
    }

    this.feeInfo = fetchedFees;
    /*
    this.feeInfo = {
      ...fetchedFees,
      fees: [],
    };

    for (let i = 0; i < 200; i += 1) {
      let realI = parseInt(fetchedFees.fees.length * i / 200, 10);
      if (realI >= fetchedFees.fees.length) {
        realI = fetchedFees.fees.length - 1;
      }

      this.feeInfo.fees.push(fetchedFees.fees[realI]);
    }
*/

    this.feeCount = this.feeInfo.fees.length - 1;
    this.startValue = parseInt(this.feeCount / 2, 10);
  }

  _getCurrentSatoshiPerByte = () => this.feeInfo.fees[this.sliderVal][1]

  _getCurrentBlocks = () => this.feeInfo.fees[this.sliderVal][0]

  _calculateFee = () => {
    const satoshiByte = this._getCurrentSatoshiPerByte();

    if (this.prevSatoshiByte === satoshiByte) {
      return;
    }
    this.prevSatoshiByte = satoshiByte;

    this.fee = 1000;
    this._updateTxSize();

    const doCalcFee = () => {
      this.fee = Number(Big(satoshiByte).times(this.txSize).div(1e8));
      this.prevTxSize = this.txSize;
      this._updateTxSize();

      if (this.txSize < this.prevTxSize) {
        this.txSize = this.prevTxSize;
        this.fee = Number(Big(satoshiByte).times(this.txSize).div(1e8));
      }
    };

    doCalcFee();
  }

  _getBlockTime = () => {
    const { coinid: { network: { blockTime } } } = this.context;

    if (blockTime === undefined) {
      return 10.0;
    }

    return blockTime;
  }

  _updateFee = () => {
    const { onChange } = this.props;

    this._calculateFee();

    const blocks = this._getCurrentBlocks();
    const blockTime = this._getBlockTime();
    const timeMinutes = blocks * blockTime;
    const satoshiByte = `${this._getCurrentSatoshiPerByte()}`;

    this.setState({
      satoshiByte,
      txSize: this.txSize,
      fee: this.fee,
      blocks,
      timeMinutes,
    });

    onChange(this.fee);
  }

  _setSliderVal = (sliderVal) => {
    sliderVal = parseInt(sliderVal, 10);

    if (sliderVal !== this.sliderVal) {
      this.sliderVal = sliderVal;
      this._updateFee();
      this._updateSliderPos();
    }
  }

  _updateSliderPos = () => {
    if (this.feeCount) {
      let satByteLeft = (12 + this.sliderVal * (this.width - 24) / this.feeCount - this.satByteWidth / 2);

      if (satByteLeft < 0) satByteLeft = 0;
      if (satByteLeft > this.width - this.satByteWidth) satByteLeft = this.width - this.satByteWidth;

      this.setState({ satByteLeft });
    }
  }

  _onSlidingStart = () => {
    Animated.timing(this.state.satByteTop, {
      toValue: this.satByteTopActive,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  _onSlidingComplete = () => {
    Animated.timing(this.state.satByteTop, {
      toValue: this.satByteTopInactive,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  _onLayout = (e) => {
    this.width = e.nativeEvent.layout.width;
    this.setState({ width: this.width });
    this._updateSliderPos();
  }

  _onSatByteLayout = (e) => {
    this.satByteWidth = e.nativeEvent.layout.width;
    this.setState({ satByteWidth: this.satByteWidth });
    this._updateSliderPos();
  }

  render() {
    const {
      satByteTop, satByteLeft, fee, timeMinutes, satoshiByte, txSize, blocks, ticker,
    } = this.state;

    const { disabled } = this.props;

    if (!this.feeInfo) {
      return null;
    }

    const { fees, lastUpdated } = this.feeInfo;

    let priority = 'Normal priority';

    if ((1 + this.sliderVal) < fees.length * (1 / 3)) {
      priority = 'Low priority';
    }

    if ((this.sliderVal) > fees.length * (2 / 3)) {
      priority = 'High priority';
    }

    const getWarning = () => {
      const getWarningText = () => {
        if (!lastUpdated) {
          return 'Fee estimation have never been synced so it may be inaccurate';
        }

        const msAgo = Date.now() - lastUpdated;
        const hoursAgo = msAgo / 1000 / 60 / 60;
        if (hoursAgo >= 1) {
          return `${hoursAgo.toFixed(0)} hours since fee estimation was synced so it may be inaccurate`;
        }

        return '';
      };

      const warning = getWarningText();
      if (warning) {
        return (<Text style={styles.warningText}>{ warning }</Text>);
      }

      return null;
    };

    const getEstimationText = () => {
      if (!blocks) {
        return (
          <Text style={styles.estimationText}>
            { `Warning: Highly uncertain when this transaction will be confirmed. Size: ${txSize} bytes` }
          </Text>
        );
      }

      return (
        <Text style={styles.estimationText}>
          { `${priority}: Estimated to confirm within ${blocks} blocks. (~${timeMinutes} min). Size: ${txSize} bytes` }
        </Text>
      );
    };

    const renderSlider = () => {
      if(this.feeCount <= 1) {
        return (
          <React.Fragment>
            <View style={{ height: 8 }} />
            { getEstimationText() }
          </React.Fragment>
        );
      }

      return (
        <React.Fragment>
          <Animated.View
            onLayout={this._onSatByteLayout}
            ref={c => this.refSatByte = c}
            pointerEvents="none"
            style={[styles.satByteDot, { transform: [{ translateY: satByteTop }, { translateX: satByteLeft }] }]}
          >
            <Text style={styles.satByteText}>
              { `${satoshiByte} sat/b` }
            </Text>
          </Animated.View>
          <Slider
            onSlidingStart={this._onSlidingStart}
            onValueChange={(val) => { this._setSliderVal(val); }}
            onSlidingComplete={this._onSlidingComplete}
            maximumValue={this.feeCount}
            minimumValue={0}
            step={1}
            value={this.startValue}
            thumbTintColor={colors.getTheme('light').button}
            thumbTouchSize={{ width: this.state.satByteWidth + 30, height: 80 }}
            thumbStyle={styles.thumb}
            minimumTrackTintColor={colors.lightGray}
            maximumTrackTintColor={colors.lightGray}
            trackStyle={styles.track}
            disabled={disabled}
          />
          { getEstimationText() }
        </React.Fragment>
      );
    };

    return (
      <View
        onLayout={this._onLayout}
        ref={c => this.refCont = c}
      >
        <RowInfo title="Fee" style={{ marginBottom: 0 }}>
          { `${numFormat(fee, ticker)} ${ticker}` }
        </RowInfo>
        { renderSlider() }
        { getWarning() }
      </View>
    );
  }
}

FeeSlider.contextTypes = {
  coinid: PropTypes.object,
  type: PropTypes.string,
  theme: PropTypes.string,
};

FeeSlider.propTypes = {
  batchedTransactions: PropTypes.array,
};

FeeSlider.defaultProps = {
  batchedTransactions: [],
};
