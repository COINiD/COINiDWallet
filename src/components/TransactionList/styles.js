import { StyleSheet, Platform } from 'react-native';
import { colors, fontWeight, fontSize } from '../../config/styling';

export default theme =>
  StyleSheet.create({
    batchedRowsContainer: {},
    batchedLine: {
      width: 2,
      backgroundColor: colors.getTheme(theme).fadedText,
      height: 10,
      left: 0,
      top: -4,
      borderRadius: 2,
      position: 'absolute',
    },
    container: {
      marginLeft: -16,
      marginRight: -16,
      paddingLeft: 16,
      paddingRight: 16,
      overflow: 'visible',
    },
    listHeader: {
      marginBottom: -3,
      overflow: 'visible',
      position: 'relative',
    },
    listHeaderTop: {
      paddingTop: 16,
      paddingBottom: 10,
      flexDirection: 'row',
      overflow: 'visible',
      backgroundColor: Platform.OS === 'ios' ? colors.getTheme(theme).seeThrough : colors.getTheme(theme).seeThrough,
    },
    subHeader: {
      flex: 3,
      fontSize: fontSize.h2,
      ...fontWeight.bold,
    },
    subLink: {
      color: colors.getTheme(theme).highlight,
      flex: 2,
      textAlign: 'right',
    },

    itemWrapper: {},
    itemContainer: {
      paddingHorizontal: 3,
      marginBottom: 3,
      height: 56,
      flexDirection: 'row',
      flex: 1,
    },
    infoContainer: {
      flex: 4,
      justifyContent: 'center',
    },
    topContainer: {
      flexDirection: 'row',
      marginBottom: 7,
    },
    icon: {
      marginRight: 16,
      width: 24,
      justifyContent: 'center',
    },

    amountText: {
      flex: 5,
      lineHeight: 19,
      ...fontWeight.medium,
    },
    positiveAmount: {
      color: colors.getTheme(theme).altPositive,
    },
    negativeAmount: {},
    dateText: {
      flex: 1,
      textAlign: 'right',
    },
    smallText: {
      color: colors.getTheme(theme).fadedText,
      fontSize: fontSize.small,
      lineHeight: 19,
    },
    unconfirmedText: {
      color: colors.red,
    },
    pendingText: {
      color: colors.lightOrange,
    },
    filterIndicator: {
      position: 'absolute',
      right: 24,
      top: 8,
      height: 8,
      width: 8,
      backgroundColor: colors.getTheme(theme).button,
      borderRadius: 4,
    },
  });
