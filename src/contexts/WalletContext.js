import React from 'react';

const WalletContext = React.createContext({});

export const withTicker = (WrappedComponent) => {
  const Enhance = props => (
    <WalletContext.Consumer>
      {(walletContext = {}) => {
        const { coinid: { ticker = '' } = {} } = walletContext;
        return <WrappedComponent {...props} ticker={ticker} />;
      }}
    </WalletContext.Consumer>
  );
  return Enhance;
};

export default WalletContext;
