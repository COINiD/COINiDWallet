import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors, layout } from '../config/styling';

export default theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
      height: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 13,
      paddingVertical: 0,
      paddingHorizontal: 10,
    },
    title: {
      color: colors.white,
      fontSize: 17,
      lineHeight: 20,
      marginBottom: 2,
      flex: 1,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      paddingTop: layout.paddingTop,
      paddingBottom: layout.paddingBottom,
      paddingLeft: layout.paddingLeft,
      paddingRight: layout.paddingRight,
      backgroundColor: colors.white,
      borderTopRightRadius: 16,
      borderTopLeftRadius: 16,
    },
    topContainer: {
      flex: 1,
    },
    bottomContainer: {},
    headerIconContainer: {
      zIndex: 10,
      padding: 10,
    },
    headerIcon: {
      color: colors.white,
      fontSize: 20,
      height: 20,
    },
    highlightText: {
      color: colors.getTheme(theme).highlight,
    },
    warningText: {
      color: colors.getTheme(theme).warning,
    },
  });
