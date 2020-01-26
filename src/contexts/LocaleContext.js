import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import * as RNLocalize from 'react-native-localize';
import numbro from 'numbro';
import moment from 'moment/min/moment-with-locales';
import { numFormat } from '../utils/numFormat';
import { useGlobalLanguage } from './GlobalContext';

const LocaleContext = React.createContext({});

const translations = {
  en: require('../translations/en.json'),
  sv: require('../translations/sv.json'),
};

const t = (string, languageTag) => {
  const translation = translations[languageTag][string];

  if (!translation) {
    return string;
  }

  return translation;
};

const getBestAvailableLanguage = (selectedLanguage) => {
  if (!translations[selectedLanguage]) {
    return (
      RNLocalize.findBestAvailableLanguage(Object.keys(translations)) || {
        languageTag: 'en',
        isRTL: false,
      }
    );
  }

  return { languageTag: selectedLanguage, isRTL: false };
};

const getNewLocaleState = (selectedLanguage) => {
  const { languageTag } = getBestAvailableLanguage(selectedLanguage);
  const locale = RNLocalize.getNumberFormatSettings();

  numbro.registerLanguage({
    ...numbro.languageData(),
    delimiters: {
      thousands: locale.groupingSeparator,
      decimal: locale.decimalSeparator,
    },
  });

  moment.locale(languageTag);

  return {
    languageTag,
    t: string => t(string, languageTag),
    numFormat,
    moment,
  };
};

function LocaleProvider({ children }) {
  const language = useGlobalLanguage();
  const [state, setState] = useState(null);

  useEffect(() => {
    const onLocaleChange = () => {
      if (language === 'system') {
        setState(getNewLocaleState(language));
      }
    };

    RNLocalize.addEventListener('change', onLocaleChange);
    return () => {
      RNLocalize.removeEventListener('change', onLocaleChange);
    };
  }, [RNLocalize]);

  useEffect(() => {
    setState(getNewLocaleState(language));
  }, [language]);

  if (!state) {
    return null;
  }

  return <LocaleContext.Provider value={state}>{children}</LocaleContext.Provider>;
}

LocaleProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export const useLocaleContext = () => useContext(LocaleContext);

export const withLocaleContext = WrappedComponent => React.memo(
  React.forwardRef((props, ref) => {
    const localeContext = useLocaleContext();
    return <WrappedComponent {...props} ref={ref} {...localeContext} />;
  }),
);

export default {
  ...LocaleContext,
  Provider: React.memo(LocaleProvider),
};
