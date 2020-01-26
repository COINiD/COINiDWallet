import React from 'react';
import PropTypes from 'prop-types';
import Text from './Text';
import { useLocaleContext } from '../contexts/LocaleContext';

function TranslatedText({ children, options, ...props }) {
  const { t } = useLocaleContext();
  console.log('TranslatedText', { children, options, props });
  return <Text {...props}>{t(children, options)}</Text>;
}

TranslatedText.propTypes = {
  children: PropTypes.string.isRequired,
  options: PropTypes.shape({}),
};

TranslatedText.defaultProps = {
  options: null,
};

const areEqual = (prevProps, nextProps) => prevProps.children === nextProps.children
  && prevProps.style === nextProps.style
  && JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options);

export default React.memo(TranslatedText, areEqual);
