import ActionMenuRouter from './ActionMenuRouter';

class ReceiveActionMenu {
  constructor({ showActionSheetWithOptions, ...params }) {
    this.params = params;
    this.actionRouter = new ActionMenuRouter({ showFn: showActionSheetWithOptions });
  }

  getRootMenu = () => {
    const { onSweepPrivateKey, onValidateAddress, onShare } = this.params;
    return [
      {
        name: 'Share...',
        callback: () => setTimeout(onShare, 300),
      },
      {
        name: 'Validate Address...',
        callback: () => setTimeout(onValidateAddress, 100),
      },
      {
        name: 'Sweep Private Key...',
        callback: () => setTimeout(onSweepPrivateKey, 100),
      },
      {
        name: 'Cancel',
        isCancel: true,
      },
    ];
  };

  getActionRoutes = () => {
    const actionRoutes = {
      root: {
        menu: this.getRootMenu(),
      },
    };

    return actionRoutes;
  };

  show = () => {
    this.actionRouter.setRoutes(this.getActionRoutes());
    this.actionRouter.goTo('root');
  };
}

export default ReceiveActionMenu;
