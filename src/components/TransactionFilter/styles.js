import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../config/styling';

export default theme => StyleSheet.create({
  container: {
    marginLeft: -16,
    marginRight: -16,
    paddingLeft: 16,
    paddingRight: 16,
    overflow: 'visible',
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 10,
  },
  listHeaderTop: {
    flexDirection: 'row',
    zIndex: 15
  },
  listHeaderFilter: {
    height: 91,
    top: -91,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Platform.OS === 'ios' ? colors.getTheme(theme).seeThrough : colors.getTheme(theme).seeThrough,
    paddingBottom: 10,
  },
  filterIcon: {
    color: colors.gray
  },
  filterIconCont: {
    position: 'absolute',
    bottom: 7,
    left: 6,
    zIndex: 11,
  },
  filterTextInput: {
    width: '100%',
    backgroundColor: colors.lighterGray,
    color: colors.gray,
    height: 36,
    paddingTop:0,
    paddingBottom:0,
    paddingLeft: 31,
    paddingRight: 26,
    borderRadius: 11,
    fontSize: 17,
    zIndex: 10,
  },
});
