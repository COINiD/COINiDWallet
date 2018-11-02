import { StyleSheet } from 'react-native';
import { colors, fontWeight, fontSize } from '../../config/styling';

export default theme =>
  StyleSheet.create({
    container: {
      margin: 0,
    },
    coinText: {
      fontSize: fontSize.h1,
      padding: 0,
      margin: 0,
      ...fontWeight.black,
    },
    ticker: {
      ...fontWeight.normal,
    },
    currencyText: {
      color: colors.getTheme(theme).fadedText,
      fontSize: 28,
      lineHeight: 33,
      margin: 0,
    },
    positive: {
      color: colors.green,
    },
    negative: {
      color: colors.orange,
    },
  });
