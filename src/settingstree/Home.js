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

const getViewLockExplanation = (state) => {
  const { hasCOINiD, hasHotWallet, settings } = state;

  if (!hasHotWallet) {
    return 'View lock requires an installed hot wallet.';
  }

  if (!hasCOINiD && !settings.usePasscode) {
    return 'View lock requires COINiD Vault.';
  }

  return 'View lock is unlocked with COINiD Vault.';
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
    gotoRoute, hasCOINiD, hasHotWallet, hasAnyWallets, settingHelper, settings,
  } = state;

  return [
    {
      headline: 'General',
      items: [
        {
          title: 'View lock',
          hideChevron: true,
          switchButton: true,
          disabled: !hasHotWallet || (!hasCOINiD && !settings.usePasscode),
          switched: hasHotWallet ? settings.usePasscode : false,
          onSwitch: () => {
            settingHelper.toggle('usePasscode');
          },
        },
        {
          title: 'Require unlocking',
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
          title: 'Offline transport',
          onPress: () => gotoRoute('OfflineTransport'),
          rightTitle: `${getOfflineTransportTitle(state)}`,
        },
        {
          title: 'Preferred currency',
          onPress: () => gotoRoute('PreferredCurrency'),
          rightTitle: `${getPreferredCurrencyTitle(state)}`,
        },
        {
          title: 'Remove account',
          onPress: () => gotoRoute('Reset'),
          disabled: !hasAnyWallets,
        },
      ],
    },
    {
      headline: 'Community',
      items: [
        {
          title: 'Telegram chat',
          onPress: () => Linking.openURL(config.telegramUrl),
        },
        {
          title: 'Twitter',
          onPress: () => Linking.openURL(config.twitterUrl),
        },
        {
          title: 'Instagram',
          onPress: () => Linking.openURL(config.instagramUrl),
        },
        {
          title: 'Give us feedback',
          onPress: () => Linking.openURL(config.feedbackUrl),
        },
        {
          title: 'How to guides',
          onPress: () => Linking.openURL(config.guidesUrl),
        },
      ],
    },
    {
      items: [
        {
          title: 'About',
          onPress: () => gotoRoute('About'),
        },
      ],
    },
  ];
};

export default Home;
