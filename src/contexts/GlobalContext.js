import React from 'react';

const GlobalContext = React.createContext({
  hasCOINiD: false,
  isBLESupported: false,
});

export default GlobalContext;
