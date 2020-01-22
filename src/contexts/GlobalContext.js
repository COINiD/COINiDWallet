import React from 'react';
import Settings from '../config/settings';

const GlobalContext = React.createContext({
  hasCOINiD: false,
  isBLESupported: false,
});

export const withGlobalContext = (WrappedComponent) => {
  const Enhance = props => (
    <GlobalContext.Consumer>
      {globalContext => <WrappedComponent {...props} globalContext={globalContext} />}
    </GlobalContext.Consumer>
  );
  return Enhance;
};

export const withGlobalCurrency = (WrappedComponent) => {
  const Enhance = (props) => {
    const { globalContext } = props;
    const { settings } = globalContext;
    const { currency } = settings;
    return <WrappedComponent {...props} currency={currency} />;
  };

  return withGlobalContext(Enhance);
};

export const withGlobalRange = (WrappedComponent) => {
  const Enhance = (props) => {
    const { globalContext } = props;
    const { settings } = globalContext;
    const { range: rangeIndex } = settings;
    const range = Settings.ranges[rangeIndex];
    return <WrappedComponent {...props} range={range} />;
  };

  return withGlobalContext(Enhance);
};

export default GlobalContext;
