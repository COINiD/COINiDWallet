import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text as DefaultText } from 'react-native';
import { Text, FontScale } from '.';
import ConvertCurrency from './ConvertCurrency';

import Settings from '../config/settings';
import { numFormat } from '../utils/numFormat';

import { colors, fontWeight, fontSize } from '../config/styling';

const themedStyleGenerator = theme => StyleSheet.create({
  container: {
    margin: 0,
  },
  coinText: {
    fontSize: fontSize.h1,
    padding: 0,
    margin: 0,
    ...fontWeight.black,
  },
  ticker: {
    fontWeight: '400',
    ...fontWeight.normal,
  },
  currencyText: {
    color: colors.getTheme(theme).fadedText,
    fontSize: 28,
    lineHeight: 33,
    margin: 0,
  },
  positive: {
    color: colors.green,
  },
  negative: {
    color: colors.orange,
  },
  testnetConversionWarning: { fontSize: fontSize.smaller, color: colors.orange, marginTop: 4 },
});

export default class Balance extends PureComponent {
  constructor(props, context) {
    super(props);

    const { coinid, theme } = context;
    const { ticker } = coinid;

    const styles = themedStyleGenerator(theme);

    this.state = {
      ticker,
      styles,
    };
  }

  _renderBalance = ({ fiatText }) => {
    const { styles } = this.state;

    function TestnetWarning() {
      if (!Settings.isTestnet) {
        return null;
      }

      return (
        <Text style={styles.testnetConversionWarning}>
          Warning: Testnet coins have no real value. Conversion is only shown for testing purposes.
        </Text>
      );
    }

    return (
      <FontScale
        fontSizeMax={28}
        fontSizeMin={10}
        lineHeightMax={33}
        text={fiatText}
        widthScale={0.6}
      >
        {({ fontSize, lineHeight }) => (
          <View style={{ alignSelf: 'flex-start' }}>
            <Text style={[styles.currencyText, { fontSize, lineHeight }]} allowFontScaling={false}>
              {fiatText}
            </Text>

            <TestnetWarning />
          </View>
        )}
      </FontScale>
    );
  };

  render() {
    const { ticker, styles } = this.state;
    const { balance, style } = this.props;

    const balanceText = `${numFormat(balance, ticker)} ${ticker}`;

    return (
      <View style={[styles.container, style]}>
        <FontScale
          fontSizeMax={50}
          fontSizeMin={12}
          lineHeightMax={62.5}
          text={balanceText}
          widthScale={0.9}
        >
          {({ fontSize, lineHeight }) => (
            <Text style={styles.coinText} numberOfLines={1} allowFontScaling={false}>
              <DefaultText style={{ fontSize, lineHeight }} allowFontScaling={false}>
                {numFormat(balance, ticker)}
              </DefaultText>
              <DefaultText style={[styles.ticker, { fontSize }]} allowFontScaling={false}>
                {` ${ticker}`}
              </DefaultText>
            </Text>
          )}
        </FontScale>

        <ConvertCurrency value={balance}>{this._renderBalance}</ConvertCurrency>
      </View>
    );
  }
}

Balance.contextTypes = {
  type: PropTypes.string,
  theme: PropTypes.string,
  coinid: PropTypes.object,
  settingHelper: PropTypes.object,
};

Balance.propTypes = {
  amount: PropTypes.number,
  coin: PropTypes.string,
};

Balance.defaultProps = {
  amount: 0,
};
