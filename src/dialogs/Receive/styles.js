import { Platform, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../config/styling';
import styleMerge from '../../utils/styleMerge';
import parentStyles from '../dialogStyles';

export default styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    // Custom Modal style
    qrCode: {
      marginTop: 12,
      marginBottom: 24,
      alignItems: 'center',
    },
    addressText: {
      fontSize: fontSize.small,
      textAlign: 'center',
    },
    smallText: {
      color: colors.getTheme('light').fadedText,
      margin: 0,
      width: '100%',
      ...fontWeight.medium,
    },
    amountForm: {
      borderBottomWidth: 1,
      borderBottomColor: colors.gray,
      flexDirection: 'row',
      paddingTop: 6,
    },
    amountInput: {
      color: colors.black,
      fontSize: fontSize.base,
      paddingBottom: 8,
      flex: 1,
      ...fontWeight.normal,
    },
    amountCurrency: {
      color: colors.getTheme('light').fadedText,
      paddingTop: Platform.OS === 'ios' ? 0 : 13,
      paddingLeft: 8,
    },
    currencyButton: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      borderWidth: 1,
      borderColor: colors.purple,
      borderRadius: 8,
      paddingTop: 6,
      paddingBottom: 5,
      paddingHorizontal: 7,
      marginBottom: 8,
    },
    currencyButtonText: {
      color: '#617AF7',
      ...fontWeight.medium,
      letterSpacing: 0.1,
    },
  }),
);
