const AccountList = ({ activeWallets, gotoRoute }) => {
  const items = activeWallets.map(wallet => ({
    title: `${wallet.title} wallet account`,
    onPress: () => gotoRoute('AccountInformation', { wallet }),
    hideChevron: true,
    isWarning: false,
  }));

  if (items.length > 0) {
    return [
      {
        items,
      },
    ];
  }

  return [
    {
      items: {
        title: 'No wallets installed...',
        onPress: () => {},
        hideChevron: true,
      },
      listHint: 'You have not installed any wallets.',
    },
  ];
};

export default AccountList;
