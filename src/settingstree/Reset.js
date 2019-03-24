import { Alert } from 'react-native';
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

const Reset = (state) => {
  const { slides } = state;

  const items = slides
    .filter(e => e.coinid.account !== undefined)
    .map(({ title, coinid }) => ({
      title: `Remove ${title.toLowerCase()} wallet account`,
      onPress: () => resetAccount({ title, coinid }),
      hideChevron: true,
      isWarning: true,
    }));

  if (items.length > 0) {
    return [
      {
        items,
        listHint: 'The public key and history will be removed. The app will exit after reset.',
      },
    ];
  }

  return [
    {
      items: {
        title: 'No wallets installed to reset...',
        onPress: () => {},
        hideChevron: true,
      },
      listHint: 'You have not installed any wallets.',
    },
  ];
};

export default Reset;
