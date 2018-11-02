import { StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../config/styling';

export default theme =>
  StyleSheet.create({
    overlay: {
      backgroundColor: 'transparent',
      height: null,
    },
    modalContent: {
      flexDirection: 'column',
      padding: 16,
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
    title: {
      fontSize: fontSize.h3,
      textAlign: 'center',
      ...fontWeight.bold,
    },
    closeIconContainer: {
      position: 'absolute',
      zIndex: 200,
      right: 19,
      top: 19,
      margin: 0,
    },
    closeIconFont: {
      fontSize: 24,
    },
    headerContainer: {
      height: 56 + 8,
      justifyContent: 'center',
      marginTop: -16,
      zIndex: 100,
      position: 'relative',
      backgroundColor: colors.getTheme('light').seeThrough,
      width: '100%',
      paddingBottom: 8,
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
    negativeBalance: {
      color: colors.red,
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
      paddingTop: 8,
      flex: 1,
      ...fontWeight.normal,
    },
    formItemIcons: {
      flexDirection: 'row',
      marginRight: 10,
    },
    formItemIcon: {
      color: colors.getTheme('light').highlight,
      fontSize: 24,
      marginLeft: 20,
    },
  });
