import { StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../config/styling';

export default StyleSheet.create({
  container: {
    height: 56,
    justifyContent: 'center',
    zIndex: 100,
    position: 'relative',
    backgroundColor: colors.getTheme('light').seeThrough,
    width: '100%',
  },
  title: {
    fontSize: fontSize.h3,
    textAlign: 'center',
    ...fontWeight.bold,
  },
  closeIconContainer: {
    position: 'absolute',
    zIndex: 10,
    right: 19,
    top: 19,
    margin: 0,
    padding: 0,
  },
  closeIconFont: {
    fontSize: 21,
  },
  moreIconContainer: {
    position: 'absolute',
    zIndex: 10,
    left: 19,
    top: 19,
    margin: 0,
    padding: 0,
  },
  moreIconFont: {
    fontSize: 21,
  },
});
