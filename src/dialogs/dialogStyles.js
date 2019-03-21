import { StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../config/styling';

export default theme => StyleSheet.create({
  modalContent: {
    flexDirection: 'column',
    padding: 16,
    paddingTop: 0,
    maxHeight: '100%',
    overflow: 'visible',
  },
  modalFooter: {
    alignItems: 'center',
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: colors.getTheme('light').border,
    marginTop: 8,
    paddingTop: 24,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  formItem: {
    width: '100%',
    padding: 0,
    marginBottom: 24,
  },
  formLabel: {
    color: colors.getTheme('light').fadedText,
    ...fontWeight.medium,
  },
  formInfo: {
    color: colors.getTheme('light').fadedText,
    fontSize: fontSize.small,
    ...fontWeight.normal,
    paddingTop: 8,
  },
  formItemRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  formItemInput: {
    color: colors.black,
    fontSize: fontSize.base,
    paddingBottom: 8,
    paddingTop: 4,
    paddingLeft: 0,
    paddingRight: 0,
    marginVertical: 0,
    flex: 1,
    ...fontWeight.normal,
  },
  formItemIcons: {
    flexDirection: 'row',
    marginRight: 0,
  },
  formItemIcon: {
    color: colors.getTheme('light').highlight,
    fontSize: 24,
    marginLeft: 8,
  },
  negativeBalance: {
    color: colors.red,
  },
});
