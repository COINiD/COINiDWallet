const AccountList = ({ activeWallets, gotoRoute }) => {
  const items = activeWallets.map(wallet => ({
    title: `settings.accountlist.items.${wallet.title.toLowerCase()}`,
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
        title: 'settings.signmessage.missingwallets.itemtitle',
        onPress: () => {},
        hideChevron: true,
      },
      listHint: 'settings.accountlist.missingwallets.listhint',
    },
  ];
};

export default AccountList;
