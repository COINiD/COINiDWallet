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
        callback: () => onShare(),
      },
      {
        name: 'Validate Address...',
        callback: () => onValidateAddress(),
      },
      /* {
        name: 'Sweep Private Key...',
        callback: () => onSweepPrivateKey(),
      }, */
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
