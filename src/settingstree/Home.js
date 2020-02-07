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
  return `currencies.${settings.currency.toLowerCase()}`;
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
    settingHelper,
    settings,
    activeWallets,
    goBack,
  } = state;

  return [
    {
      headline: 'settings.general.title',
      items: [
        {
          title: 'settings.viewlock.title',
          hideChevron: true,
          switchButton: true,
          disabled: !hasHotWallet || (!hasCOINiD && !settings.usePasscode),
          switched: hasHotWallet ? settings.usePasscode : false,
          onSwitch: () => {
            settingHelper.toggle('usePasscode');
          },
        },
        {
          title: 'settings.requireunlocking.title',
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
          title: 'settings.offlinetransport.title',
          onPress: () => gotoRoute('OfflineTransport'),
          rightTitle: `${getOfflineTransportTitle(state)}`,
        },
        {
          title: 'settings.preferredcurrency.title',
          onPress: () => gotoRoute('PreferredCurrency'),
          rightTitle: `${getPreferredCurrencyTitle(state)}`,
        },
        {
          title: 'settings.language.title',
          onPress: () => gotoRoute('Language'),
          rightTitle: `${getLanguageTitle(state)}`,
        },
      ],
    },
    {
      items: [
        {
          title: 'settings.signmessage.title',
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
          title: 'settings.verifymessage.title',
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
          title: 'settings.accountinformation.title',
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
      headline: 'settings.community.title',
      items: [
        {
          title: 'settings.telegramchat.title',
          onPress: () => Linking.openURL(config.telegramUrl),
        },
        {
          title: 'settings.twitter.title',
          onPress: () => Linking.openURL(config.twitterUrl),
        },
        {
          title: 'settings.instagram.title',
          onPress: () => Linking.openURL(config.instagramUrl),
        },
        {
          title: 'settings.giveusfeedback.title',
          onPress: () => Linking.openURL(config.feedbackUrl),
        },
        {
          title: 'settings.howtoguides.title',
          onPress: () => Linking.openURL(config.guidesUrl),
        },
      ],
    },
    {
      items: [
        {
          title: 'settings.about.title',
          onPress: () => gotoRoute('About'),
        },
      ],
    },
  ];
};

export default Home;
