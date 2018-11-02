import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components';
import { LineChart, YAxis } from 'react-native-svg-charts';
import { LinearGradient, Stop } from 'react-native-svg';
import * as shape from 'd3-shape';
import Settings from '../../config/settings';
import ExchangeHelper from '../../utils/exchangeHelper';
import { numFormat } from '../../utils/numFormat';
import themeableStyles from './styles';
import { colors } from '../../config/styling';

export default class Graph extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      dataPoints: [],
      labels: [],
      range: undefined,
      currency: undefined,
      currentPrice: 0.0,
      diffType: 'percent',
      graphHeight: 128,
    };
  }

  componentDidMount() {
    const { ticker, coinTitle } = this.context.coinid;
    this.setState({ticker, coinTitle});

    this.settingHelper = this.context.settingHelper;
    this.exchangeHelper = ExchangeHelper(ticker);

    this._onSettingsUpdated(this.settingHelper.getAll());

    this.settingHelper.on('updated', this._onSettingsUpdated);
    this.exchangeHelper.on('syncedexchange', this._refreshFiatData);
  }

  componentWillUnmount() {
    this.settingHelper.removeListener('updated', this._onSettingsUpdated);
  }

  _refreshFiatData = () => {
    const dataPoints = this.exchangeHelper.getDataPoints(this.currentCurrency, this.currentRange),
          currentPrice = this.exchangeHelper.getCurrentPrice(this.currentCurrency);

    this.setState({
      isLoading: false,
      dataPoints, 
      currentPrice
    });
  }

  _onSettingsUpdated = settings => {
    const { currency, range: rangeIndex } = settings,
          range = Settings.ranges[rangeIndex];

    this.setState({ currency, range });

    this.currentCurrency = currency;
    this.currentRange = range;

    this._refreshFiatData();
  };

  _diffRaw = () => {
    var first = this.state.dataPoints[0];
    var last = this.state.dataPoints[this.state.dataPoints.length - 1];
    return last - first;
  }

  _diffRound = () => {
    // Round to max 3 decimals, extra *1000 and /1000
    let diff = Math.round(this._diffRaw() * 1000) / 1000;

    if (diff === 0) {
      return '< 0,001';
    }

    return numFormat(diff, this.state.currency, 3);
  }

  _diffPercent = () => {
    // Round to max 2 decimals, extra *100 and /100
    return numFormat(
      Math.round(this._diffRaw() / this.state.dataPoints[0] * 100 * 100) / 100
    );
  }

  _diffValue = () => {
    if (this.state.diffType == 'percent') {
      return this._diffPercent() + '%';
    } else {
      return this._diffRound() + ' ' + this.state.currency;
    }
  }

  _getStyle = () => {
    const { theme } = this.context;
    return themeableStyles(theme);
  }

  render() {
    const styles = this._getStyle();
    const {ticker, coinTitle} = this.state;

    const toggleDiff = () => {
      /*
      this.setState({
        diffType: this.state.diffType == 'percent' ? 'currency' : 'percent',
      });
      */
    };

    const toggleRange = () => {
      this.props.toggleRange();
    };

    const diffColor = () => {
      return this._diffRaw() < 0.0 ? styles.negative : styles.positive;
    }

    if (this.state.isLoading) {
      return (
        <ActivityIndicator animating size={'small'} style={styles.loader} />
      );
    }

    return (
      <View style={styles.container} onLayout={this.props.onLayout}>
        <View style={styles.graphHeader}>
          <View style={[styles.textContainer]}>
            <View style={styles.textContainer}>
              <Text style={[styles.coinText, styles.coinTitle]}>
                {coinTitle}
              </Text>
              <TouchableOpacity onPress={() => this.props.toggleCurrency()}>
                <Text style={[styles.coinText, styles.coinTicker]}>
                  {ticker}/{this.state.currency}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.coinDiffContainer}>
              <Text
                style={[styles.coinText, styles.coinDiff, diffColor()]}
              >
                {this._diffValue()}
              </Text>
            </View>
          </View>
          <View style={[styles.textContainer]}>
            <TouchableOpacity onPress={() => toggleRange()}>
              <Text style={styles.currencyText}>
                Past {this.state.range}
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.currencyText,
                styles.coinDiffContainer,
                styles.coinDiff,
              ]}
            >
              {numFormat(this.state.currentPrice, this.state.currency, undefined, 1)}{' '}
              {this.state.currency}
            </Text>
          </View>
        </View>

        <View
          style={{ height: this.state.graphHeight, marginBottom: 8 }}
          onLayout={e => {
            let ratio = 128 / 343; // ratio according to design.
            let graphHeight = ratio * e.nativeEvent.layout.width;
            this.setState({ graphHeight });
          }}
        >
          <LineChart
            style={{ height: this.state.graphHeight }}
            dataPoints={ this.state.dataPoints }
            curve={shape.curveLinear}
            showGrid={true}
            numberOfTicks={1}
            animationDuration={300}
            svg={{
              style: styles.line,
              strokeWidth: 2,
            }}
            breakpointGradient={{
              breakpoint: this.state.dataPoints[0],
              colorBelow: colors.orange,
              colorAbove: colors.green,
            }}
          />
        </View>
      </View>
    );
  }
}

Graph.contextTypes = {
  type: PropTypes.string,
  theme: PropTypes.string,
  coinid: PropTypes.object,
  settingHelper: PropTypes.object,
};

Graph.propTypes = {
  currency: PropTypes.string,
  range: PropTypes.number,
};

Graph.defaultProps = {
  currency: Settings.currency,
  range: 0,
};
