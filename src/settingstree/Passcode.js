import config from '../config/settings';

let timer;
const Passcode = (state) => {
  const { settings, childGoBack, settingHelper } = state;

  const items = config.lockDurations.map(({ title, milliseconds }) => ({
    title,
    onPress: () => {
      clearTimeout(timer);
      timer = setTimeout(() => childGoBack(), 400);
      settingHelper.update('lockAfterDuration', milliseconds);
    },
    ...(settings.lockAfterDuration === milliseconds
      ? { rightIcon: { name: 'check' } }
      : { hideChevron: true }),
  }));

  return [
    {
      items,
      listHint: 'settings.lockduration.listhint',
    },
  ];
};

export default Passcode;
