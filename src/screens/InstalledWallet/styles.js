import { StyleSheet, Platform } from 'react-native';
import { colors } from '../../config/styling';
import { ifIphoneX } from 'react-native-iphone-x-helper';

export default theme =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingTop: 24,
      paddingLeft: 16,
      paddingRight: 16,
      overflow: 'hidden',
      zIndex: 1,
    },
    topContainer: {
      paddingTop: 24,
      marginTop: -24,
      backgroundColor: Platform.OS === 'ios' ? colors.getTheme(theme).seeThrough : null,
      position: 'relative',
      zIndex: 10,
      paddingBottom: 16,
    },
    footer: {
      marginLeft: -16,
      marginRight: -16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 16,
      borderTopWidth: 1,
      borderColor: colors.getTheme(theme).border,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: Platform.OS === 'ios' ? colors.getTheme(theme).seeThrough : null,
      ...ifIphoneX(
        {
          marginBottom: -34,
          paddingBottom: 34,
          height: 50 + 34,
        },
        {},
      ),
    },
    footerIcon: {
      color: colors.getTheme(theme).highlight,
      marginLeft: 36,
      marginRight: 36,
    },
  });
