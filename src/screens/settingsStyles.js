import { StyleSheet } from 'react-native';
import { isIphoneX } from 'react-native-iphone-x-helper';
import {
  colors, fontSize, fontStack, fontWeight, layout,
} from '../config/styling';

export default theme => StyleSheet.create({
  list: {
    marginTop: 0,
    marginBottom: 24,
    borderTopWidth: 0,
  },
  listItemContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    height: 56,
    justifyContent: 'center',
    borderBottomColor: colors.getBorder(),
    borderBottomWidth: 0.5,
  },
  listItemTitle: {
    marginLeft: 0,
    marginRight: 14,
    fontFamily: fontStack.primary,
    fontSize: fontSize.base,
    color: colors.black,
    ...fontWeight.medium,
  },
  listItemRightTitle: {
    color: colors.gray,
  },
  listItemWrapper: {
    marginLeft: 0,
  },
  listItemDisabled: {
    opacity: 0.5,
  },
  listHint: {
    marginTop: -8,
    marginBottom: 24,
    fontSize: fontSize.small,
    color: colors.gray,
    ...fontWeight.normal,
  },
  listHeader: {
    marginTop: 0,
    marginBottom: 4,
    fontSize: fontSize.small,
    color: colors.black,
    ...fontWeight.normal,
  },
  logoWrapper: {
    marginBottom: isIphoneX() ? 23 : 11,
    width: 94.47,
    height: 33,
    alignSelf: 'center',
  },
});
