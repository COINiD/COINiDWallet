import { StyleSheet } from 'react-native';
import { colors, fontWeight, fontSize } from '../../config/styling';

export default StyleSheet.create({
  text: {
    fontSize: fontSize.smaller,
    color: colors.white,
    opacity: 0.6,
    ...fontWeight.normal,
  },
  header: {
    color: colors.white,
    ...fontWeight.medium,
  },
  content: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touch: {
    paddingHorizontal: 16,
  },
  container: {
    marginBottom: 8,
    marginHorizontal: -8,
    backgroundColor: colors.getTheme('light').button,
    borderRadius: 10,
    shadowRadius: 24,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
  },
  iconContainer: {
    position: 'absolute',
    right: 0,
  },
  counter: {
    color: colors.getTheme('light').button,
    backgroundColor: 'transparent',
    ...fontWeight.medium,
  },
  counterContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 0,
    backgroundColor: colors.getTheme('light').buttonText,
    height: 24,
    minWidth: 24,
    alignSelf: 'center',
    borderRadius: 12,
  },
});
