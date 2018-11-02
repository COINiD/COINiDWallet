import { StyleSheet } from 'react-native';
import { colors, fontWeight } from '../../config/styling';

export default theme =>
  StyleSheet.create({
    container: {
      padding: 16,
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
    },
    hotLottieWrapper: {
      width: 88,
      height: 146,
      marginTop: 16,
      marginBottom: 16,
    },
    coldLottieWrapper: {
      width: 200,
      height: 146,
      marginTop: 16,
      marginBottom: 16,
    },
    disabledButton: {
      opacity: 0.5,
    },
    title: {
      marginBottom: 16,
      textAlign: 'center',
    },
    subTitle: {
      textAlign: 'center',
      marginBottom: 16,
    },
    paragraph: {
      textAlign: 'center',
      marginBottom: 16,
    },
    linkWrapper: {
      height: 30,
      marginBottom: 20,
      alignItems: 'center',
      flexDirection: 'row',
    },
    link: {
      fontSize: 16,
      color: '#617AF7',
      ...fontWeight.normal,
    },
    linkIcon: {
      height: 30,
      width: 30,
      marginLeft: 16,
    },
    buttonContainer: {
      width: '100%',
      paddingVertical: 16,
      backgroundColor: colors.getTheme(theme).background,
    },
    scrollView: {
      flex: 1,
      marginHorizontal: -16,
      paddingHorizontal: 16,
    },
    scrollViewContainer: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  });
