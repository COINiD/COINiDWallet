import { StyleSheet } from 'react-native';
import {
  colors, fontWeight, fontSize, gridMultiplier,
} from '../../config/styling';
import styleMerge from '../../utils/styleMerge';
import parentStyles from '../dialogStyles';

export default styleMerge(
  parentStyles('light'),
  StyleSheet.create({
    secondTitle: {
      textAlign: 'center',
      fontSize: fontSize.h3,
      lineHeight: fontSize.h3 * 1.2,
      marginBottom: gridMultiplier * 2,
      ...fontWeight.medium,
    },
    balance: {
      marginBottom: gridMultiplier * 1,
      textAlign: 'center',
      color: colors.purple,
      fontSize: fontSize.large,
      lineHeight: fontSize.large * 1.2,
      ...fontWeight.bold,
    },
    fiatBalance: {
      marginBottom: gridMultiplier * 2 - 2,
      textAlign: 'center',
      color: colors.gray,
      fontSize: fontSize.h2,
      lineHeight: fontSize.large * 1.2,
      ...fontWeight.normal,
    },
    detailItem: {
      paddingVertical: gridMultiplier * 1,
      paddingHorizontal: gridMultiplier * 2,
    },
    detailItemFirst: {
      paddingTop: gridMultiplier * 1,
    },
    detailItemBalance: {
      fontSize: fontSize.base,
      lineHeight: fontSize.base * 1.2,
      ...fontWeight.medium,
      marginBottom: gridMultiplier * 1 - 2,
    },
    feeWrapper: {
      marginBottom: gridMultiplier * 2,
    },
    totalWrapper: {
      marginBottom: gridMultiplier * 3,
    },
    detailItemAddress: {
      fontSize: fontSize.small,
      lineHeight: fontSize.small * 1.2,
    },
    addressContainerWrapper: {
      marginHorizontal: -gridMultiplier * 2,
      marginTop: gridMultiplier * 1,
    },
    addressContainer: {},
    addressContainerContent: {
      marginTop: -gridMultiplier * 1,
      marginBottom: gridMultiplier * 1,
    },
    horizontalBorder: {
      height: 1,
      marginBottom: gridMultiplier * 3,
      paddingHorizontal: gridMultiplier * 2,
      marginHorizontal: -gridMultiplier * 2,
      backgroundColor: colors.lightGray,
    },
    overlay: {
      backgroundColor: 'transparent',
      height: null,
    },
    container: {
      marginBottom: gridMultiplier * 2,
      marginHorizontal: gridMultiplier * 2,
    },
    cancelButton: {
      backgroundColor: colors.red,
    },
  }),
);
