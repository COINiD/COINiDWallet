import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import ExchangeHelper from '../utils/exchangeHelper';

import { withTicker } from './WalletContext';
import { withGlobalCurrency } from './GlobalContext';

const ExchangeRateContext = React.createContext({});

class ExchangeRateContextProviderComponent extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
    ticker: PropTypes.string.isRequired,
    currency: PropTypes.string.isRequired,
    time: PropTypes.number,
  };

  static defaultProps = {
    children: null,
    time: undefined,
  };

  constructor(props) {
    super(props);

    this.state = {
      exchangeRate: 0,
    };
  }

  componentDidMount() {
    this._setupExchangeHelper();
  }

  componentDidUpdate(prevProps) {
    const { currency, ticker } = this.props;
    if (prevProps.ticker !== ticker) {
      this._setupExchangeHelper();
    }

    if (prevProps.currency !== currency) {
      if (this.exchangeHelper) {
        this.setState({ exchangeRate: 0 }, this._onSyncedExchange);
      }
    }
  }

  componentWillUnmount() {
    this.exchangeHelper.removeListener('syncedexchange', this._onSyncedExchange);
  }

  _setupExchangeHelper = () => {
    const { ticker } = this.props;

    if (ticker) {
      if (this.exchangeHelper) {
        this.exchangeHelper.removeListener('syncedexchange', this._onSyncedExchange);
      }

      this.exchangeHelper = ExchangeHelper(ticker);
      this.exchangeHelper.on('syncedexchange', this._onSyncedExchange);
      this.initialSyncTimer = setTimeout(this._onSyncedExchange, 100);
    }
  };

  _onSyncedExchange = async () => {
    const { time, currency } = this.props;
    const { exchangeRate: oldExchangeRate } = this.state;

    clearTimeout(this.initialSyncTimer);

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
    const { children, currency, ticker } = this.props;
    const { exchangeRate } = this.state;

    return (
      <ExchangeRateContext.Provider value={{ exchangeRate, currency, ticker }}>
        {children}
      </ExchangeRateContext.Provider>
    );
  }
}

export const ExchangeRateContextProvider = withTicker(
  withGlobalCurrency(ExchangeRateContextProviderComponent),
);

export const withExchangeRateContext = mapTime => (WrappedComponent) => {
  const Enhance = props => (
    <ExchangeRateContext.Consumer>
      {exchangeRateContext => (
        <WrappedComponent {...props} exchangeRateContext={exchangeRateContext} />
      )}
    </ExchangeRateContext.Consumer>
  );

  if (mapTime === undefined) {
    return Enhance;
  }

  const EnhanceHistoric = (props) => {
    let time = mapTime;

    if (typeof mapTime === 'function') {
      time = mapTime(props);
    }

    return <ExchangeRateContextProvider time={time}>{Enhance(props)}</ExchangeRateContextProvider>;
  };
  return EnhanceHistoric;
};

export default ExchangeRateContext;
