import { Alert, Clipboard, Platform } from 'react-native';
import Share from 'react-native-share';
import RNExitApp from 'react-native-exit-app';

const resetAccount = ({ title, coinid }) => {
  Alert.alert(
    `Remove the ${title.toLowerCase()} wallet account?`,
    'The public key and history will be removed. The app will exit when it is finished.',
    [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'OK',
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
    title: 'Share via',
    message: data,
  };

  Share.open(options)
    .then(() => {
      if (Platform.OS === 'ios') {
        this.showStatus('QR code shared successfully');
      }
    })
    .catch(() => {});
};

const getShareIcon = () => ({
  linkIcon: Platform.OS === 'ios' ? 'share-apple' : 'share-google',
  linkText: 'Share',
  linkIconType: 'evilicon',
});

const getChainSections = ({ chainKeys, showStatus }) => chainKeys.map((chain, idx) => ({
  items: [
    {
      title: idx ? 'Change chain' : 'External chain',
      rightTitle: chain.publicKey,
      hideChevron: true,
      onPress: () => {
        Clipboard.setString(chain.publicKey);
        showStatus('Copied public key', {
          ...getShareIcon(),
          onLinkPress: () => onShare(chain.publicKey),
        });
      },
    },
    {
      title: 'Derivation path',
      rightTitle: `${chain.derivationPath}`,
      hideChevron: true,
      onPress: () => {
        Clipboard.setString(chain.derivationPath);
        showStatus('Copied derivation scheme', {
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
        title: 'Public key',
        rightTitle: publicKey,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(publicKey);
          showStatus('Copied public key', {
            ...getShareIcon(),
            onLinkPress: () => onShare(publicKey),
          });
        },
      },
      {
        title: 'Derivation path',
        rightTitle: `${derivationPath}`,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(derivationPath);
          showStatus('Copied derivation path', {
            ...getShareIcon(),
            onLinkPress: () => onShare(derivationPath),
          });
        },
      },
      {
        title: 'Derivation scheme',
        rightTitle: derivationScheme,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(derivationScheme);
          showStatus('Copied derivation scheme', {
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
        title: 'Address type',
        rightTitle: addressType,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(addressType);
          showStatus('Copied address type', {
            ...getShareIcon(),
            onLinkPress: () => onShare(addressType),
          });
        },
      },
      {
        title: 'Address derivation',
        rightTitle: addressDerivationPath,
        hideChevron: true,
        onPress: () => {
          Clipboard.setString(addressDerivationPath);
          showStatus('Copied address derivation', {
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
    return 'Not synced yet';
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
          title: 'Use SLIP-0132 public keys',
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
          title: 'Account',
          rightTitle: `${title} wallet`,
          hideChevron: true,
        },
        {
          title: 'Cryptocurrency',
          rightTitle: getCryptoTitle(selectedWallet),
          hideChevron: true,
        },
        {
          title: 'Latest block',
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
          title: `Remove ${title.toLowerCase()} wallet account`,
          onPress: () => resetAccount({ title, coinid }),
          hideChevron: true,
          isWarning: true,
        },
      ],
    },
  ];
};

export default AccountInformation;
