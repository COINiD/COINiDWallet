/**
 * Utilities for p2p communication
 */

import { encrypt, decrypt, randomLimited } from './encrypt';
import { p2pCommonSecret } from '../config/secrets';

export const getP2PCode = () => {
  return randomLimited(6, '0123456789');
}

export const encryptData = (data, p2pCode) => {
  return encrypt(data, p2pCode+p2pCommonSecret, 'base64', true, false);
}

export const decryptData = (encryptedData, p2pCode) => {
  try {
    let decryptedData = decrypt(encryptedData, p2pCode+p2pCommonSecret, 'base64', true, false)
    return decryptedData;
  }
  catch(error) {
    console.log(error);
    return null;
  }
}

export const getServiceUUID = function (p2pCode, base) {
  const encryptedString = encrypt(base, p2pCode+p2pCommonSecret, 'hex', false, false);

  const serviceUUID = [
    encryptedString.substr(0, 8),
    encryptedString.substr(8, 4),
    encryptedString.substr(12, 4),
    encryptedString.substr(16, 4),
    encryptedString.substr(20, 12),
  ].join('-').toUpperCase();

  console.log(serviceUUID, encryptedString);

  return serviceUUID;
}
