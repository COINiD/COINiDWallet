export default {
  coin : 'testnet',
  appReturnScheme : 'coinid-tbtc',
  coldWalletMode: true,
  language: 'system',
  availableLanguages : ['system','en','de','fr','es','pt','eo','sv'],
  currency: 'USD',
  availableCurrencies : ['USD','EUR','JPY','GBP','CAD','CHF','KRW','NZD','SEK','NOK','DKK'],
  ranges: ['day', 'week', 'month', 'year'],
  refreshRates: {
    exchangeRate: 600000, // 10 minutes
    account: 600000, // 10 minutes
  },
  coldTransportTypes: [
    {
      key: '',
      title: 'settings.coldtransport.showdialog.title',
      description: 'settings.coldtransport.showdialog.description',
    },
    {
      key: 'qr',
      title: 'settings.coldtransport.qrcodes.title',
      description: 'settings.coldtransport.qrcodes.description',
    },
    {
      key: 'ble',
      title: 'settings.coldtransport.ble.title',
      description: 'settings.coldtransport.ble.description',
    },
  ],
  lockDurations: [
    { milliseconds: 0, title: 'settings.lockduration.immediately' },
    { milliseconds: 60000, title: 'settings.lockduration.1minute' },
    { milliseconds: 300000, title: 'settings.lockduration.5minutes' },
    { milliseconds: 900000, title: 'settings.lockduration.15minutes' },
    { milliseconds: 1800000, title: 'settings.lockduration.30minutes' },
    { milliseconds: 3600000, title: 'settings.lockduration.1hour' },
    { milliseconds: 14400000, title: 'settings.lockduration.4hours' },
  ],
  aboutUrl: 'https://coinid.org',
  feedbackUrl: 'https://coinid.org/feedback',
  guidesUrl: 'https://coinid.org/guides',
  telegramUrl: 'https://t.me/joinchat/IARCoBAdhQOIEN_7u941Qg',
  twitterUrl: 'https://twitter.com/COINiDGroup',
  instagramUrl: 'https://www.instagram.com/coinidgroup',
  offlineGuideUrl: {
    ios: 'https://coinid.org/guides/preparing-ios-cold-wallet',
    android: 'https://coinid.org/guides/preparing-android-cold-wallet',
  },
  isTestnet : true,
};
