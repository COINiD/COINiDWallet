import { StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, fontStack } from '../../config/styling';

export default theme =>
  StyleSheet.create({
    slimButton: {
      height: 38,
    },
    button: {
      backgroundColor: colors.getTheme(theme).button,
      borderRadius: 8,
      flexDirection: 'row',
      flexGrow: 1,
      height: 48,
    },
    disabled: {
      backgroundColor: colors.getTheme(theme).disabledButton
    },
    linkButton: {
      backgroundColor: colors.getTheme(theme).linkButton,
    },
    linkText: {
      color: colors.getTheme(theme).linkButtonText,
    },
    bigButton: {
      height: 56,
    },
    buttonInner: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.getTheme(theme).buttonText,
      fontFamily: fontStack.primary,
      fontSize: fontSize.h3,
      alignSelf: 'center',
      ...fontWeight.medium,
    },
    loadingIndicator: {
      marginLeft: 5,
    },
  });
