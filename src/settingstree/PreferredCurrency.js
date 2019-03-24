import config from '../config/settings';

let timer;
const PreferredCurrency = (state) => {
  const { settings, childGoBack, settingHelper } = state;

  const items = config.availableCurrencies.map(currency => ({
    title: currency,
    onPress: () => {
      clearTimeout(timer);
      timer = setTimeout(() => childGoBack(), 400);
      settingHelper.update('currency', currency);
    },
    ...(settings.currency === currency ? { rightIcon: { name: 'check' } } : { hideChevron: true }),
  }));

  return [
    {
      items,
      listHint: 'Select your preferred currency for use in graph and currency conversions.',
    },
  ];
};

export default PreferredCurrency;
