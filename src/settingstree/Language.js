import config from '../config/settings';

let timer;
const Language = (state) => {
  const { settings, childGoBack, settingHelper } = state;

  const items = config.availableLanguages.map(language => ({
    title: `languages.${language}`,
    disabled: false,
    onPress: () => {
      clearTimeout(timer);
      timer = setTimeout(() => childGoBack(), 400);
      settingHelper.update('language', language);
    },
    ...(settings.language === language ? { rightIcon: { name: 'check' } } : { hideChevron: true }),
  }));

  return [
    {
      items,
      listHint: 'settings.language.listhint',
    },
  ];
};

export default Language;
