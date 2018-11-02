import { StyleSheet } from 'react-native';
import { colors, fontStack, fontWeight, fontSize } from '../../config/styling';

export default theme =>
  StyleSheet.create({
    text: {
      color: colors.getTheme(theme).text,
      fontFamily: fontStack.primary,
      fontSize: fontSize.base,
      backgroundColor: 'transparent',
      ...fontWeight.normal,
    },
    p: {
      lineHeight: 22,
    },
    h1: {
      fontSize: fontSize.h1,
      lineHeight: 48,
      ...fontWeight.black,
    },
    h2: {
      fontSize: fontSize.h2,
      lineHeight: 26,
    },
    h3: {
      fontSize: fontSize.h3,
    },
    h4: {
      fontSize: fontSize.h4,
    },
    small: {
      fontSize: fontSize.small,
    },
    smaller: {
      fontSize: fontSize.smaller,
    },
    margin: {
      marginBottom: 16,
    },
    center: {
      textAlign: 'center',
    },
  });
