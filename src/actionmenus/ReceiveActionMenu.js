import ActionMenuRouter from './ActionMenuRouter';
import { t } from '../contexts/LocaleContext';

class ReceiveActionMenu {
  constructor({ showActionSheetWithOptions, ...params }) {
    this.params = params;
    this.actionRouter = new ActionMenuRouter({ showFn: showActionSheetWithOptions });
  }

  getRootMenu = () => {
    const { onSweepPrivateKey, onValidateAddress, onShare } = this.params;
    return [
      {
        name: t('actionmenus.receive.share'),
        callback: () => setTimeout(onShare, 300),
      },
      {
        name: t('actionmenus.receive.validateaddress'),
        callback: () => setTimeout(onValidateAddress, 100),
      },
      {
        name: t('actionmenus.receive.sweepprivatekey'),
        callback: () => setTimeout(onSweepPrivateKey, 100),
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

export default ReceiveActionMenu;
