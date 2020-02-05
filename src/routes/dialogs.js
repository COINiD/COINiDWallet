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
import SignMessage from '../dialogs/SignMessage';
import VerifyMessage from '../dialogs/VerifyMessage';

export const dialogRoutes = {
  COINiDNotFound: {
    DialogComponent: COINiDNotFound,
    defaultProps: { title: 'dialogs.coinidnotinstalled' },
  },
  SetupWallet: {
    DialogComponent: SetupWallet,
    defaultProps: { title: 'dialogs.setupwallet' },
  },
  SelectAddressType: {
    DialogComponent: SelectAddressType,
    defaultProps: { title: 'dialogs.selectaddresstype' },
  },
  InputPublicKey: {
    DialogComponent: InputPublicKey,
    defaultProps: {
      title: 'dialogs.enterpublickey',
      avoidKeyboard: true,
    },
  },
  SelectColdTransportType: {
    DialogComponent: SelectColdTransportType,
    defaultProps: { title: 'dialogs.howtoconnect' },
  },
  QRDataSender: {
    DialogComponent: QRDataSender,
    defaultProps: { title: 'dialogs.qrtransfertovault' },
  },
  ValidateAddress: {
    DialogComponent: ValidateAddress,
    defaultProps: { title: 'dialogs.validateaddress' },
  },
  SweepPrivateKey: {
    DialogComponent: SweepPrivateKey,
    defaultProps: { title: 'dialogs.sweepprivatekey' },
  },
  SweepKeyDetails: {
    DialogComponent: SweepKeyDetails,
    defaultProps: { title: 'dialogs.privatekeydetails' },
  },
  Receive: {
    DialogComponent: Receive,
    defaultProps: {
      title: 'dialogs.receive',
      verticalPosition: 'flex-end',
      showMoreOptions: true,
      avoidKeyboard: true,
    },
  },
  TransactionDetails: {
    DialogComponent: TransactionDetails,
    defaultProps: {
      title: 'dialogs.transactiondetails',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  Send: {
    DialogComponent: Send,
    defaultProps: {
      title: 'dialogs.send',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  EditTransaction: {
    DialogComponent: Send,
    defaultProps: {
      title: 'dialogs.edittransaction',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  Sign: {
    DialogComponent: Sign,
    defaultProps: {
      title: 'dialogs.signtransaction',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  SignMessage: {
    DialogComponent: SignMessage,
    defaultProps: {
      title: 'dialogs.signmessage',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
    },
  },
  VerifyMessage: {
    DialogComponent: VerifyMessage,
    defaultProps: {
      title: 'dialogs.verifymessage',
      verticalPosition: 'flex-end',
      avoidKeyboard: true,
      showMoreOptions: true,
    },
  },
};
