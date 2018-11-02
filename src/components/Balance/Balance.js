import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text as DefaultText } from 'react-native';
import { Text } from '..';
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

  componentWillUnmount() {
    this.settingHelper.removeListener('updated', this._onSettingsUpdated);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.balance !== this.props.balance) {
      this._refreshFiatBalance(nextProps.balance);
    }
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

  _onLayout = (e) => {
    this.setState({ layoutWidth: e.nativeEvent.layout.width });
  }

  render() {
    const styles = this._getStyle();
    const {
      fiatBalance, currency, ticker, layoutWidth,
    } = this.state;
    const { balance, style } = this.props;

    const textLength = (`${numFormat(balance, ticker)} ${ticker}`).length;

    let fontSize = 67 * (layoutWidth / 40) / textLength;
    fontSize = fontSize > 40 ? 40 : fontSize;
    fontSize = fontSize < 12 ? 12 : fontSize;

    const lineHeight = 50 * fontSize / 40;
    const currencyFontSize = 28 * fontSize / 40;
    const currencyLineHeight = 33 * fontSize / 40;


    return (
      <View style={[styles.container, style]}>
        <Text style={styles.coinText} numberOfLines={1} onLayout={this._onLayout}>
          <DefaultText style={{ fontSize, lineHeight }}>
            {numFormat(balance, ticker)}
          </DefaultText>
          <DefaultText style={[styles.ticker, { fontSize }]}>
            {` ${ticker}`}
          </DefaultText>
        </Text>
        <TouchableOpacity style={{ alignSelf: 'flex-start' }} onPress={() => this.props.toggleCurrency()}>
          <Text style={[styles.currencyText, {fontSize: currencyFontSize, lineHeight: currencyLineHeight}]}>
            {`${numFormat(fiatBalance, currency)} ${currency}`}
          </Text>
        </TouchableOpacity>
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
