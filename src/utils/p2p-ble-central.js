/**
 * Utilities for p2p communication
 */
import bleCentral from 'react-native-p2p-transfer-ble-central';
import { getServiceUUID, encryptData, decryptData } from './p2p-ble-common';

const sendData = function (data, p2pCode) {
  return new Promise((resolve, reject) => {
    const serviceUUID = getServiceUUID(p2pCode, 'central-sending-peripheral-receiving');

    const encryptedData = encryptData(data, p2pCode);

    bleCentral
      .sendData(encryptedData, { serviceUUID })
      .then(() => {
      // sendData should be improved in the module so that it is not returned until data is confirmed to have arrived...
      // setTimeout is a temporary solution...
        setTimeout(() => resolve(), 1000);
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

const getData = function (p2pCode) {
  return new Promise((resolve, reject) => {
    const serviceUUID = getServiceUUID(p2pCode, 'central-receiving-peripheral-sending');

    bleCentral
      .receiveData({ serviceUUID })
      .then((returnData) => {
        const encryptedData = returnData.value;
        const data = decryptData(encryptedData, p2pCode);

        if (!data) {
          return reject('Error decoding data');
        }

        return resolve(data);
      })
      .catch((error) => {
        return reject(error);
      });
  });
};

export const p2pServer = (p2pCode, {cbConnected, cbSendProgress, cbSendDone, cbReceiveProgress, cbReceiveDone}) => {
  if (cbConnected !== undefined) bleCentral.addListener('connected', cbConnected);
  if (cbSendProgress !== undefined) bleCentral.addListener('sendingProgress', cbSendProgress);
  if (cbSendDone !== undefined) bleCentral.addListener('sendingDone', cbSendDone);
  if (cbReceiveProgress !== undefined) bleCentral.addListener('receivingProgress', cbReceiveProgress);
  if (cbReceiveDone !== undefined) bleCentral.addListener('receivingDone', cbReceiveDone);

  const p2p = {
    getData: () => getData.bind(p2p)(p2pCode),
    sendData: data => sendData.bind(p2p)(data, p2pCode),
    connectAndSend: (sendData) => new Promise((resolve, reject) => {
      p2p.sendData(sendData).then(() => {
        p2p.getData().then((data) => {
          p2p.stop();
          resolve(data);
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    }),
    stop: () => {
      bleCentral.stop();
      bleCentral.removeAllListeners('connected');
      bleCentral.removeAllListeners('sendingProgress');
      bleCentral.removeAllListeners('sendingDone');
      bleCentral.removeAllListeners('receivingProgress');
      bleCentral.removeAllListeners('receivingDone');
    },
  };

  return p2p;
};
