/* ActionMenuRouter - routing action menu */

class ActionMenuRouter {
  constructor({ routes, showFn }) {
    this.setRoutes(routes);
    this.setShowFn(showFn);
  }

  setRoutes = (routes) => {
    if (!routes) {
      return false;
    }

    this.routes = routes;
    return true;
  };

  setShowFn = (showFn) => {
    if (!showFn) {
      return false;
    }

    this.showFn = showFn;
    return true;
  };

  goTo = (routeName) => {
    this.openActionRoute(this.routes[routeName]);
  };

  openActionRoute = (route) => {
    const { menu, title } = route;

    const options = menu.map(e => e.name);
    const cancelButtonIndex = menu.map(({ isCancel }) => isCancel).indexOf(true);
    const destructiveButtonIndex = menu.map(({ isDestructive }) => isDestructive).indexOf(true);

    this.showFn(
      {
        message: title,
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (menu[buttonIndex].callback !== undefined) {
          menu[buttonIndex].callback(this);
        }
      },
    );
  };
}

export default ActionMenuRouter;
