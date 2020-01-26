import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import { useLocaleContext } from '../contexts/LocaleContext';

function TranslatedText({ children, ...props }) {
  const { t } = useLocaleContext();
  console.log(children);
  return <Text {...props}>{t(children)}</Text>;
}

TranslatedText.propTypes = {
  children: PropTypes.string.isRequired,
};

export default React.memo(TranslatedText);
