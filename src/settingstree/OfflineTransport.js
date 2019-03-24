import config from '../config/settings';

let timer;
const OfflineTransport = (state) => {
  const {
    settings, childGoBack, settingHelper, isBLESupported,
  } = state;

  const items = config.coldTransportTypes.map(({ key, title }) => {
    let disabled = false;
    if (key === 'ble' && !isBLESupported) {
      disabled = true;
    }

    return {
      title,
      disabled,
      onPress: () => {
        clearTimeout(timer);
        timer = setTimeout(() => childGoBack(), 400);
        settingHelper.update('preferredColdTransport', key);
      },
      ...(settings.preferredColdTransport === key
        ? { rightIcon: { name: 'check' } }
        : { hideChevron: true }),
    };
  });

  return [
    {
      items,
      listHint:
        'Select how you would like to transfer data between the COINiD Wallet and the COINiD Vault.',
    },
  ];
};

export default OfflineTransport;
