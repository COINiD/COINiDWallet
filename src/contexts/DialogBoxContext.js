import React, { PureComponent } from 'react';
import { Keyboard } from 'react-native';
import PropTypes from 'prop-types';

import DetailsModal from '../components/DetailsModal';
import { dialogRoutes } from '../routes/dialogs';

import WalletContext from './WalletContext';
import { ExchangeRateContextProvider } from './ExchangeRateContext';

const DialogContext = React.createContext({});

class DialogBox extends PureComponent {
  static childContextTypes = {
    theme: PropTypes.string,
  };

  constructor() {
    super();

    this.state = {
      dialogWidth: 0,
      dialogHeight: 0,
      dialogInnerWidth: 0,
      dialogInnerHeight: 0,
      currentDialog: 0,
    };

    this.moreOptionCallbacks = {};
    this.keyboardActive = false;

    this.dialogs = [];
  }

  getChildContext() {
    return {
      theme: 'light',
    };
  }

  componentDidMount() {
    this.subscriptions = [];

    this.subscriptions.push(
      Keyboard.addListener('keyboardDidShow', this._keyboardDidShow),
      Keyboard.addListener('keyboardDidHide', this._keyboardDidHide),
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(sub => sub.remove());
  }

  _keyboardDidShow = () => {
    this.keyboardActive = true;
  };

  _keyboardDidHide = () => {
    this.keyboardActive = false;
  };

  _updateSetContextBridger = (context) => {
    const { setContextBridger } = context;
    const { currentSetContextBridger } = this;

    if (currentSetContextBridger !== setContextBridger) {
      if (currentSetContextBridger) {
        currentSetContextBridger(undefined); // clear old
        this.currentSetContextBridger = undefined;
      }
      if (setContextBridger) {
        setContextBridger(this._contextBridger);
        this.currentSetContextBridger = setContextBridger;
      }
    }
  };

  _navigateToExistingOrClose = (route) => {
    if (!this._navigateToExisting(route)) {
      this._closeAndClear(true);
    }
  };

  _navigateToExisting = (route) => {
    const [foundDialog] = this.dialogs.filter(e => e.route === route);
    const existIndex = this.dialogs.indexOf(foundDialog);

    if (existIndex !== -1) {
      const times = this.dialogs.length - 1 - existIndex;
      if (times > 0) {
        this._removeDialogs(times);
        this._changeDialog();
      }
      return true;
    }
    return false;
  };

  _navigate = (route, customProps = {}, newContext = false, replace = true, removeDialogs = 0) => {
    const { DialogComponent, defaultProps } = dialogRoutes[route];

    if (newContext && newContext !== this.context) {
      this.context = newContext;
      this._updateSetContextBridger(this.context);
      this._contextBridger(this.context);
    }

    const props = { ...defaultProps, ...customProps, dialogRef: this.modal };

    const dialog = {
      DialogComponent,
      props,
      route,
      key: route,
    };

    this._removeDialogs(removeDialogs);

    if (replace) {
      this.dialogs = [dialog];
    } else {
      if (this._navigateToExisting(route)) {
        return;
      }

      this.dialogs.push(dialog);
    }

    this._changeDialog();
  };

  _removeDialogs = (number) => {
    for (let i = 0; i < number; i += 1) {
      this.dialogs.pop();
    }
  };

  _goBack = (times = 1) => {
    this._removeDialogs(times);
    this._changeDialog();
  };

  _closeAndClear = (skipReturnOnKeyboard) => {
    if (this.keyboardActive) {
      Keyboard.dismiss();

      if (!skipReturnOnKeyboard) {
        return false;
      }
    }

    this.dialogs = [];
    this._changeDialog();

    return true;
  };

  _changeDialog = () => {
    this.modal._close(() => {
      const { dialogs } = this;
      const currentDialog = dialogs.length - 1;

      if (currentDialog >= 0) {
        const { props } = dialogs[currentDialog];

        this.setState({ currentDialog, props }, () => {
          this.modal._open();
        });
      } else {
        this.setState({ currentDialog, props: {} });
      }
    });
  };

  _getCurrent = () => {
    const { dialogs } = this;
    const currentDialog = dialogs.length - 1;

    if (currentDialog >= 0) {
      return dialogs[currentDialog];
    }

    return false;
  };

  _contextBridger = (updatedContext) => {
    this.setState({
      context: updatedContext,
    });
  };

  _onLayout = ({ nativeEvent }) => {
    const { layout } = nativeEvent;
    const { width: dialogInnerWidth, height: dialogInnerHeight } = layout;

    this.setState({
      dialogInnerWidth,
      dialogInnerHeight,
    });
  };

  _onOuterLayout = ({ nativeEvent }) => {
    const { layout } = nativeEvent;
    const { width: dialogWidth, height: dialogHeight } = layout;

    this.setState({
      dialogWidth,
      dialogHeight,
    });
  };

  _renderDialogComponent = ({ DialogComponent, props, key }) => {
    const {
      dialogWidth, dialogHeight, dialogInnerWidth, dialogInnerHeight,
    } = this.state;

    return (
      <DialogComponent
        key={key}
        {...props}
        dialogInnerWidth={dialogInnerWidth}
        dialogInnerHeight={dialogInnerHeight}
        dialogWidth={dialogWidth}
        dialogHeight={dialogHeight}
        setMoreOptionsFunc={(moreOptions) => {
          this.moreOptionCallbacks[key] = moreOptions;
        }}
      />
    );
  };

  _renderModal = () => {
    const { dialogs } = this;
    const { currentDialog, props } = this.state;

    return (
      <DetailsModal
        {...props}
        ref={(c) => {
          this.modal = c;
        }}
        onLayout={this._onLayout}
        onOuterLayout={this._onOuterLayout}
        closeAndClear={() => {
          this._closeAndClear();
        }}
        currentDialog={currentDialog}
        removeWhenClosed={false}
        onMoreOptions={() => {
          const { key } = this._getCurrent();
          if (this.moreOptionCallbacks[key]) {
            this.moreOptionCallbacks[key]();
          }
        }}
      >
        {dialogs.map(this._renderDialogComponent)}
      </DetailsModal>
    );
  };

  render() {
    const { context } = this.state;

    return (
      <WalletContext.Provider value={context}>
        <ExchangeRateContextProvider>{this._renderModal()}</ExchangeRateContextProvider>
      </WalletContext.Provider>
    );
  }
}

class DialogBoxProvider extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  };

  static defaultProps = {
    children: null,
  };

  constructor() {
    super();

    this.state = {
      value: {},
    };
  }

  _setRef = (c) => {
    this._dialogBoxRef = c;

    this.setState({
      value: {
        dialogNavigate: this._dialogBoxRef._navigate,
        dialogGoBack: this._dialogBoxRef._goBack,
        dialogGetCurrentDialog: this._dialogBoxRef._getCurrent,
        dialogNavigateToExisting: this._dialogBoxRef._navigateToExisting,
        dialogNavigateToExistingOrClose: this._dialogBoxRef._navigateToExistingOrClose,
        dialogCloseAndClear: this._dialogBoxRef._closeAndClear,
      },
    });
  };

  render() {
    const { value } = this.state;
    const { children } = this.props;

    return (
      <DialogContext.Provider value={value}>
        {children}
        <DialogBox ref={this._setRef} />
      </DialogContext.Provider>
    );
  }
}

export default {
  ...DialogContext,
  Provider: DialogBoxProvider,
};
