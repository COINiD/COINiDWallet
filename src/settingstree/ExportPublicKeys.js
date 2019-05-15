import { Clipboard, Platform } from 'react-native';
import Share from 'react-native-share';

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
/*
ypub6YLbo78uVXWfBychBD7WpxyKgCBkyBFWW2e7Jg8WAXazaZ88PMQ175hBrWAAeLD4eVJuqC3a8zLDHqgTMRiUUP15NCYYdqLZFV5Ktkp2i1f
ypub6Zg8KLiu5sx72A3eYUgkAMfik6GE8aA1c5pfkbA9aqvajruyHVoLagCFZ25CGNkhwGThxBhadbvReqP6V1sMgB4qUmeeUBPNBQ8owgwH4MW
ypub6Zg8KLiu5sx73P6rhZnftZK9o83SddCmDAoHPwMbdt8TYJdgCWYYU7ZohDrJzG1tJqCFmE5evbRofAk18qMcnfz2FEuVfpDWFGfrKjuft34
*/

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
        title: 'Account public key',
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
    listHint:
      'The account extended public key have been derived following the path and scheme shown above.',
  };
};

const ExportPublicKeys = ({ activeWallets, showStatus }) => {
  const { coinid } = activeWallets[0];
  const {
    publicKey, derivationPath, chainKeys, addressType,
  } = coinid.getPublicKeyAndDerivation();

  const accountSection = getAccountSection({
    publicKey,
    derivationPath,
    addressType,
    showStatus,
  });

  const chainSections = getChainSections({ chainKeys, showStatus });

  return [accountSection, ...chainSections];
};

export default ExportPublicKeys;
