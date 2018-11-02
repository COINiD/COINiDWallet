global.isInactiveOverlayDisabled = false;
global.disableInactiveOverlay = () => global.isInactiveOverlayDisabled = true;
global.enableInactiveOverlay = () => global.isInactiveOverlayDisabled = false;
global._hideSensitive = () => {};
global._showSensitive = () => {};

const onUnlockArr = [];
global._addOnUnlock = (func) => {
  onUnlockArr.push(func);
};

global._onUnlock = () => {
  onUnlockArr.map(func => func());
};
