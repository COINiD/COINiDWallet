import MockAsyncStorage from 'mock-async-storage';

import { WebSocket } from 'mock-socket';

const rn = require('react-native');

global.fetch = require('jest-fetch-mock');

global.fetch.mockResponse(JSON.stringify({ data: '12345' }));

global.WebSocket = WebSocket;

jest.useFakeTimers();

jest.mock('Alert', () => ({ alert: jest.fn() }));

jest.mock('AsyncStorage', () => new MockAsyncStorage());

jest.mock('NativeAnimatedHelper');

jest.mock('NativeModules', () => ({
  P2PTransferBLECentralModule: {
    addListener: jest.fn(),
  },
  P2PTransferBLEPeripheralModule: {},
  KeyboardObserver: {
    addListener: jest.fn(),
  },
  StatusBarManager: {
    HEIGHT: 42,
    setColor: jest.fn(),
    setStyle: jest.fn(),
    setHidden: jest.fn(),
    setNetworkActivityIndicatorVisible: jest.fn(),
    setBackgroundColor: jest.fn(),
    setTranslucent: jest.fn(),
  },
}));

module.exports = rn;
