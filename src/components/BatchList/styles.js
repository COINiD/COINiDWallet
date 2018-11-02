import { StyleSheet } from 'react-native';
import { colors, fontWeight, fontSize } from '../../config/styling';

export default StyleSheet.create({
  container: {
    marginHorizontal: -16,
    overflow: 'visible',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  itemContainer: {
    padding: 6,
    paddingHorizontal: 16,
  },
  firstItem: {
    paddingTop: 0,
  },
  line: {
    marginTop: 7,
  },
  infoContainer: { },
  topContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  icon: {
    marginRight: 16,
    width: 24,
    justifyContent: 'center',
  },
  amountText: {
    ...fontWeight.medium,
  },
  addressText: {
    fontSize: fontSize.small,
  },
  noteText: {
    fontSize: fontSize.small,
    color: colors.getTheme('light').fadedText,
    marginBottom: 6,
  },
});
