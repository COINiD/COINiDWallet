import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text as DefaultText } from 'react-native';
import { Text, FontScale } from '..';
import Settings from '../../config/settings';
import ExchangeHelper from '../../utils/exchangeHelper';
import { numFormat } from '../../utils/numFormat';
import themeableStyles from './styles';
import { colors } from '../../config/styling';

export default class Balance extends PureComponent {
  constructor(props, context) {
    super(props);

    const { coinid, settingHelper } = context;
    const { ticker } = coinid;

    this.settingHelper = settingHelper;
    this.exchangeHelper = ExchangeHelper(ticker);

    this.state = {
      fiatBalance: 0.0,
      currency: undefined,
      layoutWidth: 320,
      ticker,
    };
  }

  componentDidMount() {
    this._onSettingsUpdated(this.settingHelper.getAll());

    this.settingHelper.on('updated', this._onSettingsUpdated);
    this.exchangeHelper.on('syncedexchange', this._onSyncedExchange);
  }

  componentWillReceiveProps(nextProps) {
    const { balance } = nextProps;
    const { balance: oldBalance } = this.props;

    if (balance !== oldBalance) {
      this._refreshFiatBalance(balance);
    }
  }

  componentWillUnmount() {
    this.settingHelper.removeListener('updated', this._onSettingsUpdated);
  }

  _refreshFiatBalance = (balance) => {
    this.exchangeHelper
      .convert(balance, this.currentCurrency)
      .then((fiatBalance) => {
        this.setState({ fiatBalance });
      });
  };

  _onSettingsUpdated = (settings) => {
    const { currency } = settings;
    this.setState({ currency });
    this.currentCurrency = currency;

    this._refreshFiatBalance(this.props.balance);
  };

  _onSyncedExchange = () => {
    this._refreshFiatBalance(this.props.balance);
  }

  _getStyle = () => {
    const { theme } = this.context;
    return themeableStyles(theme);
  }

  render() {
    const styles = this._getStyle();
    const {
      fiatBalance, currency, ticker,
    } = this.state;
    const { balance, style, toggleCurrency } = this.props;

    if (currency === undefined) {
      return null;
    }

    const balanceText = `${numFormat(balance, ticker)} ${ticker}`;
    const currencyText = `${numFormat(fiatBalance, currency)} ${currency}`;

    return (
      <View style={[styles.container, style]}>
        <FontScale
          fontSizeMax={50}
          fontSizeMin={12}
          lineHeightMax={62.5}
          text={balanceText}
          widthScale={0.90}
        >
          {({ fontSize, lineHeight }) => (
            <Text style={styles.coinText} numberOfLines={1}>
              <DefaultText style={{ fontSize, lineHeight }}>
                {numFormat(balance, ticker)}
              </DefaultText>
              <DefaultText style={[styles.ticker, { fontSize }]}>
                {` ${ticker}`}
              </DefaultText>
            </Text>
          )}
        </FontScale>

        <FontScale
          fontSizeMax={28}
          fontSizeMin={10}
          lineHeightMax={33}
          text={currencyText}
          widthScale={0.6}
        >
          {({ fontSize, lineHeight }) => (
            <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => toggleCurrency()}>
              <Text style={[styles.currencyText, { fontSize, lineHeight }]}>
                {currencyText}
              </Text>
            </TouchableOpacity>
          )}
        </FontScale>
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
  currency: PropTypes.string,
};

Balance.defaultProps = {
  amount: 0,
  currency: 'USD',
};
