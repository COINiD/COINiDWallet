import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';
import ExchangeHelper from '../utils/exchangeHelper';

import { withGlobalCurrency } from '../contexts/GlobalContext';
import { numFormat } from '../utils/numFormat';

class ConvertCurrency extends PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    currency: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    ticker: PropTypes.string.isRequired,
    time: PropTypes.number,
  };

  static defaultProps = {
    time: null,
  };

  constructor(props) {
    super(props);

    const { ticker } = props;
    this.exchangeHelper = ExchangeHelper(ticker);

    this.state = {
      exchangeRate: 0,
    };
  }

  componentDidMount() {
    this.exchangeHelper.on('syncedexchange', this._onSyncedExchange);
    this._onSyncedExchange();
  }

  componentDidUpdate(prevProps) {
    const { currency } = this.props;
    if (prevProps.currency !== currency) {
      this.setState({ exchangeRate: 0 }, this._onSyncedExchange);
    }
  }

  componentWillUnmount() {
    this.exchangeHelper.removeListener('syncedexchange', this._onSyncedExchange);
  }

  _onSyncedExchange = async () => {
    const { time, currency } = this.props;
    const { exchangeRate: oldExchangeRate } = this.state;

    let exchangeRate = 0;

    if (time) {
      exchangeRate = await this.exchangeHelper.convertOnTime(1, currency, time);
    } else {
      exchangeRate = await this.exchangeHelper.convert(1, currency);
    }

    if (exchangeRate !== oldExchangeRate) {
      this.setState({ exchangeRate });
    }
  };

  render() {
    const { children, value, currency } = this.props;
    const { exchangeRate } = this.state;

    if (!exchangeRate) {
      const fiatValue = 0;
      const fiatText = `Loading... ${currency}`;
      return children({ fiatValue, currency, fiatText });
    }

    const fiatValue = Big(value).times(exchangeRate);
    const fiatText = `${numFormat(fiatValue, currency)} ${currency}`;

    return children({ fiatValue, currency, fiatText });
  }
}

export default withGlobalCurrency(ConvertCurrency);
