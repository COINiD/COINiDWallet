import { StyleSheet } from 'react-native';
import { colors } from '../../config/styling';

export default (theme) => StyleSheet.create({
  altButton: {
    backgroundColor: colors.getTheme(theme).altCancelButton,
  },
  altButtonText: {
    color: colors.getTheme(theme).altCancelButtonText,
  },
  button: {
    backgroundColor: colors.getTheme(theme).cancelButton,
  },
  buttonText: {
    color: colors.getTheme(theme).cancelButtonText,
  },
});
