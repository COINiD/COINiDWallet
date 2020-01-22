import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, ActivityIndicator, TouchableOpacity, View,
} from 'react-native';
import { LineChart } from 'react-native-svg-charts';
import * as shape from 'd3-shape';

import { Text, FontScale } from '.';
import { numFormat } from '../utils/numFormat';
import { colors, fontWeight, fontSize } from '../config/styling';

import { withExchangeRateContext } from '../contexts/ExchangeRateContext';
import { withGlobalRange } from '../contexts/GlobalContext';

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

class Graph extends PureComponent {
  constructor(props, context) {
    super(props);

    const { ticker, coinTitle } = context.coinid;

    this.state = {
      diffType: 'percent',
      graphHeight: 128,
      ticker,
      coinTitle,
    };
  }

  _diffRaw = () => {
    const dataPoints = this._getCurrentDataPoints();

    const first = dataPoints[0];
    const last = dataPoints[dataPoints.length - 1];

    return last - first;
  };

  _diffRound = () => {
    const { exchangeRateContext } = this.props;
    const { currency } = exchangeRateContext;

    // Round to max 3 decimals, extra *1000 and /1000
    const diff = Math.round(this._diffRaw() * 1000) / 1000;

    if (diff === 0) {
      return '< 0,001';
    }

    return numFormat(diff, currency, 3);
  };

  _diffPercent = () => {
    const dataPoints = this._getCurrentDataPoints();

    return numFormat(Math.round((this._diffRaw() / dataPoints[0]) * 100 * 100) / 100);
  };

  _diffValue = () => {
    const { exchangeRateContext } = this.props;
    const { currency } = exchangeRateContext;

    const { diffType } = this.state;

    if (diffType === 'percent') {
      return `${this._diffPercent()}%`;
    }
    return `${this._diffRound()} ${currency}`;
  };

  _getStyle = () => {
    const { theme } = this.context;
    return themedStyleGenerator(theme);
  };

  _getCurrentDataPoints = () => {
    const { range } = this.props;
    const { toggleRange, onLayout, exchangeRateContext } = this.props;
    const { dataPointsForAllRanges } = exchangeRateContext;

    return dataPointsForAllRanges[range];
  };

  render() {
    const styles = this._getStyle();
    const { ticker, coinTitle, graphHeight } = this.state;

    const {
      toggleRange, onLayout, exchangeRateContext, range,
    } = this.props;
    const { currency, exchangeRate } = exchangeRateContext;

    const diffColor = () => (this._diffRaw() < 0.0 ? styles.negative : styles.positive);

    const dataPoints = this._getCurrentDataPoints();

    return (
      <View style={styles.container} onLayout={onLayout}>
        <View style={styles.graphHeader}>
          <FontScale
            fontSizeMax={fontSize.h2}
            fontSizeMin={fontSize.h4}
            text={`${coinTitle} ${ticker}/${currency}     ${this._diffValue()}`}
            widthScale={0.96}
          >
            {({ fontSize }) => (
              <View style={[styles.textContainer]}>
                <View style={styles.textContainer}>
                  <Text style={[styles.coinText, styles.coinTitle, { fontSize }]}>{coinTitle}</Text>
                  <Text style={[styles.coinText, styles.coinTicker, { fontSize }]}>
                    {ticker}/{currency}
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
            <TouchableOpacity onPress={toggleRange}>
              <Text style={styles.currencyText}>Past {range}</Text>
            </TouchableOpacity>
            <Text style={[styles.currencyText, styles.coinDiffContainer, styles.coinDiff]}>
              {numFormat(exchangeRate, currency, undefined, 1)} {currency}
            </Text>
          </View>
        </View>

        <View
          style={{ height: graphHeight, marginBottom: 8 }}
          onLayout={(e) => {
            const ratio = 128 / 343; // ratio according to design.
            this.setState({ graphHeight: ratio * e.nativeEvent.layout.width });
          }}
        >
          <LineChart
            style={{ height: graphHeight }}
            dataPoints={dataPoints || []}
            curve={shape.curveLinear}
            showGrid
            numberOfTicks={1}
            animationDuration={300}
            svg={{
              style: styles.line,
              strokeWidth: 2,
            }}
            breakpointGradient={{
              breakpoint: dataPoints[0],
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
};

Graph.propTypes = {
  exchangeRateContext: PropTypes.shape().isRequired,
  range: PropTypes.string.isRequired,
};

export default withGlobalRange(withExchangeRateContext()(Graph));
