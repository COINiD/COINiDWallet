/**
 * Helper for storage
 */

import { AsyncStorage } from 'react-native';

const getStorageItem = (namespace, key) => AsyncStorage.getItem(`@${namespace}:${key}`).then(JSON.parse);

const setStorageItem = (namespace, key, value) => {
  const val = JSON.stringify(value);
  return AsyncStorage.setItem(`@${namespace}:${key}`, val);
};

const removeStorageItem = (namespace, key) => AsyncStorage.removeItem(`@${namespace}:${key}`);

const reset = namespace => AsyncStorage.getAllKeys().then((keys) => {
  const filteredKeys = keys.filter(key => key.startsWith(`@${namespace}`));
  return AsyncStorage.multiRemove(filteredKeys);
});

export default namespace => ({
  get: key => getStorageItem(namespace, key),
  set: (key, value) => setStorageItem(namespace, key, value),
  remove: key => removeStorageItem(namespace, key),
  reset: () => reset(namespace),
});
