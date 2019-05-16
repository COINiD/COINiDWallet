import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Big from 'big.js';

import { withExchangeRateContext } from '../contexts/ExchangeRateContext';
import { numFormat } from '../utils/numFormat';

class ConvertCurrency extends PureComponent {
  static propTypes = {
    children: PropTypes.func.isRequired,
    value: PropTypes.number.isRequired,
    exchangeRateContext: PropTypes.shape({
      exchangeRate: PropTypes.number.isRequired,
      ticker: PropTypes.string.isRequired,
      currency: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const { children, value, exchangeRateContext } = this.props;
    const { currency, exchangeRate } = exchangeRateContext;

    if (!exchangeRate) {
      const fiatValue = 0;
      const fiatText = 'Loading...';
      return children({ fiatValue, currency, fiatText });
    }

    const fiatValue = Big(value).times(exchangeRate);
    const fiatText = `${numFormat(fiatValue, currency)} ${currency}`;

    return children({ fiatValue, currency, fiatText });
  }
}

// withExchangeRate(time)(Element)
export default withExchangeRateContext(props => props.time)(ConvertCurrency);
