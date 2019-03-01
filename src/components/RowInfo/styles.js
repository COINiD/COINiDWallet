import { StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  row: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  multiRow: {
    marginVertical: 8,
  },
  multiTitle: {
    marginBottom: 8,
  },
  rowTitle: {
    color: colors.getTheme('light').fadedText,
    flexShrink: 1,
  },
  rowText: {
    ...fontWeight.medium,
  },
  childStyle: { flexGrow: 1 },
  childTextStyle: {
    textAlign: 'right',
  },
  childMultiLineTextStyle: {},
});
