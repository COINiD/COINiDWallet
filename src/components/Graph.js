import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, ActivityIndicator, TouchableOpacity, View,
} from 'react-native';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';

import { Text, FontScale } from '.';
import Settings from '../config/settings';
import ExchangeHelper from '../utils/exchangeHelper';
import { numFormat } from '../utils/numFormat';
import { colors, fontWeight, fontSize } from '../config/styling';

const themedStyleGenerator = theme => StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  graphHeader: {
    marginBottom: 18,
  },
  textContainer: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  coinTitle: {
    marginRight: 4,
    marginBottom: 6,
    ...fontWeight.bold,
  },
  coinText: {
    fontSize: fontSize.h2,
    ...fontWeight.normal,
  },
  coinTicker: {
    color: colors.getTheme(theme).fadedText,
  },
  coinDiffContainer: {
    flex: 1,
  },
  coinDiff: {
    textAlign: 'right',
  },
  currencyText: {
    color: colors.getTheme(theme).fadedText,
    fontSize: fontSize.small,
    ...fontWeight.normal,
  },
  positive: {
    color: colors.green,
  },
  negative: {
    color: colors.orange,
  },
});

export default class Graph extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      dataPoints: [],
      range: undefined,
      currency: undefined,
      currentPrice: 0.0,
      diffType: 'percent',
      graphHeight: 128,
    };
  }

  componentDidMount() {
    const { ticker, coinTitle } = this.context.coinid;
    this.setState({ ticker, coinTitle });

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
    const dataPoints = this.exchangeHelper.getDataPoints(this.currentCurrency, this.currentRange);

    const currentPrice = this.exchangeHelper.getCurrentPrice(this.currentCurrency);

    this.setState({
      isLoading: false,
      dataPoints,
      currentPrice,
    });
  };

  _onSettingsUpdated = (settings) => {
    const { currency, range: rangeIndex } = settings;

    const range = Settings.ranges[rangeIndex];

    this.setState({ currency, range });

    this.currentCurrency = currency;
    this.currentRange = range;

    this._refreshFiatData();
  };

  _diffRaw = () => {
    const first = this.state.dataPoints[0];
    const last = this.state.dataPoints[this.state.dataPoints.length - 1];
    return last - first;
  };

  _diffRound = () => {
    // Round to max 3 decimals, extra *1000 and /1000
    const diff = Math.round(this._diffRaw() * 1000) / 1000;

    if (diff === 0) {
      return '< 0,001';
    }

    return numFormat(diff, this.state.currency, 3);
  };

  _diffPercent = () => numFormat(Math.round((this._diffRaw() / this.state.dataPoints[0]) * 100 * 100) / 100);

  _diffValue = () => {
    if (this.state.diffType == 'percent') {
      return `${this._diffPercent()}%`;
    }
    return `${this._diffRound()} ${this.state.currency}`;
  };

  _getStyle = () => {
    const { theme } = this.context;
    return themedStyleGenerator(theme);
  };

  render() {
    const styles = this._getStyle();
    const { ticker, coinTitle } = this.state;

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

    const diffColor = () => (this._diffRaw() < 0.0 ? styles.negative : styles.positive);

    if (this.state.isLoading) {
      return <ActivityIndicator animating size="small" style={styles.loader} />;
    }

    return (
      <View style={styles.container} onLayout={this.props.onLayout}>
        <View style={styles.graphHeader}>
          <FontScale
            fontSizeMax={fontSize.h2}
            fontSizeMin={fontSize.h4}
            text={`${coinTitle} ${ticker}/${this.state.currency}     ${this._diffValue()}`}
            widthScale={0.96}
          >
            {({ fontSize }) => (
              <View style={[styles.textContainer]}>
                <View style={styles.textContainer}>
                  <Text style={[styles.coinText, styles.coinTitle, { fontSize }]}>{coinTitle}</Text>
                  <Text style={[styles.coinText, styles.coinTicker, { fontSize }]}>
                    {ticker}/{this.state.currency}
                  </Text>
                </View>

                <View style={styles.coinDiffContainer}>
                  <Text style={[styles.coinText, styles.coinDiff, diffColor(), { fontSize }]}>
                    {this._diffValue()}
                  </Text>
                </View>
              </View>
            )}
          </FontScale>
          <View style={[styles.textContainer]}>
            <TouchableOpacity onPress={() => toggleRange()}>
              <Text style={styles.currencyText}>Past {this.state.range}</Text>
            </TouchableOpacity>
            <Text style={[styles.currencyText, styles.coinDiffContainer, styles.coinDiff]}>
              {numFormat(this.state.currentPrice, this.state.currency, undefined, 1)}{' '}
              {this.state.currency}
            </Text>
          </View>
        </View>

        <View
          style={{ height: this.state.graphHeight, marginBottom: 8 }}
          onLayout={(e) => {
            const ratio = 128 / 343; // ratio according to design.
            const graphHeight = ratio * e.nativeEvent.layout.width;
            this.setState({ graphHeight });
          }}
        >
          <LineChart
            style={{ height: this.state.graphHeight }}
            dataPoints={this.state.dataPoints || []}
            curve={shape.curveLinear}
            showGrid
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
