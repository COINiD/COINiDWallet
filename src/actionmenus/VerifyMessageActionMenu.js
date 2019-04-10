import ActionMenuRouter from './ActionMenuRouter';

class VerifyMessageActionMenu {
  constructor({ showActionSheetWithOptions, ...params }) {
    this.params = params;
    this.actionRouter = new ActionMenuRouter({ showFn: showActionSheetWithOptions });
  }

  getRootMenu = () => {
    const { onParseClipboard } = this.params;
    return [
      {
        name: 'Parse clipboard data',
        callback: () => setTimeout(onParseClipboard, 100),
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

export default VerifyMessageActionMenu;
