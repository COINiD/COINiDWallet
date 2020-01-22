/**
 * Helper for retrieving fees.
 * All fees are displayed as fee-per-byte (in satoshis)
 */

import { EventEmitter } from 'events';
import { mockableUrl } from 'node-mock-server/react-native/utils';
import storageHelper from './storageHelper';
import Settings from '../config/settings';

const apiUrl = mockableUrl('https://min-api.cryptocompare.com/data');

const fetchFromHistoryApi = async (range, ticker, currency, duration, aggregate) => {
  const url = `${apiUrl}/`
    + `histo${range}?fsym=${ticker.toUpperCase()}&tsym=${currency.toUpperCase()}&limit=${parseInt(
      duration / aggregate,
    )}&aggregate=${aggregate}`;

  const result = await fetch(url);
  const json = await result.json();

  if (json.Response === 'Error') {
    return undefined;
  }

  return json.Data;
};

const fetchFromPriceApi = async (ticker, currency) => {
  const url = `${apiUrl}/` + 'price' + `?fsym=${ticker.toUpperCase()}&tsyms=${currency.toUpperCase()}`;

  const result = await fetch(url);
  const json = await result.json();

  if (json.Response === 'Error') {
    return undefined;
  }

  return json[currency];
};

const fetchFromHistoricPriceApi = (ticker, currency, timestamp) => {
  const url = `${apiUrl}/`
    + 'pricehistorical'
    + `?fsym=${ticker}&tsyms=${currency}&ts=${parseInt(timestamp, 10)}`;

  return fetch(url)
    .then(r => r.json())
    .then(j => j[ticker][currency]);
};

class ExchangeHelper extends EventEmitter {
  constructor(coin, initialCurrency) {
    super();

    coin = coin.replace(/^t/, '');

    this.currentCurrency = initialCurrency;

    this.storage = storageHelper(coin);
    this.ticker = coin;
    this.currencyArr = Settings.availableCurrencies;

    this.syncEveryMs = 60000;

    this.exchangeInfo = {
      lastUpdated: 0,
    };

    this.storage.get('exchangeInfo').then((exchangeInfo) => {
      if (exchangeInfo === null) {
        return false;
      }

      if (exchangeInfo.lastUpdated) {
        this.exchangeInfo = exchangeInfo;
        this.emit('syncedexchange');
      }
    });

    this.sync();
  }

  setCurrentCurrency = (currentCurrency) => {
    this.currentCurrency = currentCurrency;
    this.sync();
  };

  sync = async () => {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    const exchangeInfo = await this.fetchExchangeData();

    this.exchangeInfo = exchangeInfo;
    this.exchangeInfo.lastUpdated = Date.now();

    await this.storage.set('exchangeInfo', this.exchangeInfo);
    this.emit('syncedexchange');

    this.syncTimer = setTimeout(this.sync, this.syncEveryMs);
  };

  fetchExchangeData = async () => {
    const pArr = this.currencyArr.map((c) => {
      if (this.currentCurrency !== c) {
        return this.getExchangeInfoForCurrency(c);
      }

      return this.fetchExchangeDataForCurrency(c);
    });

    const ret = await Promise.all(pArr);

    // update exchangeInfo
    for (let i = 0; i < this.currencyArr.length; i += 1) {
      if (ret[i]) {
        this.exchangeInfo[this.currencyArr[i]] = {
          ...this.exchangeInfo[this.currencyArr[i]],
          ...ret[i],
        };
      }
    }

    return this.exchangeInfo;
  };

  fetchExchangeDataForCurrency = async (currency) => {
    const apiSettings = [
      { range: 'minute', aggregate: 8, duration: 24 * 60 },
      { range: 'hour', aggregate: 1, duration: 24 * 7 },
      { range: 'hour', aggregate: 4, duration: 30 * 24 },
      { range: 'day', aggregate: 2, duration: 365 },
    ];

    const pArr = apiSettings.map(s => fetchFromHistoryApi(s.range, this.ticker, currency, s.duration, s.aggregate));
    pArr.push(this.fetchCurrentPrice(currency));
    const [day, week, month, year, current] = await Promise.all(pArr);

    const oldCurrencyInfo = this.getExchangeInfoForCurrency(currency);

    return {
      lastUpdated: Date.now(),
      day: day || oldCurrencyInfo.day,
      week: week || oldCurrencyInfo.week,
      month: month || oldCurrencyInfo.month,
      year: year || oldCurrencyInfo.year,
      current: current || oldCurrencyInfo.current,
    };
  };

  fetchCurrentPrice = currency => fetchFromPriceApi(this.ticker, currency);

  fetchHistoricPrice = (currency, timestamp) => fetchFromHistoricPriceApi(this.ticker, currency, timestamp).then((historicPrice) => {
    if (this.exchangeInfo[currency] === undefined) {
      this.exchangeInfo[currency] = {};
    }

    if (this.exchangeInfo[currency].historicPrices === undefined) {
      this.exchangeInfo[currency].historicPrices = {};
    }

    this.exchangeInfo[currency].historicPrices[timestamp] = historicPrice;

    this.storage.set('exchangeInfo', this.exchangeInfo);

    return historicPrice;
  });

  getCurrencyData = (currency) => {
    if (this.currencyArr.indexOf(currency) === -1) {
      // add if missing from currencyArr
      this.currencyArr.push(currency);
      this.sync();
    }

    if (!this.exchangeInfo.hasOwnProperty(currency)) {
      return {};
    }

    return this.exchangeInfo[currency];
  };

  getCurrencyRangeData = (currency, range) => {
    const currencyData = this.getCurrencyData(currency);

    if (!currencyData.hasOwnProperty(range) || !Array.isArray(currencyData[range])) {
      return [];
    }

    return currencyData[range];
  };

  getDataPoints = (currency, range) => this.getCurrencyRangeData(currency, range).map(e => e.close);

  getDataPointsForAllRanges = currency => ({
    day: this.getDataPoints(currency, 'day'),
    week: this.getDataPoints(currency, 'week'),
    month: this.getDataPoints(currency, 'month'),
    year: this.getDataPoints(currency, 'year'),
  });

  getCurrentPrice = (currency) => {
    const currencyData = this.getCurrencyData(currency);

    if (!currencyData.hasOwnProperty('current')) {
      return 0;
    }

    return currencyData.current;
  };

  getHistoricPrice = (currency, timestamp) => {
    const currencyData = this.getCurrencyData(currency);

    if (currencyData.historicPrices === undefined) {
      return 0;
    }

    if (currencyData.historicPrices[timestamp] === undefined) {
      return 0;
    }

    return currencyData.historicPrices[timestamp];
  };

  getExchangeInfo = () => this.exchangeInfo;

  getExchangeInfoForCurrency = (currency) => {
    if (this.exchangeInfo && this.exchangeInfo[currency]) {
      return this.exchangeInfo[currency];
    }
    return {};
  };

  convert = async (amount, currency) => {
    if (!amount) {
      return 0;
    }

    const price = this.getCurrentPrice(currency);

    if (price) {
      return price * amount;
    }

    const fetchedPrice = await this.fetchCurrentPrice(currency);
    return fetchedPrice * amount;
  };

  convertOnTime = async (amount, currency, timestamp) => {
    const price = this.getHistoricPrice(currency, timestamp);

    if (price) {
      return price * amount;
    }

    const fetchedPrice = await this.fetchHistoricPrice(currency, timestamp);
    return fetchedPrice * amount;
  };
}

const exchangeHelperCache = {}; // for local caching so we dont create several for same coin.

module.exports = (coin, initialCurrency) => {
  if (exchangeHelperCache[coin] === undefined) {
    exchangeHelperCache[coin] = new ExchangeHelper(coin, initialCurrency);
  }

  return exchangeHelperCache[coin];
};
