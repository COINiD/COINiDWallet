import COINiDNotFound from '../dialogs/COINiDNotFound';
import SetupWallet from '../dialogs/SetupWallet';
import SelectAddressType from '../dialogs/SelectAddressType';
import InputPublicKey from '../dialogs/InputPublicKey';
import SelectColdTransportType from '../dialogs/SelectColdTransportType';
import QRDataSender from '../dialogs/QRDataSender';
import ValidateAddress from '../dialogs/ValidateAddress';
import SweepPrivateKey from '../dialogs/SweepPrivateKey';
import SweepKeyDetails from '../dialogs/SweepKeyDetails';
import Receive from '../dialogs/Receive';
import TransactionDetails from '../dialogs/TransactionDetails';
import Send from '../dialogs/Send';
import Sign from '../dialogs/Sign';

export const dialogRoutes = {
  COINiDNotFound: {
    DialogComponent: COINiDNotFound,
    defaultProps: { title: 'COINiD Vault not installed' },
  },
  SetupWallet: {
    DialogComponent: SetupWallet,
    defaultProps: { title: 'Setup your wallet' },
  },
  SelectAddressType: {
    DialogComponent: SelectAddressType,
    defaultProps: { title: 'Select address type' },
  },
  InputPublicKey: {
    DialogComponent: InputPublicKey,
    defaultProps: {
      title: 'Enter public Key',
      avoidKeyboard: true,
    },
  },
  SelectColdTransportType: {
    DialogComponent: SelectColdTransportType,
    defaultProps: { title: 'Choose how to connect' },
  },
  QRDataSender: {
    DialogComponent: QRDataSender,
    defaultProps: { title: 'QR transfer to Vault' },
  },
  ValidateAddress: {
    DialogComponent: ValidateAddress,
    defaultProps: { title: 'Validate address' },
  },
  SweepPrivateKey: {
    DialogComponent: SweepPrivateKey,
    defaultProps: { title: 'Sweep private key' },
  },
  SweepKeyDetails: {
    DialogComponent: SweepKeyDetails,
    defaultProps: { title: 'Private key details' },
  },
  Receive: {
    DialogComponent: Receive,
    defaultProps: {
      title: 'Receive',
      verticalPosition: 'flex-end',
      showMoreOptions: true,
      avoidKeyboard: true,
    },
  },
  TransactionDetails: {
    DialogComponent: TransactionDetails,
    defaultProps: {
      title: 'Transaction details',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  Send: {
    DialogComponent: Send,
    defaultProps: {
      title: 'Send',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  EditTransaction: {
    DialogComponent: Send,
    defaultProps: {
      title: 'Edit transaction',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  Sign: {
    DialogComponent: Sign,
    defaultProps: {
      title: 'Sign transactions',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
};
