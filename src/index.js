import React from 'react';

import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import COINiDWallet from './COINiDWallet';

const ActionSheetWrapper = () => (
  <ActionSheetProvider>
    <COINiDWallet />
  </ActionSheetProvider>
);

export default ActionSheetWrapper;
