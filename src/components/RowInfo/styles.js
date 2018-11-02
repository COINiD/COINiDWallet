import { StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  row: {
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  multiRow: {
    marginVertical: 8,
  },
  multiTitle: {
    marginBottom: 8,
  },
  rowTitle: {
    color: colors.getTheme('light').fadedText,
  },
  rowText: {
    ...fontWeight.medium,
  },
  childTextStyle: {
    textAlign: 'right',
  },
  childMultiLineTextStyle: {},
});
