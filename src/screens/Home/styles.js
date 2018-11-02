import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from '../../config/styling';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerOuter: {
    borderBottomWidth: 0,
    height: 40,
    marginTop: 0,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  headerInner: {
    alignItems: 'flex-start',
  },
  headerNav: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 17,
    lineHeight: 20,
    marginBottom: 2,
  },
  logo: {
    marginLeft: 10,
    fontSize: 24,
    color: colors.white,
  },
  settingsBtn: {
    fontSize: 24,
    color: colors.white,
  },
  settingsBtnContainer: {
    padding: 6,
    zIndex: 10,
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dotStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotContainerStyle: {
    marginHorizontal: 3,
  },
  paginationContainerStyle: {
    paddingBottom: 0,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  paginator: {
    marginBottom: 3,
  },
  overlay: {
    backgroundColor: '#000',
    opacity: 0,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
