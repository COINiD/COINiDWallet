import { StyleSheet } from 'react-native';
import { colors, fontWeight, fontSize } from '../../config/styling';

export default theme =>
  StyleSheet.create({
    container: {
      // borderBottomWidth: .5,
      // borderBottomColor: colors.getBorder(),
      paddingTop: 8,
      paddingBottom: 16,
    },
    graphHeader: {
      marginBottom: 18,
    },
    textContainer: {
      alignItems: 'stretch',
      flexDirection: 'row',
    },
    coinTitle: {
      marginRight: 4,
      marginBottom: 6,
      ...fontWeight.bold,
    },
    coinText: {
      fontSize: fontSize.h2,
      ...fontWeight.normal,
    },
    coinTicker: {
      color: colors.getTheme(theme).fadedText,
    },
    coinDiffContainer: {
      flex: 1,
    },
    coinDiff: {
      textAlign: 'right',
    },
    currencyText: {
      color: colors.getTheme(theme).fadedText,
      fontSize: fontSize.small,
      ...fontWeight.normal,
    },
    positive: {
      color: colors.green,
    },
    negative: {
      color: colors.orange,
    },
  });
