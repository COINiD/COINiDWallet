import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Linking } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import bleCentral from 'react-native-p2p-transfer-ble-central';

import SettingHelper from '../utils/settingHelper';
import projectSettings from '../config/settings';

const GlobalContext = React.createContext({
  hasCOINiD: false,
  isBLESupported: false,
});

function GlobalContextProvider({ children }) {
  const { showActionSheetWithOptions } = useActionSheet();
  const settingHelper = SettingHelper(projectSettings.coin);

  const [state, setState] = useState(null);

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const onSettingsUpdated = (newSettings) => {
      setSettings(newSettings);
    };

    settingHelper.addListener('updated', onSettingsUpdated);
    return () => {
      settingHelper.removeListener('updated', onSettingsUpdated);
    };
  }, [settingHelper]);

  useEffect(() => {
    const doChecks = async () => {
      const hasCOINiD = await Linking.canOpenURL('coinid://');
      const isBLESupported = await bleCentral.isSupported();

      setState({
        hasCOINiD,
        isBLESupported,
      });
    };

    doChecks();
  }, [Linking, bleCentral]);

  if (!settings || !state) {
    return null;
  }

  return (
    <GlobalContext.Provider
      value={{
        ...state,
        settings,
        settingHelper,
        showActionSheetWithOptions,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

GlobalContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useGlobalSettings = () => useGlobalContext().settings;
export const useGlobalLanguage = () => useGlobalSettings().language;

export const withGlobalContext = WrappedComponent => React.memo((props) => {
  const globalContext = useGlobalContext();
  return <WrappedComponent {...props} globalContext={globalContext} />;
});

export const withGlobalCurrency = WrappedComponent => React.memo((props) => {
  const { currency } = useGlobalSettings();
  return <WrappedComponent {...props} currency={currency} />;
});

export const withGlobalRange = WrappedComponent => React.memo((props) => {
  const { range: rangeIndex } = useGlobalSettings();
  const range = projectSettings.ranges[rangeIndex];
  return <WrappedComponent {...props} range={range} />;
});

export const withGlobalLanguage = WrappedComponent => React.memo((props) => {
  const { language } = useGlobalSettings();
  return <WrappedComponent {...props} language={language} />;
});

export const withGlobalSettings = WrappedComponent => React.memo((props) => {
  const settings = useGlobalSettings();
  return <WrappedComponent {...props} settings={settings} />;
});

export default {
  ...GlobalContext,
  Provider: React.memo(GlobalContextProvider),
};
