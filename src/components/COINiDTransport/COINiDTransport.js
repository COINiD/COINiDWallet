import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Linking, Alert } from 'react-native';
import bleCentral from 'react-native-p2p-transfer-ble-central';
import KeepAwake from 'react-native-keep-awake';

import Settings from '../../config/settings';
import { p2pServer } from '../../utils/p2p-ble-central';
import { getP2PCode } from '../../utils/p2p-ble-common';

export default class COINiDTransport extends PureComponent {
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

  _openNotFoundModal = () => {
    const {
      modals: { notFoundModal },
    } = this.context;
    notFoundModal._open();
  };

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
    const { onSent } = this.props;
    const url = this._getCOINiDUrl(dataToTransport);

    if (!skipReturnData) {
      this._addUrlListener();

      this.setState({
        isSigning: true,
        signingText: 'Waiting for COINiD Vault',
      });
    }

    Linking.openURL(url).catch(err => console.error('An error occured', err));
    onSent();
  };

  _transportDataCold = (dataToTransport, skipReturnData, skipPreferred) => {
    const url = this._getCOINiDUrl(dataToTransport);
    const {
      settingHelper,
      settingHelper: {
        settings: { preferredColdTransport },
      },
      modals: { coldTransportModal },
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
      coldTransportModal._open((transportType) => {
        doTransportDataCold(transportType, (data) => {
          onTransportData(data, transportType);
        });
      });
    }
  };

  _transportDataQR = (url, skipReturnData, successCb) => {
    const { onSent } = this.props;
    const {
      modals: { qrDataSenderModal },
      navigation,
    } = this.context;

    qrDataSenderModal._open(url, () => {
      onSent();
      if (!skipReturnData) {
        navigation.navigate('QRDataReceiver', {
          onComplete: (data) => {
            successCb(data);
          },
        });
      }
    });
  };

  _transportDataBLE = (url, skipReturnData, successCb) => {
    const { onSent, onBLEInit, onBLEFail } = this.props;
    const code = getP2PCode();
    onBLEInit();

    this.setState({
      isSigning: true,
      signingText: `Connect with ${code}`,
      signingCode: code,
    });

    const cbConnected = () => {
      this.setState({
        signingText: 'Connected',
        isSigning: true,
        signingCode: '',
      });
    };

    const cbSendProgress = (data) => {
      const progress = 100 * (parseFloat(data.receivedBytes) / parseFloat(data.finalBytes));

      this.setState({
        signingText: `Sending Data ${progress.toFixed(0)}%`,
        isSigning: true,
      });
    };

    const cbSendDone = () => {
      this.setState({
        signingText: 'Waiting for return data',
        isSigning: true,
      });

      onSent();
    };

    const cbReceiveProgress = (data) => {
      const progress = 100 * (parseFloat(data.receivedBytes) / parseFloat(data.finalBytes));
      this.setState({
        signingText: `Receiving Data ${progress.toFixed(0)}%`,
        isSigning: true,
      });
    };

    const cbReceiveDone = () => {
      this.setState({
        signingText: 'Finished',
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
    this._checkForCOINiD().then((hasCOINiD) => {
      if (!hasCOINiD) {
        this._openNotFoundModal();
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

COINiDTransport.contextTypes = {
  type: PropTypes.string,
  modals: PropTypes.object,
  navigation: PropTypes.object,
  settingHelper: PropTypes.object,
};

COINiDTransport.propTypes = {
  getData: PropTypes.func,
  handleReturnData: PropTypes.func,
  children: PropTypes.func,
  onSent: PropTypes.func,
  onBLEInit: PropTypes.func,
  onBLEFail: PropTypes.func,
};

COINiDTransport.defaultProps = {
  getData: () => Promise.resolve(''),
  handleReturnData: () => '',
  children: () => {},
  onSent: () => {},
  onBLEInit: () => {},
  onBLEFail: () => {},
};
