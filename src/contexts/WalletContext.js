import React, { useContext } from 'react';

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

export const useWalletContext = () => useContext(WalletContext);

export default WalletContext;
