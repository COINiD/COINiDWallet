export default {
  coin : 'testnet',
  appReturnScheme : 'coinid-tbtc',
  coldWalletMode: true,
  language: 'system',
  availableLanguages : ['system','en','sv'],
  currency: 'USD',
  availableCurrencies : ['USD','EUR','JPY','GBP','CAD','CHF','KRW','NZD','SEK','NOK','DKK'],
  ranges: ['day', 'week', 'month', 'year'],
  // milliseconds
  refreshRates: {
    exchangeRate: 600000, // 10 minutes
    account: 600000, // 10 minutes
  },
  coldTransportTypes: [
    {
      key: '',
      title: 'Show dialog',
      description: 'Show dialog and lets you select which transport type to use.',
    },
    {
      key: 'qr',
      title: 'QR Codes',
      description: 'Uses QR Codes to communicate between wallet and offline device.',
    },
    {
      key: 'ble',
      title: 'Bluetooth Low Energy',
      description: 'Uses BLE to communicate between wallet and offline device.',
    },
  ],
  lockDurations: [
    { milliseconds: 0, title: 'Immediately' },
    { milliseconds: 60000, title: 'After 1 minute' },
    { milliseconds: 300000, title: 'After 5 minutes' },
    { milliseconds: 900000, title: 'After 15 minutes' },
    { milliseconds: 1800000, title: 'After 30 minutes' },
    { milliseconds: 3600000, title: 'After 1 hour' },
    { milliseconds: 14400000, title: 'After 4 hours' },
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
