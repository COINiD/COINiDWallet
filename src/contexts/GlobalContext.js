import React from 'react';

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
  const Enhance = props => (
    <GlobalContext.Consumer>
      {({ settings }) => <WrappedComponent {...props} currency={settings.currency} />}
    </GlobalContext.Consumer>
  );
  return Enhance;
};

export default GlobalContext;
