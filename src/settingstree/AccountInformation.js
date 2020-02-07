import { Alert, Clipboard, Platform } from 'react-native';
import Share from 'react-native-share';
import RNExitApp from 'react-native-exit-app';
import { t } from '../contexts/LocaleContext';

const resetAccount = ({ title, coinid }) => {
  Alert.alert(
    t(`settings.accountinformation.reset.${title.toLowerCase()}.alert`),
    t('settings.accountinformation.reset.hint'),
    [
      { text: t('generic.cancel'), onPress: () => {}, style: 'cancel' },
      {
        text: t('generic.ok'),
        onPress: () => {
          coinid
            .getStorage()
            .reset()
            .then(() => {
              RNExitApp.exitApp();
            });
        },
      },
    ],
    { cancelable: true },
  );
};

const onShare = (data) => {
  const options = {
    title: 'settings.accountinformation.share.title',
    message: data,
  };

  Share.open(options)
    .then(() => {
      if (Platform.OS === 'ios') {
        this.showStatus('settings.accountinformation.share.success');
      }
    })
    .catch(() => {});
};

const getShareIcon = () => ({
  linkIcon: Platform.OS === 'ios' ? 'share-apple' : 'share-google',
  linkText: 'generic.share',
  linkIconType: 'evilicon',
});

const getChainSections = ({ chainKeys, showStatus }) => chainKeys.map((chain, idx) => ({
  items: [
    {
      title: idx
        ? 'settings.accountinformation.changechain'
        : 'settings.accountinformation.externalchain',
      rightTitle: chain.publicKey,
      hideChevron: true,
      onPress: () => {
        Clipboard.setString(chain.publicKey);
        showStatus('settings.accountinformation.copiedpublickey', {
          ...getShareIcon(),
          onLinkPress: () => onShare(chain.publicKey),
        });
      },
    },
    {
      title: 'settings.accountinformation.derivationpath',
      rightTitle: `${chain.derivationPath}`,
      hideChevron: true,
      onPress: () => {
        Clipboard.setString(chain.derivationPath);
        showStatus('settings.accountinformation.copiedderivationscheme', {
          ...getShareIcon(),
          onLinkPress: () => onShare(chain.derivationPath),
        });
      },
    },
  ],
}));

const getAccountSection = ({ publicKey, derivationPath, showStatus }) => {
  const [, bip] = derivationPath.split('/');
  const derivationScheme = `BIP ${bip.replace("'", '')}`;

  return {
    items: [
      {
        title: 'settings.accountinformation.publickey',
        rightTitle: publicKey,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(publicKey);
          showStatus('settings.accountinformation.copiedpublickey', {
            ...getShareIcon(),
            onLinkPress: () => onShare(publicKey),
          });
        },
      },
      {
        title: 'settings.accountinformation.derivationpath',
        rightTitle: `${derivationPath}`,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(derivationPath);
          showStatus('settings.accountinformation.copiedderivationpath', {
            ...getShareIcon(),
            onLinkPress: () => onShare(derivationPath),
          });
        },
      },
      {
        title: 'settings.accountinformation.derivationscheme',
        rightTitle: derivationScheme,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(derivationScheme);
          showStatus('settings.accountinformation.copiedderivationscheme', {
            ...getShareIcon(),
            onLinkPress: () => onShare(derivationScheme),
          });
        },
      },
    ],
  };
};

const getAddressInfoSections = ({ addressType, derivationPath, showStatus }) => {
  const addressDerivationPath = `${derivationPath}/c/i`;
  return {
    items: [
      {
        title: 'settings.accountinformation.addresstype',
        rightTitle: addressType,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(addressType);
          showStatus('settings.accountinformation.copiedaddresstype', {
            ...getShareIcon(),
            onLinkPress: () => onShare(addressType),
          });
        },
      },
      {
        title: 'settings.accountinformation.addressderivation',
        rightTitle: addressDerivationPath,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(addressDerivationPath);
          showStatus('settings.accountinformation.copiedaddressderivation', {
            ...getShareIcon(),
            onLinkPress: () => onShare(addressDerivationPath),
          });
        },
      },
    ],
  };
};

const getBlockheight = (activeWallet) => {
  if (!activeWallet) {
    return 'settings.accountinformation.notsynced';
  }

  const { coinid } = activeWallet;
  return `${coinid.blockHeight}`;
};

const getCryptoTitle = (activeWallet) => {
  const { coinid } = activeWallet;
  return coinid.coinTitle;
};

const getSlipKeysOptions = ({ settings, settingHelper, allowBitcoinSlip132 }) => {
  if (!allowBitcoinSlip132) {
    return [];
  }

  return [
    {
      items: [
        {
          title: 'settings.accountinformation.useslip0132',
          hideChevron: true,
          switchButton: true,
          disabled: false,
          switched: !settings.displayBitcoinXpub,
          onSwitch: () => {
            settingHelper.toggle('displayBitcoinXpub');
          },
        },
      ],
    },
  ];
};

let selectedWallet;
const AccountInformation = ({
  showStatus, params, settingHelper, settings,
}) => {
  if (params && params.wallet) {
    selectedWallet = params.wallet;
  }

  if (!selectedWallet) {
    return [];
  }

  const { coinid, title } = selectedWallet;
  const { allowBitcoinSlip132 } = coinid.network;

  const {
    publicKey, derivationPath, chainKeys, addressType,
  } = coinid.getPublicKeyAndDerivation(
    settings.displayBitcoinXpub,
  );

  const accountSection = getAccountSection({
    publicKey,
    derivationPath,
    addressType,
    showStatus,
  });

  const chainSections = getChainSections({ chainKeys, showStatus });

  const addressInfoSection = getAddressInfoSections({
    title,
    derivationPath,
    addressType,
    showStatus,
  });

  const slipKeysOption = getSlipKeysOptions({ settings, settingHelper, allowBitcoinSlip132 });

  return [
    {
      items: [
        {
          title: 'settings.accountinformation.account',
          rightTitle: `settings.accountinformation.wallet.${title.toLowerCase()}`,
          hideChevron: true,
        },
        {
          title: 'settings.accountinformation.cryptocurrency',
          rightTitle: getCryptoTitle(selectedWallet),
          hideChevron: true,
        },
        {
          title: 'settings.accountinformation.latestblock',
          rightTitle: getBlockheight(selectedWallet),
          hideChevron: true,
        },
      ],
    },
    addressInfoSection,
    accountSection,
    ...chainSections,
    ...slipKeysOption,
    {
      items: [
        {
          title: `settings.accountinformation.reset.${title.toLowerCase()}.title`,
          onPress: () => resetAccount({ title, coinid }),
          hideChevron: true,
          isWarning: true,
        },
      ],
    },
  ];
};

export default AccountInformation;
