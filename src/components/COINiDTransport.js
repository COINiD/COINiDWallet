import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Linking, Alert } from 'react-native';
import bleCentral from 'react-native-p2p-transfer-ble-central';
import KeepAwake from 'react-native-keep-awake';

import Settings from '../config/settings';
import { p2pServer } from '../utils/p2p-ble-central';
import { getP2PCode } from '../utils/p2p-ble-common';

import WalletContext from '../contexts/WalletContext';
import { t, withLocaleContext } from '../contexts/LocaleContext';

class COINiDTransport extends PureComponent {
  static contextType = WalletContext;

  static propTypes = {
    getData: PropTypes.func,
    handleReturnData: PropTypes.func,
    children: PropTypes.func,
    onSent: PropTypes.func,
    onBLEInit: PropTypes.func,
    onBLEFail: PropTypes.func,
    parentDialog: PropTypes.string.isRequired,
  };

  static defaultProps = {
    getData: () => Promise.resolve(''),
    handleReturnData: () => '',
    children: () => {},
    onSent: () => {},
    onBLEInit: () => {},
    onBLEFail: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      isSigning: false,
      signingText: '',
      isBLESupported: false,
    };
  }

  componentDidMount() {
    const { type } = this.context;

    if (type === 'cold') {
      bleCentral.isSupported().then((isBLESupported) => {
        this.setState({
          isBLESupported,
        });
      });
    }
  }

  componentWillUnmount() {
    this._cancel();
  }

  _checkForCOINiD = () => {
    const { type } = this.context;

    if (type === 'cold') {
      return Promise.resolve(true); // always resolve cold to true;
    }

    return Linking.canOpenURL('coinid://');
  };

  _addUrlListener = () => {
    global.disableInactiveOverlay();
    Linking.addEventListener('url', this._handleURLEvent);
  };

  _removeUrlListener = () => {
    global.enableInactiveOverlay();
    Linking.removeEventListener('url', this._handleURLEvent);
  };

  _handleURLEvent = (event) => {
    this._removeUrlListener(); // remove listener once we get first event.
    this._handleOpenURL(event.url);
  };

  _handleOpenURL = (url) => {
    if (url) {
      const data = url.split('://')[1];
      const { handleReturnData } = this.props;

      handleReturnData(data);
      this._cancel();
    }
  };

  _getCOINiDUrl = (dataToTransport) => {
    const { type } = this.context;
    const { appReturnScheme } = Settings;

    const getPrefix = () => {
      if (type === 'cold') {
        return `coinid://${appReturnScheme}:p2p`.toUpperCase();
      }

      return `coinid://${appReturnScheme}`;
    };

    return `${getPrefix()}/${dataToTransport}`;
  };

  _transportData = (dataToTransport, skipReturnData, skipPreferred) => {
    const { type } = this.context;

    if (type === 'cold') {
      return this._transportDataCold(dataToTransport, skipReturnData, skipPreferred);
    }

    return this._transportDataHot(dataToTransport, skipReturnData);
  };

  _transportDataHot = (dataToTransport, skipReturnData) => {
    const { onSent, parentDialog } = this.props;
    const url = this._getCOINiDUrl(dataToTransport);
    const { dialogNavigateToExistingOrClose } = this.context;

    dialogNavigateToExistingOrClose(parentDialog);

    if (!skipReturnData) {
      this._addUrlListener();

      this.setState({
        isSigning: true,
        signingText: t('coinidtransport.qr.waiting'),
      });
    }

    onSent();

    if (skipReturnData) {
      this._handleOpenURL('coinid://');
    }

    setTimeout(
      () => {
        Linking.openURL(url);
      },
      skipReturnData ? 750 : 0,
    );
  };

  _transportDataCold = (dataToTransport, skipReturnData, skipPreferred) => {
    const url = this._getCOINiDUrl(dataToTransport);
    const {
      globalContext: {
        settingHelper,
        settings: { preferredColdTransport },
      },
      dialogNavigate,
    } = this.context;

    const doTransportDataCold = (transportType, successCb) => {
      if (transportType === 'ble') {
        this._transportDataBLE(url, skipReturnData, successCb);
      }

      if (transportType === 'qr') {
        this._transportDataQR(url, skipReturnData, successCb);
      }
    };

    const onTransportData = (data, transportType) => {
      this._handleOpenURL(data);

      if (skipPreferred) {
        settingHelper.update('preferredColdTransport', transportType);
      }
    };

    if (!skipPreferred && preferredColdTransport) {
      doTransportDataCold(preferredColdTransport, (data) => {
        onTransportData(data, preferredColdTransport);
      });
    } else {
      dialogNavigate(
        'SelectColdTransportType',
        {
          onSelected: (transportType) => {
            doTransportDataCold(transportType, (data) => {
              onTransportData(data, transportType);
            });
          },
        },
        this.context,
        false,
      );
    }
  };

  _transportDataQR = (url, skipReturnData, successCb) => {
    const { onSent, parentDialog } = this.props;
    const { navigation, dialogNavigate, dialogNavigateToExistingOrClose } = this.context;

    this.setState({
      isSigning: true,
      signingText: t('coinidtransport.qr.sending'),
    });

    dialogNavigate(
      'QRDataSender',
      {
        data: url,
        onClose: () => {
          this._cancel();
        },
        onDone: () => {
          onSent();
          dialogNavigateToExistingOrClose(parentDialog);

          if (skipReturnData) {
            successCb('coinid://');
          }

          if (!skipReturnData) {
            this.setState({
              isSigning: true,
              signingText: t('coinidtransport.qr.receiving'),
            });

            navigation.navigate('QRDataReceiver', {
              onComplete: (data) => {
                successCb(data);
              },
              onPrematureExit: () => {
                this._cancel();
              },
            });
          }
        },
      },
      this.context,
      false,
    );
  };

  _transportDataBLE = (url, skipReturnData, successCb) => {
    const { dialogNavigateToExistingOrClose } = this.context;
    const {
      onSent, onBLEInit, onBLEFail, parentDialog,
    } = this.props;
    const code = getP2PCode();
    onBLEInit();

    dialogNavigateToExistingOrClose(parentDialog);

    this.setState({
      isSigning: true,
      signingText: t('coinidtransport.ble.connect', { code }),
      signingCode: code,
    });

    const cbConnected = () => {
      this.setState({
        signingText: t('coinidtransport.ble.connected'),
        isSigning: true,
        signingCode: '',
      });
    };

    const cbSendProgress = (data) => {
      const progress = 100 * (parseFloat(data.receivedBytes) / parseFloat(data.finalBytes));

      this.setState({
        signingText: t('coinidtransport.ble.sending', { progress: progress.toFixed(0) }),
        isSigning: true,
      });
    };

    const cbSendDone = () => {
      this.setState({
        signingText: t('coinidtransport.ble.waiting'),
        isSigning: true,
      });

      onSent();
    };

    const cbReceiveProgress = (data) => {
      const progress = 100 * (parseFloat(data.receivedBytes) / parseFloat(data.finalBytes));
      this.setState({
        signingText: t('coinidtransport.ble.receiving', { progress: progress.toFixed(0) }),
        isSigning: true,
      });
    };

    const cbReceiveDone = () => {
      this.setState({
        signingText: t('coinidtransport.ble.finished'),
        isSigning: true,
      });
    };

    this.p2p = p2pServer(code, {
      cbConnected,
      cbReceiveProgress,
      cbReceiveDone,
      cbSendProgress,
      cbSendDone,
    });
    this.p2p
      .connectAndSend(url)
      .then((data) => {
        successCb(data);
      })
      .catch((error) => {
        Alert.alert(error);
        this._cancel();
        onBLEFail();
      });
  };

  _stopWaiting = () => {
    const { type } = this.context;

    this.setState({
      isSigning: false,
      signingText: '',
    });

    if (type === 'hot') {
      this._removeUrlListener();
    } else if (this.p2p !== undefined) {
      this.p2p.stop();
    }
  };

  _cancel = () => {
    this._stopWaiting();
  };

  _submit = (submitArg, skipReturnData, skipPreferred) => {
    const { dialogNavigate } = this.context;

    this._checkForCOINiD().then((hasCOINiD) => {
      if (!hasCOINiD) {
        dialogNavigate('COINiDNotFound');
      } else {
        const { getData } = this.props;
        getData(submitArg).then((data) => {
          this._transportData(data, skipReturnData, skipPreferred);
        });
      }
    });
  };

  render() {
    const {
      isSigning, signingText, isBLESupported, signingCode,
    } = this.state;
    const { type } = this.context;

    const { children } = this.props;

    return (
      <React.Fragment>
        {isSigning ? <KeepAwake /> : null}
        {children({
          isSigning,
          signingText,
          signingCode,
          submit: this._submit,
          cancel: this._cancel,
          isBLESupported,
          type,
        })}
      </React.Fragment>
    );
  }
}

export default withLocaleContext(COINiDTransport);
