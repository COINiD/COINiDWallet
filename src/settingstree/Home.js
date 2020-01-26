import { Linking } from 'react-native';
import config from '../config/settings';

const getOfflineTransportTitle = (state) => {
  const { settings } = state;

  const currentKey = settings.preferredColdTransport;
  const titles = config.coldTransportTypes
    .filter(item => item.key === currentKey)
    .map(item => item.title);

  if (titles.length === 0) {
    titles.push(config.coldTransportTypes[0].title);
  }

  return titles[0];
};

const getPreferredCurrencyTitle = (state) => {
  const { settings } = state;
  return settings.currency;
};

const getLanguageTitle = (state) => {
  const { settings } = state;
  return `languages.${settings.language}`;
};

const getViewLockExplanation = (state) => {
  const { hasCOINiD, hasHotWallet, settings } = state;

  if (!hasHotWallet) {
    return 'viewlock.listhint.missinghotwallet';
  }

  if (!hasCOINiD && !settings.usePasscode) {
    return 'viewlock.listhint.missingcoinid';
  }

  return 'viewlock.listhint.text';
};

const getPasscodeTimingTitle = (state) => {
  const { settings } = state;

  const currentDuration = settings.lockAfterDuration;
  const titles = config.lockDurations
    .filter(item => item.milliseconds === currentDuration)
    .map(item => item.title);
  if (titles.length === 0) {
    titles.push(config.lockDurations[0].title);
  }

  return titles[0];
};

const Home = (state) => {
  const {
    gotoRoute,
    hasCOINiD,
    hasHotWallet,
    hasAnyWallets,
    settingHelper,
    settings,
    activeWallets,
    goBack,
  } = state;

  return [
    {
      headline: 'general',
      items: [
        {
          title: 'viewlock',
          hideChevron: true,
          switchButton: true,
          disabled: !hasHotWallet || (!hasCOINiD && !settings.usePasscode),
          switched: hasHotWallet ? settings.usePasscode : false,
          onSwitch: () => {
            settingHelper.toggle('usePasscode');
          },
        },
        {
          title: 'requireunlocking',
          onPress: () => gotoRoute('Passcode'),
          disabled: hasHotWallet ? !settings.usePasscode : true,
          rightTitle: `${getPasscodeTimingTitle(state)}`,
        },
      ],
      listHint: getViewLockExplanation(state),
    },
    {
      items: [
        {
          title: 'offlinetransport',
          onPress: () => gotoRoute('OfflineTransport'),
          rightTitle: `${getOfflineTransportTitle(state)}`,
        },
        {
          title: 'preferredcurrency',
          onPress: () => gotoRoute('PreferredCurrency'),
          rightTitle: `${getPreferredCurrencyTitle(state)}`,
        },
        {
          title: 'language',
          onPress: () => gotoRoute('Language'),
          rightTitle: `${getLanguageTitle(state)}`,
        },
      ],
    },
    {
      items: [
        {
          title: 'signmessage',
          onPress: () => {
            if (activeWallets.length === 1) {
              const [{ snapTo, openSignMessage }] = activeWallets;

              goBack();
              snapTo();
              openSignMessage();
            } else {
              gotoRoute('SignMessage');
            }
          },
          disabled: !activeWallets.length,
        },
        {
          title: 'verifymessage',
          onPress: () => {
            if (activeWallets.length > 0) {
              const [{ snapTo, openVerifyMessage }] = activeWallets;

              goBack();
              snapTo();
              openVerifyMessage();
            }
          },
          disabled: !activeWallets.length,
        },
      ],
    },
    {
      items: [
        {
          title: 'accountinformation',
          onPress: () => {
            if (state.activeWallets.length === 1) {
              state.gotoRoute('AccountInformation', { wallet: state.activeWallets[0] });
            } else {
              state.gotoRoute('AccountList');
            }
          },
          disabled: !state.activeWallets.length,
        },
      ],
    },
    {
      headline: 'community',
      items: [
        {
          title: 'telegramchat',
          onPress: () => Linking.openURL(config.telegramUrl),
        },
        {
          title: 'twitter',
          onPress: () => Linking.openURL(config.twitterUrl),
        },
        {
          title: 'instagram',
          onPress: () => Linking.openURL(config.instagramUrl),
        },
        {
          title: 'giveusfeedback',
          onPress: () => Linking.openURL(config.feedbackUrl),
        },
        {
          title: 'howtoguides',
          onPress: () => Linking.openURL(config.guidesUrl),
        },
      ],
    },
    {
      items: [
        {
          title: 'about',
          onPress: () => gotoRoute('About'),
        },
      ],
    },
  ];
};

export default Home;
