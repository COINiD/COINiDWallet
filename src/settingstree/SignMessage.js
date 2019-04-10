const SignMessage = (state) => {
  const { activeWallets, goBack } = state;

  const items = activeWallets.map(({ title, snapTo, openSignMessage }) => ({
    title: `Sign message with ${title.toLowerCase()} wallet account`,
    onPress: () => {
      goBack();
      snapTo();
      openSignMessage();
    },
    hideChevron: true,
  }));

  if (items.length > 0) {
    return [
      {
        items,
        listHint: 'Select which account you want to use to sign a message.',
      },
    ];
  }

  return [
    {
      items: {
        title: 'No wallets installed to sign with...',
        onPress: () => {},
        hideChevron: true,
      },
      listHint: 'You have not installed any wallets.',
    },
  ];
};

export default SignMessage;
