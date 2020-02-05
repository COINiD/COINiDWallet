import ActionMenuRouter from './ActionMenuRouter';
import { t } from '../contexts/LocaleContext';

class VerifyMessageActionMenu {
  constructor({ showActionSheetWithOptions, ...params }) {
    this.params = params;
    this.actionRouter = new ActionMenuRouter({ showFn: showActionSheetWithOptions });
  }

  getRootMenu = () => {
    const { onParseClipboard } = this.params;
    return [
      {
        name: t('actionmenus.verifymessage.parseclipboard'),
        callback: () => setTimeout(onParseClipboard, 100),
      },
      {
        name: t('generic.cancel'),
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
