

import numbro from 'numbro';

const initLocale = () => {
  if (numeral.locales.coinid === undefined) {
    numeral.register('locale', 'coinid', {
      delimiters: {
        thousands: ',',
        decimal: '.',
      },
    });
    numeral.locale('coinid');
  }
};

const validCryptoCurrencies = {
  BTC: true,
  TBTC: true,
  ETH: true,
  LTC: true,
  XMY: true,
  GRS: true,
};

const isCryptoCurrency = currency => (!!(currency && validCryptoCurrencies[currency]));

export const numFormat = (value, currency, decimals, variableDecimals) => {
  value = Number(value);

  if (isNaN(value)) {
    value = Number(0);
  }

  if (decimals === undefined) {
    decimals = isCryptoCurrency(currency) ? 8 : 2;
  }

  if (variableDecimals !== undefined) {
    if (value) {
      let firstDecimal = -Number(value.toExponential(0).split('e')[1]) + variableDecimals;

      if (firstDecimal > 8) {
        firstDecimal = 8;
      }

      if (firstDecimal > decimals) {
        decimals = firstDecimal;
      }
    }
  }

  return numbro(value).format({
    thousandSeparated: true,
    mantissa: decimals,
  });
};
