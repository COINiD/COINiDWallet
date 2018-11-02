import { StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../config/styling';
import styleMerge from '../../utils/styleMerge';
import parentStyles from '../dialogStyles';

export default styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    loader: {
      marginBottom: 40,
      marginTop: 30,
    },
    amountText: {
      fontSize: fontSize.large,
      marginBottom: 4,
      textAlign: 'center',
      ...fontWeight.bold,
    },
    fiatText: {
      color: colors.gray,
      fontSize: fontSize.h2,
      marginBottom: 16,
      textAlign: 'center',
    },
    outgoing: {
      color: colors.orange,
    },
    incoming: {
      color: colors.green,
    },
    header: {
      marginTop: -16,
      paddingTop: 8,
      backgroundColor: 'rgba(255,255,255,0.95)',
      zIndex: 10,
    },
    footer: {
      height: 0,
      backgroundColor: 'rgba(255,255,255,0.95)',
    },
    row: {
      alignItems: 'stretch',
      flexDirection: 'row',
    },
    rowTitle: {
      color: colors.gray,
      marginTop: 8,
    },
    rowContainer: {
      flex: 1,
    },
    rowData: {
      flex: 1,
      textAlign: 'right',
    },
    rowText: {
      fontSize: 16,
    },
    separator: {
      height: 1,
      backgroundColor: '#D8D8D8',
      marginVertical: 16,
    },
  }),
);
