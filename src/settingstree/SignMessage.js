const SignMessage = (state) => {
  const { activeWallets, goBack } = state;

  const items = activeWallets.map(({ title, snapTo, openSignMessage }) => ({
    title: `settings.signmessage.items.${title.toLowerCase()}`,
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
        listHint: 'settings.signmessage.listhint',
      },
    ];
  }

  return [
    {
      items: {
        title: 'settings.signmessage.missingwallets.itemtitle',
        onPress: () => {},
        hideChevron: true,
      },
      listHint: 'settings.signmessage.missingwallets.listhint',
    },
  ];
};

export default SignMessage;
